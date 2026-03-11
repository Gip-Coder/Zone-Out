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
      // Temporary manual brain fallback for control commands
      const lower = userInput.toLowerCase();
      
      if ((lower.includes("start") || lower.includes("set")) && lower.includes("timer")) {
         const match = lower.match(/(\d+)\s*min/);
         const minutes = match ? parseInt(match[1]) : 25;
         if (this.dispatch) await this.dispatch({ type: 'SET_TIMER', minutes });
         return `(Fallback Mode): I've set a ${minutes} minute focus timer for you!`;
      } else if ((lower.includes("stop") || lower.includes("pause")) && lower.includes("timer")) {
         if (this.dispatch) await this.dispatch({ type: 'STOP_TIMER' });
         return "(Fallback Mode): Timer paused.";
      } else if (lower.includes("goal") || lower.includes("timeline")) {
         if (this.dispatch) await this.dispatch({ type: 'NAVIGATE', view: 'goals' });
         return "(Fallback Mode): Taking you to your timeline and goals.";
      } else if (lower.includes("vault") || lower.includes("course") || lower.includes("notes")) {
         if (this.dispatch) await this.dispatch({ type: 'NAVIGATE', view: 'notes' });
         return "(Fallback Mode): Navigating to your course vault.";
      }

      return "I'm currently running on a fallback mock. I couldn't understand that command, but my main AI brain is temporarily offline!";
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
      // Temporary manual brain fallback for conversational chat
      const lower = userMessage.toLowerCase();
      
      if (lower.includes("hello") || lower.includes("hi")) {
        return "(Fallback Bot): Hello there! My main AI connection is temporarily offline, but I'm here to help with basic tasks. How is your studying going?";
      } else if (lower.includes("timer") || lower.includes("focus")) {
        return "(Fallback Bot): It sounds like you want to use the timer. Try giving me a command like 'start a 25 minute timer'.";
      } else if (lower.includes("goal") || lower.includes("plan")) {
        return "(Fallback Bot): Need help managing goals? You can ask me to 'go to goals' or add them directly from the Timeline view.";
      } else if (lower.includes("help")) {
        return "(Fallback Bot): I'm your ZoneOut fallback assistant. I can help navigate the app or start timers (e.g., 'start a 10 min timer'). My advanced AI answers are currently unavailable.";
      } else if (lower.includes("what is") || lower.includes("how to") || lower.includes("explain")) {
        return "(Fallback Bot): That's a great question! Unfortunately, my advanced AI capabilities are currently unavailable due to an API issue, so I can't give a detailed explanation right now. Please check your course notes for now!";
      } else {
        return `(Fallback Bot): You said "${userMessage}". Since my main brain is offline, I can't process complex study queries at the moment, but your query has been logged!`;
      }
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
      // Format a robust robust fallback based on what they are trying to generate 
      // This will prevent JSON parse errors for generate flows
      return {
        response: {
          text: () => "{}"
        }
      };
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
