import { sendError } from "../utils/apiResponse.js";

const MAX_MESSAGE_LENGTH = Number(process.env.MAX_MESSAGE_LENGTH || 4000);
const MAX_FILES_CONTEXT = Number(process.env.MAX_FILES_CONTEXT || 5);
const MAX_FILE_NAME_LENGTH = Number(process.env.MAX_FILE_NAME_LENGTH || 200);
const MAX_FILE_CONTENT_LENGTH = Number(process.env.MAX_FILE_CONTENT_LENGTH || 12000);
const MAX_HISTORY_ITEMS = Number(process.env.MAX_HISTORY_ITEMS || 40);
const MAX_HISTORY_MESSAGE_LENGTH = Number(process.env.MAX_HISTORY_MESSAGE_LENGTH || 4000);

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

export const validateAnalyzeSavePayload = (req, res, next) => {
  const { fileName, analysis, fileSizeBytes } = req.body || {};

  if (typeof fileName !== "string" || fileName.trim().length < 1 || fileName.length > 255) {
    return sendError(res, {
      status: 400,
      message: "Invalid fileName",
      code: "VALIDATION_ERROR",
    });
  }

  if (!isObject(analysis)) {
    return sendError(res, {
      status: 400,
      message: "Invalid analysis payload",
      code: "VALIDATION_ERROR",
    });
  }

  if (fileSizeBytes !== undefined && (!Number.isFinite(fileSizeBytes) || fileSizeBytes < 0)) {
    return sendError(res, {
      status: 400,
      message: "Invalid fileSizeBytes",
      code: "VALIDATION_ERROR",
    });
  }

  next();
};

const validateFiles = (files) => {
  if (files === undefined) return null;

  if (!Array.isArray(files)) {
    return "files must be an array";
  }

  if (files.length > MAX_FILES_CONTEXT) {
    return `files exceeds max allowed (${MAX_FILES_CONTEXT})`;
  }

  for (const file of files) {
    if (!isObject(file)) return "files entries must be objects";
    if (typeof file.name !== "string" || file.name.length < 1 || file.name.length > MAX_FILE_NAME_LENGTH) {
      return "Invalid file name";
    }
    if (typeof file.content !== "string" || file.content.length < 1 || file.content.length > MAX_FILE_CONTENT_LENGTH) {
      return "Invalid file content";
    }
  }

  return null;
};

const validateHistory = (history) => {
  if (history === undefined) return null;

  if (!Array.isArray(history)) {
    return "conversationHistory must be an array";
  }

  if (history.length > MAX_HISTORY_ITEMS) {
    return `conversationHistory exceeds max allowed (${MAX_HISTORY_ITEMS})`;
  }

  for (const item of history) {
    if (!isObject(item)) return "conversationHistory entries must be objects";
    if (!["user", "assistant"].includes(item.role)) return "Invalid conversationHistory role";
    if (typeof item.content !== "string" || item.content.length < 1 || item.content.length > MAX_HISTORY_MESSAGE_LENGTH) {
      return "Invalid conversationHistory content";
    }
  }

  return null;
};

export const validateChatPayload = (req, res, next) => {
  const { message, files, conversationHistory } = req.body || {};

  if (typeof message !== "string" || message.trim().length < 1) {
    return sendError(res, {
      status: 400,
      message: "Message is required",
      code: "VALIDATION_ERROR",
    });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return sendError(res, {
      status: 413,
      message: `Message exceeds max length (${MAX_MESSAGE_LENGTH})`,
      code: "PAYLOAD_TOO_LARGE",
    });
  }

  const filesError = validateFiles(files);
  if (filesError) {
    return sendError(res, {
      status: 400,
      message: filesError,
      code: "VALIDATION_ERROR",
    });
  }

  const historyError = validateHistory(conversationHistory);
  if (historyError) {
    return sendError(res, {
      status: 400,
      message: historyError,
      code: "VALIDATION_ERROR",
    });
  }

  next();
};
