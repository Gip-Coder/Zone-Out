import crypto from "crypto";

// Step 1: Base cache store
const cache = new Map();
const MAX_CACHE_SIZE = 1000;

// Metric Tracking (Patch 6)
export const cacheMetrics = {
  cacheHits: 0,
  cacheMisses: 0
};

// Keys match the request types passed to AIRouter.safeGenerate
export const TTL_MAP = {
  chat: 300000,        // 5 min
  generate: 600000,    // 10 min
  control: 60000       // 1 min
};

/**
 * Patch 1: Fetch from cache (Lazy Expiration)
 */
export function getCache(key) {
  if (!cache.has(key)) return null;

  const entry = cache.get(key);

  if (Date.now() > entry.expiry) {
    // Expired
    cache.delete(key);
    return null;
  }

  return entry.value;
}

/**
 * Patch 1: Set in cache with max size and lazy expiration
 */
export function setCache(key, value, ttl = 300000) {
  if (cache.size >= MAX_CACHE_SIZE) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }

  // Store value with expiry timestamp
  cache.set(key, {
    value,
    expiry: Date.now() + ttl
  });
}

export function clearCache() {
  cache.clear();
}

/**
 * Patch 4: Stable cache key generator.
 * The key covers the WHOLE normalized prompt (hashed). Keying on a prefix made
 * different prompts that share a long fixed preamble return each other's answers.
 */
export function createCacheKey({ prompt, type }) {
  const normalizedPrompt = prompt.replace(/\s+/g, " ").trim();
  const digest = crypto.createHash("sha256").update(normalizedPrompt).digest("hex");
  return `${type}:${digest}`;
}

/**
 * Patch 3: Validation Helper
 */
export function isValidResponse(res) {
  return (
    res &&
    typeof res === "string" && // Since our providers return a string, we check the raw string
    res.trim().length > 0
  );
}
