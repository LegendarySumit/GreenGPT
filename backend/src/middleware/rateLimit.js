import { createHash } from "crypto";
import { kvDel, kvGetJson, kvIncr, kvSetJson, kvTtl } from "../config/kvStore.js";
import { sendError } from "../utils/apiResponse.js";

const cachePrefix = "cache:v1";

const hashText = (value) =>
  createHash("sha256")
    .update(value)
    .digest("hex")
    .slice(0, 24);

const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || "unknown";
};

const incrementWindowCounter = async (prefix, identifier, windowSec) => {
  const bucket = Math.floor(Date.now() / (windowSec * 1000));
  const key = `rl:${prefix}:${identifier}:${bucket}`;
  const count = await kvIncr(key, windowSec);
  const ttl = await kvTtl(key);
  return { count, ttl: ttl > 0 ? ttl : windowSec };
};

export const createRateLimit = ({
  windowMs = 60_000,
  userMax = 120,
  ipMax = 240,
} = {}) => {
  const windowSec = Math.max(1, Math.ceil(windowMs / 1000));

  return async (req, res, next) => {
    try {
      const ip = getClientIp(req);
      const userId = req.user?.id || null;

      const ipResult = await incrementWindowCounter("ip", ip, windowSec);
      if (ipResult.count > ipMax) {
        return sendError(res, {
          status: 429,
          message: "Too many requests from this IP",
          code: "RATE_LIMIT_IP",
          details: { retryAfter: ipResult.ttl },
        });
      }

      if (userId) {
        const userResult = await incrementWindowCounter("user", userId, windowSec);
        if (userResult.count > userMax) {
          return sendError(res, {
            status: 429,
            message: "Too many requests for this user",
            code: "RATE_LIMIT_USER",
            details: { retryAfter: userResult.ttl },
          });
        }
      }

      next();
    } catch (error) {
      return sendError(res, {
        status: 503,
        message: "Rate limiter unavailable",
        code: "RATE_LIMIT_UNAVAILABLE",
        details: error.message,
      });
    }
  };
};

export const rateLimitMiddleware = createRateLimit();

export const generateCacheKey = (endpoint, data) => {
  const payload = typeof data === "string" ? data : JSON.stringify(data || {});
  return `${cachePrefix}:${endpoint}:${hashText(payload)}`;
};

export const getCachedResponse = async (key) => kvGetJson(key);

export const cacheResponse = async (key, data, ttlMs = 300_000) => {
  const ttlSeconds = Math.max(1, Math.ceil(ttlMs / 1000));
  await kvSetJson(key, data, ttlSeconds);
};

export const clearCache = async (key) => {
  if (!key) return;
  await kvDel(key);
};
