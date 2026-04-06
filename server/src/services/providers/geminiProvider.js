import { GoogleGenerativeAI } from "@google/generative-ai";
import { withTimeout } from "./utils.js";

// Initialize centrally since it's the same SDK
const fallbackKey = process.env.GEMINI_API_KEY;

export async function generateWithGemini({ prompt, model = "gemini-2.5-flash", type }) {
  let keyToUse = fallbackKey;
  if (type === "chat" && process.env.GEMINI_CHAT_KEY) keyToUse = process.env.GEMINI_CHAT_KEY;
  if (type === "control" && process.env.GEMINI_CONTROL_KEY) keyToUse = process.env.GEMINI_CONTROL_KEY;
  if (type === "generate" && process.env.GEMINI_GEN_KEY) keyToUse = process.env.GEMINI_GEN_KEY;

  if (!keyToUse) throw new Error("GEMINI_API_KEY is missing");

  const aiClient = new GoogleGenerativeAI(keyToUse);
  const genModel = aiClient.getGenerativeModel({ model });

  const req = genModel.generateContent(prompt);
  
  // Apply Patch 3 timeout
  const result = await withTimeout(req, 8000);

  return {
    text: result.response.text(),
    provider: "gemini",
    model: model
  };
}
