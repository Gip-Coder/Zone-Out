import { api } from "../services/apiClient";
import { validateAction, MAX_TIMER_MINUTES } from "./actions";

/**
 * Centralized AI Brain: control + access over the entire app, and raw generation for features.
 * - think(): control flow — understands user intent and returns { text, action? }.
 * - chat(): conversational Q&A for student doubts.
 * - generateContent(): raw prompt/response.
 * All advanced AI logic has been migrated back to the backend. 
 */
export class Brain {
  constructor(getAppState = null, dispatch = null) {
    this.getAppState = getAppState;
    this.dispatch = dispatch;
    
    // Prevent rapid repeated calls (simple frontend rate guard)
    this.lastRequestTime = 0;
  }

  /**
   * Lightweight Intent Router (Step 8/9)
   * Prevents unnecessary AI calls for short/rigid navigational commands.
   */
  shouldUseAI(input) {
    const lower = input.toLowerCase().trim();
    
    if ((lower.includes("start") || lower.includes("set")) && lower.includes("timer")) {
      const minMatch = lower.match(/(\d+)\s*min/);
      const hourMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)\b/);
      const minutes = minMatch ? parseInt(minMatch[1], 10) : hourMatch ? Math.round(parseFloat(hourMatch[1]) * 60) : 25;
      const action = validateAction({ type: 'SET_TIMER', minutes });
      if (!action) {
        return { useAI: false, text: `Timers can be between 1 and ${MAX_TIMER_MINUTES} minutes.` };
      }
      return { useAI: false, text: `I've set a ${action.minutes} minute focus timer for you!`, action };
    }
    
    if ((lower.includes("stop") || lower.includes("pause")) && lower.includes("timer")) {
      return { useAI: false, text: "Timer paused.", action: { type: 'STOP_TIMER' } };
    }

    if (lower === "goals" || lower.includes("timeline")) {
      return { useAI: false, text: "Taking you to your timeline and goals.", action: { type: 'NAVIGATE', view: 'goals' } };
    }

    if (lower === "vault" || lower === "courses" || lower === "notes") {
      return { useAI: false, text: "Navigating to your course vault.", action: { type: 'NAVIGATE', view: 'notes' } };
    }
    
    if (lower === "dashboard" || lower === "home") {
      return { useAI: false, text: "Navigating to dashboard.", action: { type: 'NAVIGATE', view: 'dashboard' } };
    }

    return { useAI: true };
  }

  /**
   * Control mode: user says something → Brain returns reply text and optional action.
   */
  async think(userInput) {
    if (!this.getAppState || !this.dispatch) {
      throw new Error("Brain.think() requires getAppState and dispatch.");
    }

    // Rate Guard: prevent rapid spam
    const now = Date.now();
    if (now - this.lastRequestTime < 1000) {
      return "Please wait a moment before sending another request.";
    }
    this.lastRequestTime = now;

    // Intent routing
    const intent = this.shouldUseAI(userInput);
    if (!intent.useAI) {
      if (intent.action) await this.dispatch(intent.action);
      return intent.text;
    }

    const state = this.getAppState();
    const context = this._buildControlContext(state);

    try {
      const data = await api.post("/ai/think", { userInput, context });
      // Model output is untrusted: only dispatch allowlisted, in-range actions
      const action = validateAction(data?.action);
      if (action) await this.dispatch(action);
      return data?.text || "";
    } catch (error) {
      console.error("AI think failed", error);
      return "I couldn't understand that command, my brain is temporarily offline!";
    }
  }

  _buildControlContext(state) {
    if (!state) return {};
    return {
      availableWidgets: state.availableWidgets,
      activeTab: state.activeTab,
      view: state.view,
      activeCourse: state.activeCourse
        ? {
          name: state.activeCourse.name,
          id: state.activeCourse.id,
          modules: state.activeCourse.modules?.map((m) => m.title),
        }
        : null,
      timer: {
        minutesLeft: state.focusTime != null ? Math.floor(state.focusTime / 60) : null,
        seconds: state.focusTime,
        running: state.isFocusRunning,
      },
    };
  }

  /**
   * Chat mode: general Q&A.
   */
  async chat(userMessage, conversationHistory = []) {
    const now = Date.now();
    if (now - this.lastRequestTime < 1000) {
      return "Slow down! Wait a second before asking a new question.";
    }
    this.lastRequestTime = now;

    const history = conversationHistory
      .filter((m) => m.role && m.content != null)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const data = await api.post("/ai/chat", { message: userMessage, history });
      return data.response ?? "";
    } catch (error) {
      console.warn("AI chat unavailable:", error.message);
      return "Hello! I am currently running offline, you might want to try again later.";
    }
  }

  /**
   * Raw generation that resolves to the model's text and REJECTS on failure or
   * empty output, so callers can fall back to their manual implementations.
   */
  async generateWithRouter(prompt) {
    const data = await api.post("/ai/generate", { prompt });
    const text = typeof data?.response === "string" ? data.response : "";
    if (!text.trim()) throw new Error("Empty AI response");
    return text;
  }

  /**
   * Raw generation for features.
   */
  async generateContent(prompt) {
    try {
      const data = await api.post("/ai/generate", { prompt });
      return {
        response: { text: () => data.response || "" }
      };
    } catch (error) {
      console.error("AI generate failed:", error);
      return {
        response: { text: () => "{}" }
      };
    }
  }

  cleanAndParseJSON(text) {
    try {
      let cleaned = String(text ?? "").replace(/```json|```/g, "").trim();
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");
      if (start === -1 || end === -1) throw new Error("No JSON found");
      const jsonStr = cleaned
        .substring(start, end + 1)
        // eslint-disable-next-line no-control-regex -- strip control chars models sometimes emit
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ")
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]");
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error("Brain.cleanAndParseJSON", e);
      throw e;
    }
  }
}
