import fetch from "node-fetch";
import { openRouterLimiter, estimateTokens } from "./rateLimiter.js";

/**
 * Calls the OpenRouter API.
 * Uses free models when available, with fallback between models.
 * Enforces rate limits (RPM, TPM, RPD) before making requests.
 */
export const callOpenRouter = async (prompt) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set");

  // Estimate tokens for rate limiting
  const tokenEstimate = estimateTokens(prompt);

  // Check rate limits before calling
  const rateCheck = openRouterLimiter.check(tokenEstimate);
  if (!rateCheck.allowed) {
    throw new Error(rateCheck.reason);
  }

  // Free or cheap models to try in order
  const models = [
    "mistralai/mistral-7b-instruct:free",
    "meta-llama/llama-3.1-8b-instruct:free",
    "google/gemma-2-9b-it:free",
    "mistralai/mistral-7b-instruct",
  ];

  let lastError = null;

  for (const model of models) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errMsg = data?.error?.message || data?.message || `HTTP ${response.status}`;
        // Auth errors affect all models — don't retry
        if (response.status === 401 || response.status === 403) {
          throw new Error(`OpenRouter auth error: ${errMsg}`);
        }
        // Rate limit or model-specific error — try next model
        console.warn(`OpenRouter model ${model} failed (${response.status}): ${errMsg}`);
        lastError = new Error(`OpenRouter ${model}: ${errMsg}`);
        continue;
      }

      if (!data.choices?.[0]?.message?.content) {
        console.warn(`OpenRouter model ${model} returned empty response`);
        lastError = new Error(`OpenRouter ${model}: empty response`);
        continue;
      }

      // Success — record usage for rate limiting
      const responseTokens = estimateTokens(data.choices[0].message.content);
      openRouterLimiter.record(tokenEstimate + responseTokens);

      console.log(`OpenRouter response from model: ${model}`);
      return data.choices[0].message.content;
    } catch (err) {
      lastError = err;
      // Auth or rate limit errors — stop trying
      if (err.message?.includes("auth") || err.message?.includes("Rate limit")) throw err;
      console.warn(`OpenRouter model ${model} failed:`, err.message);
      continue;
    }
  }

  throw lastError || new Error("All OpenRouter models failed");
};
