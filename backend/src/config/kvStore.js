import { Redis } from "@upstash/redis";

const isProduction = process.env.NODE_ENV === "production";
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const redisEnabled = Boolean(REDIS_URL && REDIS_TOKEN);

if (isProduction && !redisEnabled) {
  throw new Error("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required in production");
}

const redisClient = redisEnabled
  ? new Redis({
      url: REDIS_URL,
      token: REDIS_TOKEN,
    })
  : null;

const memoryStore = new Map();

const readMemory = (key) => {
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (entry.expiresAt && entry.expiresAt <= Date.now()) {
    memoryStore.delete(key);
    return null;
  }
  return entry.value;
};

const writeMemory = (key, value, ttlSeconds) => {
  const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
  memoryStore.set(key, { value, expiresAt });
};

export const kvStatus = {
  backend: redisEnabled ? "upstash-redis" : "in-memory-fallback",
};

export const kvGet = async (key) => {
  if (redisClient) return redisClient.get(key);
  return readMemory(key);
};

export const kvSet = async (key, value, ttlSeconds = null) => {
  if (redisClient) {
    if (ttlSeconds) {
      await redisClient.set(key, value, { ex: ttlSeconds });
      return;
    }
    await redisClient.set(key, value);
    return;
  }
  writeMemory(key, value, ttlSeconds);
};

export const kvIncr = async (key, ttlSeconds = null) => {
  if (redisClient) {
    const next = await redisClient.incr(key);
    if (ttlSeconds && next === 1) {
      await redisClient.expire(key, ttlSeconds);
    }
    return next;
  }

  const existing = Number(readMemory(key) || 0);
  const next = existing + 1;
  writeMemory(key, next, ttlSeconds);
  return next;
};

export const kvTtl = async (key) => {
  if (redisClient) {
    return redisClient.ttl(key);
  }
  const entry = memoryStore.get(key);
  if (!entry || !entry.expiresAt) return -1;
  return Math.max(0, Math.ceil((entry.expiresAt - Date.now()) / 1000));
};

export const kvDel = async (key) => {
  if (redisClient) {
    await redisClient.del(key);
    return;
  }
  memoryStore.delete(key);
};

export const kvGetJson = async (key) => {
  const raw = await kvGet(key);
  if (!raw) return null;
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const kvSetJson = async (key, data, ttlSeconds = null) => {
  await kvSet(key, JSON.stringify(data), ttlSeconds);
};
