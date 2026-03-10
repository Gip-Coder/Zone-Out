import fetch from "node-fetch";
import { geminiLimiter, estimateTokens } from "./rateLimiter.js";

/**
 * Calls the Gemini API (free tier).
 * Tries available models in order of preference.
 * Enforces rate limits (RPM, TPM, RPD) before making requests.
 */
export const callGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  // Estimate tokens for rate limiting
  const tokenEstimate = estimateTokens(prompt);

  // Check rate limits before calling
  const rateCheck = geminiLimiter.check(tokenEstimate);
  if (!rateCheck.allowed) {
    throw new Error(rateCheck.reason);
  }

  // Available Gemini models — ordered by most generous free-tier limits first
  // 3.1 Flash Lite: 15 RPM, 250K TPM, 500 RPD
  // 3.0 Flash:       5 RPM, 250K TPM,  20 RPD
  const models = [
    "gemini-3.1-flash-lite",
    "gemini-3.0-flash",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
  ];

  let lastError = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errMsg = data?.error?.message || `HTTP ${response.status}`;
        // If model not found or not supported, try next one
        if (response.status === 404 || errMsg.includes("not found") || errMsg.includes("not supported")) {
          console.warn(`Gemini model ${model} not available, trying next...`);
          lastError = new Error(`Gemini ${model}: ${errMsg}`);
          continue;
        }
        throw new Error(`Gemini API error (${model}): ${errMsg}`);
      }

      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.warn(`Gemini ${model} returned empty response, trying next...`);
        lastError = new Error(`Gemini ${model}: empty response`);
        continue;
      }

      // Success — record usage for rate limiting
      const responseTokens = estimateTokens(data.candidates[0].content.parts[0].text);
      geminiLimiter.record(tokenEstimate + responseTokens);

      console.log(`Gemini response from model: ${model}`);
      return data.candidates[0].content.parts[0].text;
    } catch (err) {
      lastError = err;
      // Rate limit or auth errors affect all models — stop trying
      if (err.message?.includes("Rate limit") || err.message?.includes("API_KEY")) {
        throw err;
      }
      console.warn(`Gemini model ${model} failed:`, err.message);
      continue;
    }
  }

  throw lastError || new Error("All Gemini models failed");
};
