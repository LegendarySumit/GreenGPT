import * as Sentry from "@sentry/node";

let sentryEnabled = false;

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
    return Sentry.Handlers.requestHandler()(req, res, next);
  },
  errorHandler: () => (err, req, res, next) => {
    if (!sentryEnabled) return next(err);
    return Sentry.Handlers.errorHandler()(err, req, res, next);
  },
};

export const captureException = (error, context = {}) => {
  if (!sentryEnabled) return;
  Sentry.captureException(error, {
    tags: context,
  });
};
