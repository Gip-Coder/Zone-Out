import { callOpenRouter } from "./providers/openrouter.js";
import { callGemini } from "./providers/gemini.js";
import { buildContextPrompt, buildThinkPrompt, buildChatPrompt } from "../utils/contextBuilder.js";

/** Generic productivity assistant (existing behavior). */
export const generateAIResponse = async (message, context) => {
  const prompt = buildContextPrompt(message, context);
  try {
    return await callOpenRouter(prompt);
  } catch (error) {
    console.log("Fallback to Gemini");
    return await callGemini(prompt);
  }
};

/** Study Buddy control: user input + app context → { text, action? }. Tries OpenRouter then Gemini so AI works when one quota is exceeded. */
export const generateThinkResponse = async (userInput, appContext) => {
  const prompt = buildThinkPrompt(userInput, appContext);
  if (!process.env.OPENROUTER_API_KEY && !process.env.GEMINI_API_KEY) {
    throw new Error("Set OPENROUTER_API_KEY or GEMINI_API_KEY on the server for AI fallback.");
  }
  let raw;
  try {
    raw = process.env.OPENROUTER_API_KEY ? await callOpenRouter(prompt) : await callGemini(prompt);
  } catch (e) {
    if (process.env.OPENROUTER_API_KEY && process.env.GEMINI_API_KEY) {
      console.log("Think: primary provider failed, fallback to Gemini");
      raw = await callGemini(prompt);
    } else throw e;
  }
  return parseThinkResponse(raw);
};

/** Study Buddy chat: message + history → reply text. Tries OpenRouter then Gemini. */
export const generateChatResponse = async (message, conversationHistory = []) => {
  const prompt = buildChatPrompt(message, conversationHistory);
  if (!process.env.OPENROUTER_API_KEY && !process.env.GEMINI_API_KEY) {
    throw new Error("Set OPENROUTER_API_KEY or GEMINI_API_KEY on the server for AI fallback.");
  }
  try {
    return process.env.OPENROUTER_API_KEY ? await callOpenRouter(prompt) : await callGemini(prompt);
  } catch (error) {
    if (process.env.OPENROUTER_API_KEY && process.env.GEMINI_API_KEY) {
      console.log("Chat: primary provider failed, fallback to Gemini");
      return await callGemini(prompt);
    }
    throw error;
  }
};

function parseThinkResponse(text) {
  if (!text || typeof text !== "string") throw new Error("Empty think response");
  let cleaned = text.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON in think response");
  const jsonStr = cleaned
    .substring(start, end + 1)
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ")
    .replace(/,\s*}/g, "}")
    .replace(/,\s*]/g, "]");
  const parsed = JSON.parse(jsonStr);
  return { text: parsed.text || "", action: parsed.action || null };
}
