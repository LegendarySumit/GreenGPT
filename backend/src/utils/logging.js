import { createHash } from "crypto";

const isProduction = process.env.NODE_ENV === "production";

const safeJson = (obj) => {
  try {
    return JSON.stringify(obj);
  } catch {
    return JSON.stringify({ level: "error", message: "Failed to serialize log payload" });
  }
};

export const hashUserId = (userId) => {
  if (!userId) return null;
  return createHash("sha256").update(String(userId)).digest("hex").slice(0, 12);
};

export const logInfo = (event, payload = {}) => {
  process.stdout.write(`${safeJson({ level: "info", event, ...payload })}\n`);
};

export const logWarn = (event, payload = {}) => {
  process.stdout.write(`${safeJson({ level: "warn", event, ...payload })}\n`);
};

export const logError = (event, error, payload = {}) => {
  const body = {
    level: "error",
    event,
    ...payload,
    message: error?.message || "Unknown error",
  };

  if (!isProduction && error?.stack) {
    body.stack = error.stack;
  }

  process.stderr.write(`${safeJson(body)}\n`);
};
