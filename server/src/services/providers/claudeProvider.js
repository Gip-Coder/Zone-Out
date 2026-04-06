import fetch from "node-fetch";
import { withTimeout } from "./utils.js";

/**
 * Patch 1 - Claude Provider via Core API
 */
export async function generateWithClaude({ prompt, model = "claude-3-haiku-20240307" }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is missing");

  const url = "https://api.anthropic.com/v1/messages";
  
  const payload = {
    model: model,
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }]
  };

  const req = fetch(url, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  // Apply Patch 3 global timeout
  const response = await withTimeout(req, 8000);
  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.error?.message || `HTTP ${response.status}`;
    // map rate limit to 429 for isRetryableError to catch
    if (response.status === 429) {
      throw new Error(`Claude API error 429: ${errorMsg}`);
    }
    throw new Error(`Claude API error: ${errorMsg}`);
  }

  if (!data.content || !data.content[0] || !data.content[0].text) {
    throw new Error("Claude returned an empty or invalid format response");
  }

  return {
    text: data.content[0].text,
    provider: "claude",
    model: model
  };
}
