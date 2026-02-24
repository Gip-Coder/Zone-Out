import { GoogleGenerativeAI } from "@google/generative-ai";
import { api } from "../services/apiClient";

const MODEL_CONTROL = "gemini-3-flash";
const MODEL_CHAT = "gemini-3-flash";
const MODEL_QUEUE = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-3-flash",
];

/**
 * Centralized AI Brain: control + access over the entire app, and raw generation for features (quiz, video, syllabus, etc.).
 * - think(): control flow — understands user intent and returns { text, action? }; runs dispatch when provided.
 * - chat(): conversational Q&A for student doubts (no app control).
 * - generateContent(): raw prompt/response for quiz, video rec, syllabus parse, file sort, etc.
 * When Gemini quota is exceeded or unavailable, think() and chat() fall back to the backend (OpenRouter → Gemini).
 */
export class Brain {
  constructor(getAppState = null, dispatch = null) {
    this.getAppState = getAppState;
    this.dispatch = dispatch;
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
    this.genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
    this.controlModel = this.genAI?.getGenerativeModel({ model: MODEL_CONTROL }) ?? null;
    this.chatModel = this.genAI
      ? this.genAI.getGenerativeModel({
        model: MODEL_CHAT,
        systemInstruction: `You are ZoneOut Study Buddy — a friendly study expert for students. Answer doubts clearly with bullet points and short explanations. Keep replies helpful and under 4–5 sentences. You do NOT control the app; you only help with study questions and concepts.`,
      })
      : null;
  }

  /**
   * Control mode: user says something → Brain returns reply text and optional action; dispatch runs the action.
   * Uses Gemini when available; falls back to backend /api/ai/think when quota exceeded or no key.
   */
  async think(userInput) {
    if (!this.getAppState || !this.dispatch) {
      throw new Error("Brain.think() requires getAppState and dispatch.");
    }
    const state = this.getAppState();
    const context = this._buildControlContext(state);
    const prompt = `You are Study Buddy with CONTROL over this app.
USER: "${userInput}"
APP CONTEXT: ${JSON.stringify(context)}

AVAILABLE ACTIONS (return JSON "action" only when user asks to do something):
1. { "type": "SET_TIMER", "minutes": number }
2. { "type": "STOP_TIMER" } or { "type": "PAUSE_TIMER" }
3. { "type": "NAVIGATE", "view": "dashboard" | "goals" | "notes" | "course", "courseId": optional }
4. { "type": "ADD_GOAL", "title": string, "date": "YYYY-MM-DD", "plan": optional }
5. { "type": "OPEN_RESOURCE", "resource": "notes", "moduleName": string }

Respond STRICTLY in RAW JSON only:
{ "text": "your reply", "action": { ... } optional }`;

    try {
      if (this.controlModel) {
        const result = await this.controlModel.generateContent(prompt);
        const text = result.response.text();
        const parsed = this.cleanAndParseJSON(text);
        if (parsed.action) await this.dispatch(parsed.action);
        return parsed.text;
      }
    } catch (e) {
      // Fall through to backend (quota, no key, network, etc.)
    }

    try {
      const data = await api.post("/ai/think", { userInput, context });
      if (data.action) await this.dispatch(data.action);
      return data.text || "";
    } catch (apiError) {
      throw new Error(apiError.message || "AI think failed");
    }
  }

  _buildControlContext(state) {
    if (!state) return {};
    return {
      activeTab: state.activeTab,
      view: state.view,
      activeCourse: state.activeCourse
        ? {
          name: state.activeCourse.name,
          id: state.activeCourse.id,
          modules: state.activeCourse.modules?.map((m) => m.title),
          syllabus: state.activeCourse.syllabus?.substring?.(0, 500),
        }
        : null,
      activeCourseId: state.activeCourseId,
      timer: {
        minutesLeft: state.focusTime != null ? Math.floor(state.focusTime / 60) : null,
        seconds: state.focusTime,
        running: state.isFocusRunning,
      },
      goalsCount: state.goals?.length ?? 0,
    };
  }

  /**
   * Chat mode: general student queries and doubts. No app control. Returns reply text.
   * Uses Gemini when available; falls back to backend /api/ai/chat when quota exceeded or no key.
   */
  async chat(userMessage, conversationHistory = []) {
    const history = conversationHistory
      .filter((m) => m.role && m.content != null)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      if (this.chatModel) {
        const geminiHistory = history.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));
        const chatSession = this.chatModel.startChat({ history: geminiHistory });
        const result = await chatSession.sendMessage(userMessage);
        return result.response.text();
      }
    } catch (e) {
      // Fall through to backend
    }

    try {
      const data = await api.post("/ai/chat", { message: userMessage, history });
      return data.response ?? "";
    } catch (apiError) {
      throw new Error(apiError.message || "AI chat failed");
    }
  }

  /**
   * Raw generation with retry (for quiz, video, syllabus, file sort, etc.).
   * Returns GenerateContentResult; use response.text() then cleanAndParseJSON if needed.
   * Requires Gemini key; no backend fallback for this method yet.
   */
  async generateContent(prompt, options = {}) {
    if (!this.genAI) throw new Error("AI unavailable for this feature. Set VITE_GEMINI_API_KEY or use backend.");
    const { currentModelIndex = 0, setModelIndex } = options;
    let attempt = 0;
    let activeIndex = typeof currentModelIndex === "number" ? currentModelIndex : 0;

    while (attempt < MODEL_QUEUE.length) {
      const modelName = MODEL_QUEUE[activeIndex];
      try {
        const model = this.genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        if (setModelIndex && activeIndex !== currentModelIndex) {
          setModelIndex(activeIndex);
        }
        return result;
      } catch (e) {
        const msg = (e && e.message) || "";
        if (msg.includes("429") || msg.includes("404") || msg.includes("503")) {
          activeIndex = (activeIndex + 1) % MODEL_QUEUE.length;
          attempt++;
        } else {
          throw e;
        }
      }
    }
    throw new Error("All AI models are currently busy.");
  }

  /**
   * Parse JSON from model output (strips markdown and invalid trailing commas).
   */
  cleanAndParseJSON(text) {
    try {
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      if (start === -1 || end === -1) {
        const alt = text.replace(/```json|```/g, "").trim();
        const s = alt.indexOf("{");
        const e = alt.lastIndexOf("}");
        if (s === -1 || e === -1) throw new Error("No JSON found");
        text = alt;
        const cleaned = text
          .substring(s, e + 1)
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
          .replace(/\\n/g, " ")
          .replace(/,\s*}/g, "}")
          .replace(/,\s*]/g, "]");
        return JSON.parse(cleaned);
      }
      let cleaned = text
        .substring(start, end + 1)
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
        .replace(/\\n/g, " ")
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]");
      return JSON.parse(cleaned);
    } catch (e) {
      console.error("Brain.cleanAndParseJSON", e);
      throw e;
    }
  }
}
