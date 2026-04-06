import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCache, setCache, createCacheKey, TTL_MAP, isValidResponse, cacheMetrics } from "./cache/cache.js";

// Step 4: Add Deduplication map for in-flight requests
const pending = new Map();

export class AIRouter {
  constructor() {
    // 1. Get Environment Variables
    const chatKey = process.env.GEMINI_CHAT_KEY;
    const controlKey = process.env.GEMINI_CONTROL_KEY;
    const genKey = process.env.GEMINI_GEN_KEY;
    const fallbackKey = process.env.GEMINI_API_KEY;

    // 2. Initialize Multiple Gemini Clients
    this.chatAI = new GoogleGenerativeAI(chatKey || fallbackKey);
    this.controlAI = new GoogleGenerativeAI(controlKey || fallbackKey);
    this.genAI = new GoogleGenerativeAI(genKey || fallbackKey);
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
    let primaryClient;

    // Determine the correct client instance based on the type
    switch (type) {
      case "chat":
        primaryClient = this.chatAI;
        break;
      case "control":
        primaryClient = this.controlAI;
        break;
      case "generate":
      default:
        primaryClient = this.genAI;
        break;
    }

    const fallbackQueue = this.getFallbackModels();
    let lastError = null;

    for (const modelName of fallbackQueue) {
      try {
        const currentModel = primaryClient.getGenerativeModel({ model: modelName });
        
        console.log(`[AIRouter] Attempting generation. Type: ${type}, Model: ${modelName}`);
        const result = await currentModel.generateContent(prompt);
        
        console.log(`[AIRouter] SUCCESS | Type: ${type} | Model: ${modelName}`);
        return result.response.text();
      } catch (error) {
        lastError = error;
        const msg = error.message.toLowerCase();
        
        console.warn(`[AIRouter] FAILED | Type: ${type} | Model: ${modelName} | Error: ${error.message}`);
        
        if (msg.includes("429") || msg.includes("quota")) {
          console.warn(`[AIRouter] 429 Quota Exhausted on ${modelName}, failing over to next model...`);
          continue;
        } else if (msg.includes("503") || msg.includes("overloaded")) {
          console.warn(`[AIRouter] 503 Service Unavailable on ${modelName}, failing over to next model...`);
          continue;
        } else {
          continue;
        }
      }
    }

    console.error(`[AIRouter] ALL FALLBACKS FAILED for type: ${type}. Returning graceful error.`);
    throw new Error(`All Gemini fallbacks failed: ${lastError.message}`);
  }

  // Step 3, 6, 9, 10: safeGenerate overlaid with Cache & Dedup layer
  async safeGenerate(prompt, type, bypassCache = false) {
    const key = createCacheKey({ prompt, type });

    if (!bypassCache) {
      // 1. Cache Check
      const cached = getCache(key);
      if (cached) {
        cacheMetrics.cacheHits++;
        console.log({ type, cache: "HIT" });
        console.log({ cacheHits: cacheMetrics.cacheHits, cacheMisses: cacheMetrics.cacheMisses });
        return cached;
      } else {
        cacheMetrics.cacheMisses++;
        console.log({ type, cache: "MISS" });
      }

      // 2. Dedup Check (In-Flight)
      if (pending.has(key)) {
        console.log({ type, dedup: "HIT" });
        return await pending.get(key);
      }
    }

    // 3. Provider Routing (Execute Core Logic inside promise)
    const promise = this._executeFallbackRouting(prompt, type);
    
    // Store promise in pending mapping unconditionally unless bypassing cache
    if (!bypassCache) {
      pending.set(key, promise);
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
        pending.delete(key);
      }
    }
  }
}

export const aiRouter = new AIRouter();
