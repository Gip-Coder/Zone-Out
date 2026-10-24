import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCache, setCache, createCacheKey, TTL_MAP, isValidResponse, cacheMetrics } from "./cache/cache.js";
import { withTimeout } from "./providers/utils.js";

// Per-model attempt timeout; the fallback queue moves on when a model hangs.
const MODEL_TIMEOUT_MS = 15000;

const KEY_ENV_BY_TYPE = {
  chat: "GEMINI_CHAT_KEY",
  control: "GEMINI_CONTROL_KEY",
  generate: "GEMINI_GEN_KEY",
};

export class AIRouter {
  /**
   * @param {object} [options]
   * @param {(apiKey: string) => { getGenerativeModel: Function }} [options.clientFactory]
   *   Creates a provider client; injectable so tests never call the real API.
   */
  constructor({ clientFactory = (key) => new GoogleGenerativeAI(key) } = {}) {
    this.clientFactory = clientFactory;
    this.clients = new Map();
    // Step 4: Deduplication map for in-flight requests
    this.pending = new Map();
  }

  /**
   * Clients are created lazily so API keys are read after the environment has
   * been loaded, not at module import time.
   */
  getClient(type) {
    const apiKey = process.env[KEY_ENV_BY_TYPE[type] || KEY_ENV_BY_TYPE.generate] || process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Gemini API key is not configured");
    if (!this.clients.has(apiKey)) this.clients.set(apiKey, this.clientFactory(apiKey));
    return this.clients.get(apiKey);
  }

  // Helper arrays for model fallback queue inside each key
  getFallbackModels() {
    return [
      "gemini-3.1-flash-lite",   // 15 RPM, 500 RPD
      "gemini-2.5-flash-lite",   // 10 RPM, 20 RPD
      "gemini-3.0-flash",        // 5 RPM, 20 RPD
      "gemini-2.5-flash"         // 5 RPM, 20 RPD
    ];
  }

  async _executeFallbackRouting(prompt, type) {
    const primaryClient = this.getClient(type);
    const fallbackQueue = this.getFallbackModels();
    let lastError = null;

    for (const modelName of fallbackQueue) {
      try {
        const currentModel = primaryClient.getGenerativeModel({ model: modelName });
        const result = await withTimeout(currentModel.generateContent(prompt), MODEL_TIMEOUT_MS);
        const text = result.response.text();
        if (!isValidResponse(text)) throw new Error("Empty response");

        console.log(`[AIRouter] SUCCESS | Type: ${type} | Model: ${modelName}`);
        return text;
      } catch (error) {
        // Quota (429), overload (503), timeouts and model errors all fail over
        // to the next model in the queue.
        lastError = error;
        console.warn(`[AIRouter] FAILED | Type: ${type} | Model: ${modelName} | Error: ${error.message}`);
      }
    }

    console.error(`[AIRouter] ALL FALLBACKS FAILED for type: ${type}.`);
    throw new Error(`All Gemini fallbacks failed: ${lastError?.message || "unknown error"}`);
  }

  // Step 3, 6, 9, 10: safeGenerate overlaid with Cache & Dedup layer
  async safeGenerate(prompt, type, bypassCache = false) {
    const key = createCacheKey({ prompt, type });

    if (!bypassCache) {
      // 1. Cache Check
      const cached = getCache(key);
      if (cached) {
        cacheMetrics.cacheHits++;
        return cached;
      }
      cacheMetrics.cacheMisses++;

      // 2. Dedup Check (In-Flight)
      if (this.pending.has(key)) {
        return await this.pending.get(key);
      }
    }

    // 3. Provider Routing (Execute Core Logic inside promise)
    const promise = this._executeFallbackRouting(prompt, type);

    // Store promise in pending mapping unconditionally unless bypassing cache
    if (!bypassCache) {
      this.pending.set(key, promise);
    }

    try {
      const result = await promise;

      // 4. Cache Store on Success AND Validation
      if (!bypassCache && isValidResponse(result)) {
        setCache(key, result, TTL_MAP[type] || 300000);
      }
      return result;
    } finally {
      if (!bypassCache) {
        this.pending.delete(key);
      }
    }
  }
}

export const aiRouter = new AIRouter();
