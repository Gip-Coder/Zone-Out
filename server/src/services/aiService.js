import { buildContextPrompt, buildThinkPrompt, buildChatPrompt } from "../utils/contextBuilder.js";
import { sanitizeAction } from "../utils/aiActions.js";
import { aiRouter } from "./AIRouter.js";

/** Generic productivity assistant. */
export const generateAIResponse = async (message, context) => {
  const prompt = buildContextPrompt(message, context);
  return await aiRouter.safeGenerate(prompt, "chat");
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
  return await aiRouter.safeGenerate(prompt, "chat");
};

/** Extracts the outermost JSON object from model text and parses it leniently. */
export function extractJson(text) {
  if (!text || typeof text !== "string") throw new Error("Empty AI response");
  const cleaned = text.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) throw new Error("No JSON in AI response");
  const jsonStr = cleaned
    .substring(start, end + 1)
    // eslint-disable-next-line no-control-regex -- strip control chars models sometimes emit
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ")
    .replace(/,\s*}/g, "}")
    .replace(/,\s*]/g, "]");
  return JSON.parse(jsonStr);
}

export function parseThinkResponse(text) {
  const parsed = extractJson(text);
  return {
    text: typeof parsed.text === "string" ? parsed.text : "",
    // Model output is untrusted: only allowlisted, in-range actions pass through
    action: sanitizeAction(parsed.action),
  };
}

/** Manual fallback when API key exhausted: generate simple cards from topics. */
function manualFlashcardsFallback(courseName, moduleTitle, topics = []) {
  const list = Array.isArray(topics) && topics.length > 0 ? topics : ["Key concept 1", "Key concept 2", "Key concept 3"];
  const cards = list.slice(0, 10).map((t) => ({
    front: `What is ${t}? (${moduleTitle || "Module"})`,
    back: `${t} is an important topic in ${courseName || "this course"}. Review your notes for details.`,
  }));
  return { cards, source: "manual" };
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
    const parsed = extractJson(raw);
    const cards = (Array.isArray(parsed.cards) ? parsed.cards : [])
      .filter((c) => c && typeof c === "object")
      .map((c) => ({
        front: typeof c.front === "string" ? c.front : "",
        back: typeof c.back === "string" ? c.back : "",
      }))
      .filter((c) => c.front || c.back)
      .slice(0, 20);
    if (cards.length === 0) return manualFlashcardsFallback(courseName, moduleTitle, topicList);
    return { cards, source: "ai" };
  } catch (e) {
    console.warn("Flashcard AI generation failed:", e.message);
    return manualFlashcardsFallback(courseName, moduleTitle, topicList);
  }
};

/** Raw generation for frontend custom workflows */
export const generateRawContent = async (prompt) => {
  return await aiRouter.safeGenerate(prompt, "generate");
};
