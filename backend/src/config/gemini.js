import axios from "axios";

// Helper function to sanitize error messages (remove API key)
const sanitizeError = (error) => {
  const message = error.response?.data?.error?.message || error.message || "AI request failed";
  // Remove any API key from error messages
  return message.replace(/key=[A-Za-z0-9_-]+/gi, 'key=***HIDDEN***');
};

// Build fallback model chain for robustness
const buildModelFallbackChain = (requestedModel = "") => {
  const trimmed = requestedModel.trim() || "gemini-1.5-flash";
  const candidates = [trimmed];

  if (!candidates.includes("gemini-1.5-flash")) {
    candidates.push("gemini-1.5-flash");
  }

  return [...new Set(candidates.filter(Boolean))];
};

// Generate content using Gemini API - returns raw response
export const generateContent = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelPreference = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const baseUrl = process.env.GEMINI_API_URL || "https://generativelanguage.googleapis.com/v1beta";
  
  if (!apiKey) {
    throw new Error("Gemini API key is not configured");
  }

  const modelsToTry = buildModelFallbackChain(modelPreference);

  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const url = `${baseUrl}/models/${model}:generateContent?key=${apiKey}`;
      
      const response = await axios.post(
        url,
        {
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 30000 // 30 second timeout
        }
      );
      
      return response.data;
    } catch (error) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.error?.message || error.message;

      // Check if model not found and try next one
      const missingModel =
        status === 404 || /not found/i.test(message) || /not supported/i.test(message);

      if (missingModel && model !== modelsToTry[modelsToTry.length - 1]) {
        console.warn(`Model ${model} not available, trying next...`);
        lastError = error;
        continue;
      }

      // If it's the last model or a different error, throw
      const sanitizedMessage = sanitizeError(error);
      throw new Error(sanitizedMessage);
    }
  }

  if (lastError) {
    const sanitizedMessage = sanitizeError(lastError);
    throw new Error(sanitizedMessage);
  }

  throw new Error("All model attempts failed");
};

// Generate text content using Gemini API - returns just the text
export const generateText = async (prompt) => {
  const result = await generateContent(prompt);
  return result.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
};

// Generate content with image using Gemini Vision
export const generateContentWithImage = async (prompt, base64Image, mimeType) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelPreference = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const baseUrl = process.env.GEMINI_API_URL || "https://generativelanguage.googleapis.com/v1beta";
  
  if (!apiKey) {
    throw new Error("Gemini API key is not configured");
  }

  const modelsToTry = buildModelFallbackChain(modelPreference);

  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const url = `${baseUrl}/models/${model}:generateContent?key=${apiKey}`;
      
      const response = await axios.post(
        url,
        {
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Image
                  }
                }
              ]
            }
          ]
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 30000 // 30 second timeout
        }
      );
      
      return response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No analysis available";
    } catch (error) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.error?.message || error.message;

      // Check if model not found and try next one
      const missingModel =
        status === 404 || /not found/i.test(message) || /not supported/i.test(message);

      if (missingModel && model !== modelsToTry[modelsToTry.length - 1]) {
        console.warn(`Model ${model} not available for image, trying next...`);
        lastError = error;
        continue;
      }

      // If it's the last model or a different error, throw
      const sanitizedMessage = sanitizeError(error);
      throw new Error(sanitizedMessage);
    }
  }

  if (lastError) {
    const sanitizedMessage = sanitizeError(lastError);
    throw new Error(sanitizedMessage);
  }

  throw new Error("All model attempts failed for image analysis");
};

