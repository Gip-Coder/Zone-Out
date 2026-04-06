import { truncatePrompt } from "./providers/rateLimiter.js";
import { buildContextPrompt, buildThinkPrompt, buildChatPrompt } from "../utils/contextBuilder.js";
import { aiRouter } from "./AIRouter.js";

/** Max words for the final prompt sent to AI (keeps token usage efficient). */
const MAX_PROMPT_WORDS = 100;

/** Generic productivity assistant. */
export const generateAIResponse = async (message, context) => {
  const prompt = buildContextPrompt(message, context);
  const truncated = truncatePrompt(prompt, MAX_PROMPT_WORDS);
  return await aiRouter.safeGenerate(truncated, "chat");
};

/** Study Buddy control: user input + app context → { text, action? }. */
export const generateThinkResponse = async (userInput, appContext) => {
  const prompt = buildThinkPrompt(userInput, appContext);
  const raw = await aiRouter.safeGenerate(prompt, "control");
  return parseThinkResponse(raw);
};

/** Study Buddy chat: message + history → reply text. */
export const generateChatResponse = async (message, conversationHistory = []) => {
  const prompt = buildChatPrompt(message, conversationHistory);
  const truncated = truncatePrompt(prompt, MAX_PROMPT_WORDS);
  return await aiRouter.safeGenerate(truncated, "chat");
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

/** Manual fallback when API key exhausted: generate simple cards from topics. */
function manualFlashcardsFallback(courseName, moduleTitle, topics = []) {
  const list = Array.isArray(topics) && topics.length > 0 ? topics : ["Key concept 1", "Key concept 2", "Key concept 3"];
  const cards = list.slice(0, 10).map((t, i) => ({
    front: `What is ${t}? (${moduleTitle || "Module"})`,
    back: `${t} is an important topic in ${courseName || "this course"}. Review your notes for details.`,
  }));
  return { cards };
}

/**
 * Generate flashcards for a course/module. Uses AI when available; otherwise manual fallback.
 */
export const generateFlashcards = async (payload) => {
  const { courseName, moduleTitle, topics = [] } = payload;
  const topicList = Array.isArray(topics) ? topics : [];

  const prompt = `You are a study assistant. Generate exactly 8–10 flashcards for this course module.
Course: "${courseName || "General"}"
Module: "${moduleTitle || "General"}"
Topics: ${topicList.length ? JSON.stringify(topicList) : "General revision"}

Return RAW JSON only, no markdown or explanation:
{ "cards": [ { "front": "question or term", "back": "answer or definition" }, ... ] }`;

  try {
    const raw = await aiRouter.safeGenerate(prompt, "generate");
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("No JSON");
    const jsonStr = raw
      .substring(start, end + 1)
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ")
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]");
    const parsed = JSON.parse(jsonStr);
    const cards = Array.isArray(parsed.cards) ? parsed.cards : [];
    if (cards.length === 0) return manualFlashcardsFallback(courseName, moduleTitle, topicList);
    return { cards: cards.map((c) => ({ front: c.front || "", back: c.back || "" })).filter((c) => c.front || c.back) };
  } catch (e) {
    console.warn("Flashcard AI generation failed:", e.message);
    return manualFlashcardsFallback(courseName, moduleTitle, topicList);
  }
}

/** Raw generation for frontend custom workflows */
export const generateRawContent = async (prompt) => {
  return await aiRouter.safeGenerate(prompt, "generate");
};
