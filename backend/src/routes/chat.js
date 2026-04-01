import express from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import pdfParse from 'pdf-parse';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateText, generateContentWithImage, streamContent } from '../config/gemini.js';
import { protect } from '../middleware/auth.js';
import { validateChatPayload } from '../middleware/validation.js';
import { enforceQuota } from '../middleware/quota.js';
import { sendError, sendSuccess } from '../utils/apiResponse.js';
import { hashUserId, logError, logWarn } from '../utils/logging.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
const MAX_UPLOAD_BYTES = Number(process.env.MAX_UPLOAD_BYTES || 50 * 1024 * 1024);
const UPLOAD_RETENTION_MS = Number(process.env.UPLOAD_RETENTION_MS || 24 * 60 * 60 * 1000);

const ALLOWED_MIME_EXTENSIONS = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'video/mp4': ['.mp4'],
  'video/webm': ['.webm'],
  'video/quicktime': ['.mov'],
};

const router = express.Router();
const chatRateLimitConfig = {
  windowMs: Number(process.env.CHAT_RATE_WINDOW_MS || 60_000),
  limit: Number(process.env.CHAT_RATE_MAX || 120),
  standardHeaders: true,
  legacyHeaders: false,
};

const sanitizeFilename = (originalName = 'file') => {
  const ext = path.extname(originalName).toLowerCase();
  const name = path
    .basename(originalName, ext)
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 80);

  return {
    safeExt: ext,
    safeName: name || 'upload',
  };
};

const isAllowedUpload = (file) => {
  const { safeExt } = sanitizeFilename(file.originalname || '');
  const allowedExt = ALLOWED_MIME_EXTENSIONS[file.mimetype];
  return Array.isArray(allowedExt) && allowedExt.includes(safeExt);
};

const ensureUploadDir = async () => {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
};

const resolveSafeUploadPath = (filename) => {
  const safeFilename = path.basename(String(filename || ''));
  const resolvedPath = path.resolve(UPLOAD_DIR, safeFilename);
  const resolvedUploadDir = path.resolve(UPLOAD_DIR);

  if (!resolvedPath.startsWith(`${resolvedUploadDir}${path.sep}`)) {
    throw new Error('Invalid upload path');
  }

  return resolvedPath;
};

