import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateText, generateContentWithImage, streamContent } from '../config/gemini.js';
import { protect } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Extract text from PDF
async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF extraction error:', error);
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
    console.error('Image analysis error:', error);
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
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
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
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    // Clean up file after processing
    await fs.unlink(filePath);

    res.json({
      success: true,
      fileId: req.file.filename,
      content: content.substring(0, 10000) // Limit content length
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process file' });
  }
});

// Chat message endpoint
router.post('/message', protect, async (req, res) => {
  try {
    const { message, files, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

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

    res.json({
      success: true,
      reply: reply
    });
  } catch (error) {
    console.error('Chat error:', error.message);
    // Sanitize error message to prevent API key leaks
    let errorMessage = error.message || 'Failed to process message';
    errorMessage = errorMessage.replace(/key=[A-Za-z0-9_-]+/gi, 'key=***HIDDEN***');
    
    res.status(500).json({ 
      error: 'Failed to process message',
      details: errorMessage 
    });
  }
});

// SSE streaming chat endpoint — sends tokens as they're generated
router.post('/stream', protect, async (req, res) => {
  const { message, files, conversationHistory } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

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

export default router;
