export const sendError = (res, {
  status = 500,
  message = "Internal server error",
  code = "INTERNAL_ERROR",
  details,
} = {}) => {
  const payload = {
    success: false,
    message,
    code,
    requestId: res?.getHeader?.("X-Request-Id") || null,
  };

  if (details && process.env.NODE_ENV !== "production") {
    payload.details = details;
  }

  return res.status(status).json(payload);
};

export const sendSuccess = (res, data = {}, status = 200) =>
  res.status(status).json({ success: true, ...data });

export const toHttpError = (error, fallbackMessage = "Internal server error") => {
  const status = Number.isInteger(error?.statusCode)
    ? error.statusCode
    : Number.isInteger(error?.status)
      ? error.status
      : 500;

  const message = error?.message || fallbackMessage;

  return { status, message };
};
