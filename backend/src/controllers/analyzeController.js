import { extractTextFromPDF } from "../utils/pdfReader.js";
import { generateContent } from "../config/gemini.js";
import { environmentPrompt } from "../prompts/environmentPrompt.js";
import { extractJSON } from "../utils/jsonCleaner.js";

export const analyzeDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const text = await extractTextFromPDF(req.file.buffer);
    const truncatedText = text.substring(0, 12000);

    const prompt = environmentPrompt(truncatedText);

    const result = await generateContent(prompt);

    const aiText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
      throw new Error("No response from AI");
    }

    // Extract and parse JSON from AI response
    const analysis = extractJSON(aiText);

    res.json({
      success: true,
      analysis: analysis
    });

  } catch (error) {
    console.error("GEMINI ERROR:", error.message);
    // Sanitize error message to remove any potential API key leaks
    let errorMessage = error.message || "AI analysis failed";
    errorMessage = errorMessage.replace(/key=[A-Za-z0-9_-]+/gi, 'key=***HIDDEN***');
    
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
};
