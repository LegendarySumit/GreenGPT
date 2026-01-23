export const extractJSON = (text) => {
  // Remove markdown blocks if present
  let cleaned = text
    .replace(/```json\n?/gi, "")
    .replace(/```\n?/g, "")
    .trim();

  // Find first { and last }
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("No JSON found in AI response");
  }

  const jsonString = cleaned.substring(firstBrace, lastBrace + 1);
  
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${error.message}`);
  }
};
