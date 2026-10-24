import { generateAIResponse, generateThinkResponse, generateChatResponse, generateFlashcards, generateRawContent } from "../services/aiService.js";
import { httpError, isNonEmptyString } from "../utils/validators.js";

// Input bounds keep a single request from running up provider cost.
const MAX_MESSAGE_CHARS = 4000;
const MAX_HISTORY_ITEMS = 50;
const MAX_CONTEXT_CHARS = 8000;
const MAX_PROMPT_CHARS = 30000; // syllabus prompts embed up to 20k chars of text
const MAX_TOPICS = 50;

const readContext = (context) => {
  if (context === undefined || context === null) return {};
  if (typeof context !== "object" || Array.isArray(context)) throw httpError(400, "context must be an object");
  if (JSON.stringify(context).length > MAX_CONTEXT_CHARS) throw httpError(400, "context is too large");
  return context;
};

/** Translates a provider failure into a client-safe 503 while keeping validation 400s. */
const sendAIError = (res, error, label) => {
  if (error.status) return res.status(error.status).json({ message: error.message });
  console.error(`${label}:`, error.message);
  res.status(503).json({ message: "AI service is temporarily unavailable" });
};

export const handleFlashcardsRequest = async (req, res) => {
  try {
    const { courseName, moduleTitle, topics } = req.body || {};
    if (courseName !== undefined && typeof courseName !== "string") throw httpError(400, "courseName must be a string");
    if (moduleTitle !== undefined && typeof moduleTitle !== "string") throw httpError(400, "moduleTitle must be a string");
    if (topics !== undefined && !Array.isArray(topics)) throw httpError(400, "topics must be an array");
    const topicList = (topics || []).filter((t) => isNonEmptyString(t, 300)).slice(0, MAX_TOPICS);

    const result = await generateFlashcards({
      courseName: courseName?.slice(0, 200),
      moduleTitle: moduleTitle?.slice(0, 200),
      topics: topicList,
    });
    res.json(result);
  } catch (error) {
    sendAIError(res, error, "Flashcards generation failed");
  }
};

export const handleAIRequest = async (req, res) => {
  try {
    const { message, context, history } = req.body || {};
    if (!isNonEmptyString(message, MAX_MESSAGE_CHARS)) throw httpError(400, `message is required (max ${MAX_MESSAGE_CHARS} chars)`);

    if (Array.isArray(history)) {
      const cleanHistory = history
        .slice(-MAX_HISTORY_ITEMS)
        .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
        .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) }));
      const response = await generateChatResponse(message, cleanHistory);
      return res.json({ response });
    }
    const response = await generateAIResponse(message, readContext(context));
    res.json({ response });
  } catch (error) {
    sendAIError(res, error, "AI chat failed");
  }
};

export const handleThinkRequest = async (req, res) => {
  try {
    const { userInput, context } = req.body || {};
    if (!isNonEmptyString(userInput, MAX_MESSAGE_CHARS)) throw httpError(400, `userInput is required (max ${MAX_MESSAGE_CHARS} chars)`);

    const result = await generateThinkResponse(userInput, readContext(context));
    res.json(result);
  } catch (error) {
    sendAIError(res, error, "AI think failed");
  }
};

export const handleGenerateRequest = async (req, res) => {
  try {
    const { prompt } = req.body || {};
    if (!isNonEmptyString(prompt, MAX_PROMPT_CHARS)) throw httpError(400, `Prompt is required (max ${MAX_PROMPT_CHARS} chars)`);

    const response = await generateRawContent(prompt);
    res.json({ response });
  } catch (error) {
    sendAIError(res, error, "AI generate text failed");
  }
};
