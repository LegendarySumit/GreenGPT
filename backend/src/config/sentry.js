import * as Sentry from "@sentry/node";

let sentryEnabled = false;

const getSentryHandlers = () => {
  const handlers = Sentry?.Handlers;
  if (!handlers) {
    return null;
  }

  const hasRequestHandler = typeof handlers.requestHandler === "function";
  const hasErrorHandler = typeof handlers.errorHandler === "function";

  if (!hasRequestHandler || !hasErrorHandler) {
    return null;
  }

  return handlers;
};

export const initSentry = () => {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return { enabled: false };

  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || "development",
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0),
  });

  sentryEnabled = true;
  return { enabled: true };
};

export const sentryHandlers = {
  requestHandler: () => (req, res, next) => {
    if (!sentryEnabled) return next();
    const handlers = getSentryHandlers();
    if (!handlers) return next();
    return handlers.requestHandler()(req, res, next);
  },
  errorHandler: () => (err, req, res, next) => {
    if (!sentryEnabled) return next(err);
    const handlers = getSentryHandlers();
    if (!handlers) return next(err);
    return handlers.errorHandler()(err, req, res, next);
  },
};

export const captureException = (error, context = {}) => {
  if (!sentryEnabled) return;
  Sentry.captureException(error, {
    tags: context,
  });
};
