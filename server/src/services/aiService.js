import { callOpenRouter } from "./providers/openrouter.js";
import { callGemini } from "./providers/gemini.js";
import { buildContextPrompt } from "../utils/contextBuilder.js";

export const generateAIResponse = async (message, context) => {
  const prompt = buildContextPrompt(message, context);

  try {
    return await callOpenRouter(prompt);
  } catch (error) {
    console.log("Fallback to Gemini");
    return await callGemini(prompt);
  }
};
