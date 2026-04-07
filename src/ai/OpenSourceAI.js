import { api } from "../services/apiClient";

export class OpenSourceAI {
  constructor() {
    this.apiKey = import.meta.env.VITE_HF_API_KEY;
  }

  async generate(prompt) {
    if (!this.apiKey) {
      throw new Error("Missing VITE_HF_API_KEY");
    }
    
    console.log("[OpenSourceAI] Generating response...");
    
    const data = await api.post(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      { 
        inputs: prompt, 
        parameters: { max_new_tokens: 500, return_full_text: false } 
      },
      {
        headers: {
          "Authorization": `Bearer ${this.apiKey}`
        }
      }
    );

    
    if (!data || data.length === 0 || !data[0].generated_text || data[0].generated_text.trim() === "") {
      throw new Error("Invalid or empty response from OpenSourceAI");
    }

    return data[0].generated_text.trim();
  }
}
