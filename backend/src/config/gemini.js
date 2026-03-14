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
export const generateContent = async (prompt, configOverride = {}) => {
  // Check if mock API is enabled
  if (process.env.USE_MOCK_API === "true") {
    console.log("[MOCK API] Returning mock response");
    return {
      candidates: [{
        content: {
          parts: [{
            text: JSON.stringify({
              summary: "This is a mock analysis of your environmental document.",
              key_findings: [
                "Environmental impact assessment completed",
                "Carbon footprint analysis included",
                "Sustainability metrics documented"
              ],
              recommendations: [
                "Implement renewable energy sources",
                "Reduce waste production",
                "Monitor emission levels regularly"
              ],
              impact_score: 7.5,
              status: "Mock Data"
            })
          }]
        }
      }]
    };
  }

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
          ],
          generationConfig: {
            temperature: 0.2,
            topP: 0.85,
            topK: 40,
            maxOutputTokens: 2048,
            ...configOverride,
          }
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
  const result = await generateContent(prompt, { maxOutputTokens: 900 });
  return result.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
};

// Stream content from Gemini — calls onChunk(text) for each token, onDone() when complete
export const streamContent = async (prompt, onChunk, onDone, onError) => {
  const apiKey   = process.env.GEMINI_API_KEY;
  const model    = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const baseUrl  = process.env.GEMINI_API_URL || "https://generativelanguage.googleapis.com/v1beta";

  if (!apiKey) { onError(new Error("Gemini API key not configured")); return; }

  const url = `${baseUrl}/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`;

  try {
    const response = await axios.post(
      url,
      { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, topP: 0.85, topK: 40, maxOutputTokens: 900 } },
      { responseType: "stream", headers: { "Content-Type": "application/json" }, timeout: 60000 }
    );

    let buffer = "";

    response.data.on("data", (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop(); // keep any incomplete line for next chunk

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const raw = line.slice(6).trim();
        if (!raw) continue;
        try {
          const json = JSON.parse(raw);
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) onChunk(text);
        } catch { /* ignore parse errors on partial chunks */ }
      }
    });

    response.data.on("end", () => {
      // flush any remaining buffer
      if (buffer.startsWith("data: ")) {
        const raw = buffer.slice(6).trim();
        try {
          const json = JSON.parse(raw);
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) onChunk(text);
        } catch {}
      }
      onDone();
    });

    response.data.on("error", onError);
  } catch (err) {
    const msg = err.response?.data?.error?.message || err.message || "Stream failed";
    onError(new Error(msg.replace(/key=[A-Za-z0-9_-]+/gi, "key=***")));
  }
};

// Generate content with image using Gemini Vision
export const generateContentWithImage = async (prompt, base64Image, mimeType) => {
  // Check if mock API is enabled
  if (process.env.USE_MOCK_API === "true") {
    console.log("[MOCK API] Returning mock image analysis");
    return "This is a mock analysis of your image. The system would have analyzed the visual content and provided detailed insights.";
  }

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

