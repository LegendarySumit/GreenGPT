import express from "express";
import cors from "cors";
import helmet from "helmet";
import { randomUUID } from "crypto";
import analyzeRoutes from "./routes/analyze.js";
import chatRoutes from "./routes/chat.js";
import authRoutes from "./routes/auth.js";
import { firebaseBootState, isFirebaseReady } from "./config/firebaseAdmin.js";
import { isGeminiConfigured } from "./config/gemini.js";
import { createRateLimit } from "./middleware/rateLimit.js";
import { sentryHandlers } from "./config/sentry.js";
import { sendError } from "./utils/apiResponse.js";
import { captureException } from "./config/sentry.js";
import { hashUserId, logError, logInfo } from "./utils/logging.js";

const app = express();

const isProduction = process.env.NODE_ENV === "production";
const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS || 120000);
const JSON_BODY_LIMIT = process.env.JSON_BODY_LIMIT || "1mb";
const requestIdHeader = "x-request-id";
const globalRateLimit = createRateLimit({
  windowMs: Number(process.env.GLOBAL_RATE_WINDOW_MS || 60_000),
  userMax: Number(process.env.GLOBAL_RATE_USER_MAX || 160),
  ipMax: Number(process.env.GLOBAL_RATE_IP_MAX || 300),
});

const parseCsvOrigins = (value = "") =>
  value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const createOriginPatternRegex = (pattern = "") => {
  const trimmed = pattern.trim();
  if (!trimmed) return null;

  if (!trimmed.includes("*")) {
    return new RegExp(`^${escapeRegex(trimmed)}$`);
  }

  const regexSource = trimmed
    .split("*")
    .map((part) => escapeRegex(part))
    .join(".*");

  return new RegExp(`^${regexSource}$`);
};

const defaultDevOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];

const productionOrigins = parseCsvOrigins(
  process.env.CORS_ALLOWED_ORIGINS || process.env.FRONTEND_URL || ""
);
const configuredOriginPatterns = parseCsvOrigins(
  process.env.CORS_ALLOWED_ORIGIN_PATTERNS || ""
);
const allowedOriginPatterns = configuredOriginPatterns
  .map((pattern) => createOriginPatternRegex(pattern))
  .filter(Boolean);
const configuredDevOrigins = parseCsvOrigins(process.env.DEV_CORS_ALLOWED_ORIGINS || "");
const allowedOrigins = isProduction
  ? productionOrigins
  : configuredDevOrigins.length > 0
    ? configuredDevOrigins
    : defaultDevOrigins;

if (isProduction && allowedOrigins.length === 0 && allowedOriginPatterns.length === 0) {
  throw new Error(
    "CORS_ALLOWED_ORIGINS (or FRONTEND_URL) or CORS_ALLOWED_ORIGIN_PATTERNS must be configured in production"
  );
}

const cspConnectSources = ["'self'", ...allowedOrigins];

app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: cspConnectSources,
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

app.use(sentryHandlers.requestHandler());

app.use((req, res, next) => {
  req.requestId = randomUUID();
  req.startTimeMs = Date.now();
  req.headers[requestIdHeader] = req.requestId;
  res.setHeader("X-Request-Id", req.requestId);
  res.on("finish", () => {
    const latencyMs = Date.now() - req.startTimeMs;
    logInfo("http_request", {
      requestId: req.requestId,
      method: req.method,
      route: req.originalUrl,
      status: res.statusCode,
      latencyMs,
      userHash: hashUserId(req.user?.id),
    });
  });

  res.setTimeout(REQUEST_TIMEOUT_MS, () => {
    if (!res.headersSent) {
      next(Object.assign(new Error("Request timeout"), { status: 503 }));
    }
  });
  next();
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      if (allowedOriginPatterns.some((pattern) => pattern.test(origin))) {
        callback(null, true);
        return;
      }

      if (isProduction) {
        console.warn(`cors_rejected_origin: ${origin}`);
      }

      callback(Object.assign(new Error("Origin not allowed by CORS policy"), { status: 403 }));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  })
);

app.use(express.json({ limit: JSON_BODY_LIMIT, strict: true }));
app.use(express.urlencoded({ limit: JSON_BODY_LIMIT, extended: false }));
app.use(globalRateLimit);

app.use("/api/auth", authRoutes);
app.use("/api/analyze", analyzeRoutes);
app.use("/api/chat", chatRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Backend is running" });
});

// Readiness check endpoint
app.get("/api/ready", (req, res) => {
  const checks = {
    firebase: isFirebaseReady(),
    gemini: isGeminiConfigured(),
  };

  const ready = checks.firebase && checks.gemini;
  const payload = {
    success: ready,
    ready,
    checks,
  };

  if (!ready) {
    payload.message = "Service not ready";
  }

  if (!isProduction) {
    payload.debug = {
      firebaseBootState,
    };
  }

  res.status(ready ? 200 : 503).json(payload);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint not found" });
});

app.use(sentryHandlers.errorHandler());

// Global error handler
app.use((err, req, res, next) => {
  captureException(err, {
    route: req.originalUrl,
    method: req.method,
    requestId: req.requestId,
  });

  logError("request_error", err, {
    requestId: req.requestId,
    method: req.method,
    route: req.originalUrl,
    userHash: hashUserId(req.user?.id),
  });

  const computedStatus = Number.isInteger(err.status) ? err.status : 500;
  const status = err.type === "entity.too.large" ? 413 : computedStatus;

  let message = "Internal server error";
  if (err.type === "entity.too.large") {
    message = "Request body is too large";
  } else if (status < 500 || err.message === "Request timeout") {
    message = err.message || "Request failed";
  }

  return sendError(res, {
    status,
    message,
    code: status >= 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR",
    details: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

export default app;