const pruneExpiredUploads = async () => {
  try {
    await ensureUploadDir();
    const files = await fs.readdir(UPLOAD_DIR);
    const now = Date.now();

    await Promise.all(
      files.map(async (entry) => {
        const targetPath = path.join(UPLOAD_DIR, entry);
        const stat = await fs.stat(targetPath);
        if (stat.isFile() && now - stat.mtimeMs > UPLOAD_RETENTION_MS) {
          await fs.unlink(targetPath).catch(() => {});
        }
      })
    );
  } catch (error) {
    logWarn('upload_cleanup_warning', { message: error.message });
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await ensureUploadDir();
    } catch (error) {
      logError('upload_dir_create_failed', error);
    }
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const { safeName, safeExt } = sanitizeFilename(file.originalname || 'file');
    cb(null, `${Date.now()}-${safeName}${safeExt}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (!isAllowedUpload(file)) {
      cb(new Error('Unsupported file type'));
      return;
    }
    cb(null, true);
  },
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 }
});

// Extract text from PDF
async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    logError('pdf_extract_failed', error);
    throw error;
  }
}

// Extract text from image using Gemini Vision
async function extractTextFromImage(filePath, mimeType) {
  try {
    const imageData = await fs.readFile(filePath);
    const base64Image = imageData.toString('base64');
    
    const prompt = "Analyze this image for environmental concerns. Identify any pollution, violations, or environmental issues visible. Provide detailed observations.";
    return await generateContentWithImage(prompt, base64Image, mimeType);
  } catch (error) {
    logError('image_analysis_failed', error);
    throw error;
  }
}

// Analyze video (extract frame and analyze)
async function analyzeVideo(filePath) {
  // For MVP, we'll return a placeholder
  // In production, you'd use ffmpeg to extract frames and analyze them
  return "Video analysis feature: This video has been uploaded and can be analyzed for environmental violations. Frame-by-frame analysis would detect activities like illegal dumping, deforestation, or pollution events.";
}

// Upload endpoint
router.post('/upload', rateLimit(chatRateLimitConfig), protect, enforceQuota('upload'), upload.single('file'), async (req, res) => {
  let filePath;
  try {
    if (!req.file) {
      return sendError(res, {
        status: 400,
        message: 'No file uploaded',
        code: 'VALIDATION_ERROR',
      });
    }

    filePath = resolveSafeUploadPath(req.file.filename);
    const fileType = req.file.mimetype;
    let content = '';

    // Process based on file type
    if (fileType === 'application/pdf') {
      content = await extractTextFromPDF(filePath);
    } else if (fileType.startsWith('image/')) {
      content = await extractTextFromImage(filePath, fileType);
    } else if (fileType.startsWith('video/')) {
      content = await analyzeVideo(filePath);
    } else {
      return sendError(res, {
        status: 400,
        message: 'Unsupported file type',
        code: 'VALIDATION_ERROR',
      });
    }

    return sendSuccess(res, {
      fileId: req.file.filename,
      content: content.substring(0, 10000) // Limit content length
    });
  } catch (error) {
    logError('chat_upload_failed', error, {
      requestId: req.requestId,
      userHash: hashUserId(req.user?.id),
    });
    return sendError(res, {
      status: 500,
      message: 'Failed to process file',
      code: 'UPLOAD_FAILED',
    });
  } finally {
    if (filePath) {
      await fs.unlink(filePath).catch(() => {});
    }
    pruneExpiredUploads().catch(() => {});
  }
});

// Chat message endpoint
router.post('/message', rateLimit(chatRateLimitConfig), protect, enforceQuota('chat'), validateChatPayload, async (req, res) => {
  try {
    const { message, files, conversationHistory } = req.body;

    // Build context from uploaded files
    let context = '';
    if (files && files.length > 0) {
      context = '\n\n=== UPLOADED DOCUMENTS CONTEXT ===\n';
      files.forEach((file, idx) => {
        context += `\n--- Document ${idx + 1}: ${file.name} ---\n${file.content}\n`;
      });
      context += '\n=== END OF CONTEXT ===\n\n';
    }

    // Build conversation history
    let historyText = '';
    if (conversationHistory && conversationHistory.length > 0) {
      historyText = '\n\n=== CONVERSATION HISTORY ===\n';
      conversationHistory.forEach(msg => {
        if (msg.role === 'user') {
          historyText += `User: ${msg.content}\n`;
        } else if (msg.role === 'assistant') {
          historyText += `Assistant: ${msg.content}\n`;
        }
      });
      historyText += '=== END OF HISTORY ===\n\n';
    }

    // Create enhanced prompt
    const systemPrompt = `You are GreenGPT, a specialised AI assistant dedicated exclusively to environmental topics worldwide.

STRICT SCOPE — TOPIC GATING:
You ONLY respond to questions and discussions that fall within the following topics:
  • Environmental science, ecology, and natural ecosystems
  • Air quality, water quality, soil contamination, and pollution
  • Climate change, global warming, carbon emissions, and greenhouse gases
  • Biodiversity, wildlife conservation, deforestation, and habitat loss
  • Environmental laws, regulations, treaties, and compliance (any country or international body — UNEP, Paris Agreement, EU Green Deal, US EPA, India CPCB/NGT, etc.)
  • Renewable energy, sustainability, and green infrastructure
  • Environmental impact assessments and pollution reports
  • Waste management, recycling, and circular economy
  • Oceans, rivers, glaciers, and water bodies
  • Environmental health — effects of pollution on human and animal health

OFF-TOPIC REFUSAL RULE:
If the user asks about ANYTHING outside the above scope — including but not limited to:
  cryptocurrency, Bitcoin, finance, stocks, software development, hardware, gaming,
  sports, entertainment, politics (non-environmental), cooking, fashion, or any other
  non-environmental subject — you must respond with exactly this format:

  "I'm GreenGPT, your dedicated environmental AI assistant. I'm only able to help with topics related to the environment, nature, climate, pollution, sustainability, and environmental policy. For anything outside that scope, please use a general-purpose AI assistant. 🌿

  Is there an environmental question I can help you with?"

  Do NOT attempt to answer the off-topic question, even partially.

YOUR CAPABILITIES (within scope):
- Analyse environmental documents and extract key insights
- Identify pollution sources, violations, and compliance issues worldwide
- Explain environmental regulations from any country or international treaty
- Provide actionable recommendations for environmental remediation
- Discuss climate science, biodiversity, and sustainability strategies
- Answer questions about real-world environmental events and data

RESPONSE GUIDELINES:
- For list-style answers: write a one-line intro sentence, then each point on its own line using markdown list syntax — start each line with "- " (hyphen space). 3 to 5 points max.
- For simple definitions or yes/no answers: write a single short paragraph — no list needed.
- Answer ONLY what was directly asked. Do not add extra sections, background history, or unrelated context.
- If the user asks for "N points", give a maximum of 5 points regardless of what number they requested.
- Always write complete sentences — never stop mid-sentence.
- Be precise and factual.
- MANDATORY after every answer — add one blank line then this block exactly:

  **Explore more:**
  - [short follow-up question]
  - [short follow-up question]
  - [short follow-up question]

FEW-SHOT EXAMPLES — match this format exactly:

Example 1 — definition question
User: What is land degradation?
GreenGPT: Land degradation is the decline in land quality due to human activities, reducing productivity and ecological function. Key causes include:
- Overgrazing that strips vegetation and compacts soil.
- Deforestation leaving soil exposed to erosion.
- Unsustainable farming practices that deplete nutrients.
- Industrial pollution contaminating topsoil.

**Explore more:**
- How does land degradation affect food security?
- Which regions suffer the most land degradation?
- What are the best restoration techniques?

Example 2 — treaty/policy question
User: What is the Paris Agreement?
GreenGPT: The Paris Agreement is a 2015 UN climate treaty signed by 196 countries. Key points:
- Limits global warming to well below 2°C above pre-industrial levels.
- Aims to pursue efforts to stay under 1.5°C.
- Each country submits Nationally Determined Contributions (NDCs).
- Progress is reviewed every 5 years through a "Global Stocktake".

**Explore more:**
- Which countries have not ratified the Paris Agreement?
- What are Nationally Determined Contributions?
- How is Paris Agreement progress tracked?

Example 3 — "how to" action question
User: How to stop soil pollution?
GreenGPT: Soil pollution can be reduced through several targeted measures:
- Ban or restrict harmful pesticides and industrial chemicals.
- Enforce strict industrial waste disposal and treatment laws.
- Adopt organic farming to eliminate synthetic inputs.
- Use bioremediation to clean already-contaminated land.
- Improve e-waste and hazardous waste collection systems.

**Explore more:**
- What industries pollute soil the most?
- How does bioremediation clean contaminated soil?
- What international laws protect soil quality?

${context}${historyText}

User Question: ${message}

Answer the question above concisely and directly (or give the off-topic refusal if applicable):`;


    // Call Gemini API
    const reply = await generateText(systemPrompt);

    return sendSuccess(res, {
      reply: reply
    });
  } catch (error) {
    logError('chat_message_failed', error, {
      requestId: req.requestId,
      userHash: hashUserId(req.user?.id),
    });
    // Sanitize error message to prevent API key leaks
    let errorMessage = error.message || 'Failed to process message';
    errorMessage = errorMessage.replace(/key=[A-Za-z0-9_-]+/gi, 'key=***HIDDEN***');
    
    return sendError(res, {
      status: 500,
      message: 'Failed to process message',
      code: 'CHAT_FAILED',
      details: errorMessage,
    });
  }
});

// SSE streaming chat endpoint — sends tokens as they're generated
router.post('/stream', rateLimit(chatRateLimitConfig), protect, enforceQuota('chat'), validateChatPayload, async (req, res) => {
  const { message, files, conversationHistory } = req.body;

  // Build context from uploaded files (same as /message)
  let context = '';
  if (files && files.length > 0) {
    context = '\n\n=== UPLOADED DOCUMENTS CONTEXT ===\n';
    files.forEach((file, idx) => {
      context += `\n--- Document ${idx + 1}: ${file.name} ---\n${file.content}\n`;
    });
    context += '\n=== END OF CONTEXT ===\n\n';
  }

  // Build conversation history (same as /message)
  let historyText = '';
  if (conversationHistory && conversationHistory.length > 0) {
    historyText = '\n\n=== CONVERSATION HISTORY ===\n';
    conversationHistory.forEach(msg => {
      if (msg.role === 'user')      historyText += `User: ${msg.content}\n`;
      else if (msg.role === 'assistant') historyText += `Assistant: ${msg.content}\n`;
    });
    historyText += '=== END OF HISTORY ===\n\n';
  }

  const systemPrompt = `You are GreenGPT, a specialised AI assistant dedicated exclusively to environmental topics worldwide.

STRICT SCOPE — TOPIC GATING:
You ONLY respond to questions and discussions that fall within the following topics:
  • Environmental science, ecology, and natural ecosystems
  • Air quality, water quality, soil contamination, and pollution
  • Climate change, global warming, carbon emissions, and greenhouse gases
  • Biodiversity, wildlife conservation, deforestation, and habitat loss
  • Environmental laws, regulations, treaties, and compliance (any country or international body — UNEP, Paris Agreement, EU Green Deal, US EPA, India CPCB/NGT, etc.)
  • Renewable energy, sustainability, and green infrastructure
  • Environmental impact assessments and pollution reports
  • Waste management, recycling, and circular economy
  • Oceans, rivers, glaciers, and water bodies
  • Environmental health — effects of pollution on human and animal health

OFF-TOPIC REFUSAL RULE:
If the user asks about ANYTHING outside the above scope — including but not limited to:
  cryptocurrency, Bitcoin, finance, stocks, software development, hardware, gaming,
  sports, entertainment, politics (non-environmental), cooking, fashion, or any other
  non-environmental subject — you must respond with exactly this format:

  "I'm GreenGPT, your dedicated environmental AI assistant. I'm only able to help with topics related to the environment, nature, climate, pollution, sustainability, and environmental policy. For anything outside that scope, please use a general-purpose AI assistant. 🌿

  Is there an environmental question I can help you with?"

  Do NOT attempt to answer the off-topic question, even partially.

YOUR CAPABILITIES (within scope):
- Analyse environmental documents and extract key insights
- Identify pollution sources, violations, and compliance issues worldwide
- Explain environmental regulations from any country or international treaty
- Provide actionable recommendations for environmental remediation
- Discuss climate science, biodiversity, and sustainability strategies
- Answer questions about real-world environmental events and data

RESPONSE GUIDELINES:
- For list-style answers: write a one-line intro sentence, then each point on its own line using markdown list syntax — start each line with "- " (hyphen space). 3 to 5 points max.
- For simple definitions or yes/no answers: write a single short paragraph — no list needed.
- Answer ONLY what was directly asked. Do not add extra sections, background history, or unrelated context.
- If the user asks for "N points", give a maximum of 5 points regardless of what number they requested.
- Always write complete sentences — never stop mid-sentence.
- Be precise and factual.
- MANDATORY after every answer — add one blank line then this block exactly:

  **Explore more:**
  - [short follow-up question]
  - [short follow-up question]
  - [short follow-up question]

FEW-SHOT EXAMPLES — match this format exactly:

Example 1 — definition question
User: What is land degradation?
GreenGPT: Land degradation is the decline in land quality due to human activities, reducing productivity and ecological function. Key causes include:
- Overgrazing that strips vegetation and compacts soil.
- Deforestation leaving soil exposed to erosion.
- Unsustainable farming practices that deplete nutrients.
- Industrial pollution contaminating topsoil.

**Explore more:**
- How does land degradation affect food security?
- Which regions suffer the most land degradation?
- What are the best restoration techniques?

Example 2 — treaty/policy question
User: What is the Paris Agreement?
GreenGPT: The Paris Agreement is a 2015 UN climate treaty signed by 196 countries. Key points:
- Limits global warming to well below 2°C above pre-industrial levels.
- Aims to pursue efforts to stay under 1.5°C.
- Each country submits Nationally Determined Contributions (NDCs).
- Progress is reviewed every 5 years through a "Global Stocktake".

**Explore more:**
- Which countries have not ratified the Paris Agreement?
- What are Nationally Determined Contributions?
- How is Paris Agreement progress tracked?

Example 3 — "how to" action question
User: How to stop soil pollution?
GreenGPT: Soil pollution can be reduced through several targeted measures:
- Ban or restrict harmful pesticides and industrial chemicals.
- Enforce strict industrial waste disposal and treatment laws.
- Adopt organic farming to eliminate synthetic inputs.
- Use bioremediation to clean already-contaminated land.
- Improve e-waste and hazardous waste collection systems.

**Explore more:**
- What industries pollute soil the most?
- How does bioremediation clean contaminated soil?
- What international laws protect soil quality?

${context}${historyText}

User Question: ${message}

Answer the question above concisely and directly (or give the off-topic refusal if applicable)`;

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  await streamContent(
    systemPrompt,
    (chunk) => res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`),
    ()      => { res.write('data: [DONE]\n\n'); res.end(); },
    (err)   => { res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`); res.end(); }
  );
});

router.use((err, req, res, next) => {
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return sendError(res, {
      status: 413,
      message: `Upload exceeds max size (${MAX_UPLOAD_BYTES} bytes)`,
      code: 'PAYLOAD_TOO_LARGE',
    });
  }

  if (err?.message === 'Unsupported file type') {
    return sendError(res, {
      status: 400,
      message: err.message,
      code: 'VALIDATION_ERROR',
    });
  }

  next(err);
});

export default router;
