export const extractJSON = (text) => {
  // Remove markdown code fences if present
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

  let jsonString = cleaned.substring(firstBrace, lastBrace + 1);

  // Remove control characters that break JSON.parse
  // (keeps \t \n \r which are valid JSON whitespace)
  jsonString = jsonString.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${error.message}`);
  }
};
