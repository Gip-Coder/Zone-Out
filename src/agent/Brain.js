import { api } from "../services/apiClient";

/**
 * Centralized AI Brain: control + access over the entire app, and raw generation for features (quiz, video, syllabus, etc.).
 * - think(): control flow — understands user intent and returns { text, action? }; runs dispatch when provided.
 * - chat(): conversational Q&A for student doubts (no app control).
 * - generateContent(): raw prompt/response.
 * All logic has been migrated back to the backend for security and modularity.
 */
export class Brain {
  constructor(getAppState = null, dispatch = null) {
    this.getAppState = getAppState;
    this.dispatch = dispatch;
    // No more client-side model initialization
  }

  /**
   * Control mode: user says something → Brain returns reply text and optional action; dispatch runs the action.
   * Relies entirely on backend /api/ai/think endpoint.
   */
  async think(userInput) {
    if (!this.getAppState || !this.dispatch) {
      throw new Error("Brain.think() requires getAppState and dispatch.");
    }
    const state = this.getAppState();
    const context = this._buildControlContext(state);

    try {
      const data = await api.post("/ai/think", { userInput, context });
      if (data.action) await this.dispatch(data.action);
      return data.text || "";
    } catch (error) {
      console.error("AI think failed", error);
      throw new Error(error.message || "AI think failed");
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
   * Calls backend /api/ai/chat.
   */
  async chat(userMessage, conversationHistory = []) {
    const history = conversationHistory
      .filter((m) => m.role && m.content != null)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const data = await api.post("/ai/chat", { message: userMessage, history });
      return data.response ?? "";
    } catch (error) {
      console.error("AI chat failed", error);
      throw new Error(error.message || "AI chat failed");
    }
  }

  /**
   * Raw generation (for quiz, video, syllabus, file sort, etc.).
   * Now calls the secure backend '/ai/generate'.
   * Returns a simulated "GenerateContentResult" by providing a `.response.text()` method.
   */
  async generateContent(prompt, options = {}) {
    try {
      const data = await api.post("/ai/generate", { prompt });
      // Wrap it so existing frontend code calling `const text = result.response.text();` still works
      return {
        response: {
          text: () => data.response || ""
        }
      };
    } catch (error) {
      console.error("AI generate failed:", error);
      throw new Error(error.message || "AI generate content failed");
    }
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
