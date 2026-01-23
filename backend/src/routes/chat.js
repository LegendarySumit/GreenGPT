import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateText, generateContentWithImage } from '../config/gemini.js';

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
router.post('/upload', upload.single('file'), async (req, res) => {
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
router.post('/message', async (req, res) => {
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
    const systemPrompt = `You are GreenGPT, an AI environmental assistant specialized in analyzing environmental documents, pollution reports, and compliance data. 

Your capabilities:
- Analyze environmental documents and extract key insights
- Identify pollution sources, violations, and compliance issues
- Provide actionable recommendations based on environmental regulations
- Compare data across multiple documents
- Explain environmental concepts clearly

Guidelines:
- Be precise and factual
- Cite specific data points from documents when available
- Provide structured, easy-to-understand responses
- Highlight critical environmental concerns
- Suggest practical remediation steps

${context}${historyText}

User Question: ${message}

Provide a helpful, detailed response:`;

    // Call Gemini API
    const reply = await generateText(systemPrompt);

    res.json({
      success: true,
      reply: reply
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      details: error.message 
    });
  }
});

export default router;
