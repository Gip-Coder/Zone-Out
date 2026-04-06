import fetch from "node-fetch";
import { withTimeout } from "./utils.js";

/**
 * Patch 2 - OpenRouter Provider using Mistral
 */
export async function generateWithOpenRouter({ prompt, model = "mistralai/mistral-7b-instruct" }) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is missing");

  const url = "https://openrouter.ai/api/v1/chat/completions";
  
  const payload = {
    model: model,
    messages: [{ role: "user", content: prompt }]
  };

  const req = fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  // Apply Patch 3 timeout
  const response = await withTimeout(req, 8000);
  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.error?.message || `HTTP ${response.status}`;
    if (response.status === 429) {
      throw new Error(`OpenRouter API error 429: ${errorMsg}`);
    }
    throw new Error(`OpenRouter API error: ${errorMsg}`);
  }

  if (!data.choices || !data.choices[0] || !data.choices[0].message?.content) {
    throw new Error("OpenRouter returned an empty or invalid format response");
  }

  return {
    text: data.choices[0].message.content,
    provider: "openrouter",
    model: model
  };
}
