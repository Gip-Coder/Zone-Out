import { api } from "../services/apiClient";

export class ClaudeAI {
  constructor() {
    this.apiKey = import.meta.env.VITE_CLAUDE_API_KEY;
  }

  async generate(prompt) {
    if (!this.apiKey) {
      throw new Error("Missing VITE_CLAUDE_API_KEY");
    }

    console.log("[ClaudeAI] Generating response...");

    const data = await api.post("https://api.anthropic.com/v1/messages", {
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }]
    }, {
      headers: {
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      }
    });
    
    if (!data || !data.content || data.content.length === 0 || !data.content[0].text) {
      throw new Error("Invalid or empty response from ClaudeAI");
    }

    return data.content[0].text.trim();
  }
}
