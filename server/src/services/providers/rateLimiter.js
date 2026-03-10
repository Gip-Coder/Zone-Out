/**
 * Simple in-memory rate limiter for AI provider calls.
 * Tracks requests-per-minute (RPM), tokens-per-minute (TPM), and requests-per-day (RPD).
 */

class RateLimiter {
  constructor({ rpm = 15, tpm = 1000000, rpd = 1500 } = {}) {
    this.limits = { rpm, tpm, rpd };

    // Sliding window trackers
    this.minuteRequests = [];   // timestamps of requests in current minute
    this.minuteTokens = [];     // { ts, tokens } entries in current minute
    this.dayRequests = [];       // timestamps of requests today
  }

  /** Remove stale entries older than the window */
  _prune() {
    const now = Date.now();
    const oneMinAgo = now - 60_000;
    const oneDayAgo = now - 86_400_000;

    this.minuteRequests = this.minuteRequests.filter(ts => ts > oneMinAgo);
    this.minuteTokens = this.minuteTokens.filter(e => e.ts > oneMinAgo);
    this.dayRequests = this.dayRequests.filter(ts => ts > oneDayAgo);
  }

  /**
   * Check if a request with `estimatedTokens` is allowed.
   * Returns { allowed: true } or { allowed: false, reason: string, retryAfterMs: number }
   */
  check(estimatedTokens = 0) {
    this._prune();

    // RPM check
    if (this.minuteRequests.length >= this.limits.rpm) {
      const oldest = this.minuteRequests[0];
      return {
        allowed: false,
        reason: `Rate limit: ${this.limits.rpm} requests/minute exceeded`,
        retryAfterMs: oldest + 60_000 - Date.now(),
      };
    }

    // TPM check
    const currentMinuteTokens = this.minuteTokens.reduce((sum, e) => sum + e.tokens, 0);
    if (currentMinuteTokens + estimatedTokens > this.limits.tpm) {
      return {
        allowed: false,
        reason: `Rate limit: ${this.limits.tpm} tokens/minute exceeded`,
        retryAfterMs: 60_000,
      };
    }

    // RPD check
    if (this.dayRequests.length >= this.limits.rpd) {
      return {
        allowed: false,
        reason: `Rate limit: ${this.limits.rpd} requests/day exceeded`,
        retryAfterMs: 3600_000,
      };
    }

    return { allowed: true };
  }

  /** Record a successful request */
  record(estimatedTokens = 0) {
    const now = Date.now();
    this.minuteRequests.push(now);
    this.minuteTokens.push({ ts: now, tokens: estimatedTokens });
    this.dayRequests.push(now);
  }
}

// Shared limiters for each provider (Gemini free-tier defaults)
export const geminiLimiter = new RateLimiter({ rpm: 15, tpm: 250_000, rpd: 500 });
export const openRouterLimiter = new RateLimiter({ rpm: 20, tpm: 500_000, rpd: 2000 });

/**
 * Estimate token count from text (rough: ~4 chars per token).
 */
export function estimateTokens(text) {
  return Math.ceil((text || "").length / 4);
}

/**
 * Truncate prompt to roughly `maxWords` words for efficient context.
 */
export function truncatePrompt(prompt, maxWords = 100) {
  if (!prompt) return prompt;
  const words = prompt.split(/\s+/);
  if (words.length <= maxWords) return prompt;
  return words.slice(0, maxWords).join(" ") + "...";
}
