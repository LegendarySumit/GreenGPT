// Rate limiting middleware to prevent quota exhaustion
const requestCache = new Map();
const userRequestTimes = new Map();

const RATE_LIMIT = {
  WINDOW_MS: 60000,      // 1 minute window
  MAX_REQUESTS: 5,        // 5 requests per window per user
  CACHE_DURATION: 300000  // 5 minute cache for identical requests
};

export const rateLimitMiddleware = (req, res, next) => {
  const userId = req.user?.id || 'anonymous';
  const now = Date.now();
  
  // Initialize user tracking
  if (!userRequestTimes.has(userId)) {
    userRequestTimes.set(userId, []);
  }
  
  // Clean old requests outside the window
  const userRequests = userRequestTimes.get(userId);
  const validRequests = userRequests.filter(time => now - time < RATE_LIMIT.WINDOW_MS);
  userRequestTimes.set(userId, validRequests);
  
  // Check if limit exceeded
  if (validRequests.length >= RATE_LIMIT.MAX_REQUESTS) {
    console.log(`[RATE LIMIT] User ${userId} exceeded ${RATE_LIMIT.MAX_REQUESTS} requests in ${RATE_LIMIT.WINDOW_MS}ms`);
    return res.status(429).json({
      success: false,
      error: `Rate limit exceeded. Maximum ${RATE_LIMIT.MAX_REQUESTS} requests per minute. Please wait.`,
      retryAfter: Math.ceil((validRequests[0] + RATE_LIMIT.WINDOW_MS - now) / 1000)
    });
  }
  
  // Add current request
  validRequests.push(now);
  
  next();
};

// Cache key generator for requests
export const generateCacheKey = (endpoint, data) => {
  return `${endpoint}:${JSON.stringify(data).substring(0, 100)}`;
};

// Get cached response if available
export const getCachedResponse = (key) => {
  const cached = requestCache.get(key);
  if (cached && Date.now() - cached.timestamp < RATE_LIMIT.CACHE_DURATION) {
    console.log(`[CACHE HIT] Returning cached response for: ${key}`);
    return cached.data;
  }
  
  // Remove expired cache
  if (cached) {
    requestCache.delete(key);
  }
  
  return null;
};

// Store response in cache
export const cacheResponse = (key, data) => {
  requestCache.set(key, {
    data: data,
    timestamp: Date.now()
  });
  console.log(`[CACHE] Stored response for: ${key}`);
};

// Clear cache (useful for testing)
export const clearCache = () => {
  requestCache.clear();
  console.log('[CACHE] Cache cleared');
};
