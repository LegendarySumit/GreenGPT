const removeControlChars = (value = "") =>
  value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

const stripCodeFences = (value = "") =>
  value.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

const tryParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const findBalancedObjectCandidates = (input = "") => {
  const candidates = [];
  const stack = [];
  let inString = false;
  let escaped = false;

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (ch === "\\") {
      escaped = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (ch === "{") {
      stack.push(i);
      continue;
    }

    if (ch === "}" && stack.length > 0) {
      const start = stack.pop();
      if (stack.length === 0) {
        candidates.push(input.slice(start, i + 1));
      }
    }
  }

  return candidates;
};

export const extractJSON = (text) => {
  const cleaned = removeControlChars(stripCodeFences(text || ""));

  const direct = tryParse(cleaned);
  if (direct) return direct;

  const candidates = findBalancedObjectCandidates(cleaned);
  for (const candidate of candidates) {
    const parsed = tryParse(candidate);
    if (parsed) return parsed;
  }

  if (candidates.length === 0) {
    throw new Error("No JSON found in AI response");
  }

  throw new Error("Failed to parse JSON: AI response was not valid JSON");
};
