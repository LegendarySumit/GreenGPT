import axios from "axios";

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

