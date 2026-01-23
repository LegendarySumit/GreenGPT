import axios from "axios";

// Generate content using Gemini API - returns raw response
export const generateContent = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const baseUrl = "https://generativelanguage.googleapis.com/v1beta";
  
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
      headers: { "Content-Type": "application/json" }
    }
  );
  
  return response.data;
};

// Generate text content using Gemini API - returns just the text
export const generateText = async (prompt) => {
  const result = await generateContent(prompt);
  return result.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
};

// Generate content with image using Gemini Vision
export const generateContentWithImage = async (prompt, base64Image, mimeType) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = "gemini-1.5-flash";
  const baseUrl = "https://generativelanguage.googleapis.com/v1beta";
  
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
      headers: { "Content-Type": "application/json" }
    }
  );
  
  return response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No analysis available";
};

