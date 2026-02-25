import { api } from "./apiClient";

export class NeuralBrain {
  constructor(getAppState, dispatch) {
    this.getAppState = getAppState;
    this.dispatch = dispatch;
    // No more client-side model initialization
  }

  async think(userInput) {

    const state = this.getAppState();

    const context = {
      view: state.view,
      activeCourse: state.activeCourse
        ? {
          name: state.activeCourse.name,
          modules: state.activeCourse.modules?.map(m => m.title)
        }
        : null,
      timer: {
        seconds: state.focusTime,
        running: state.isFocusRunning
      },
      goalsCount: state.goals?.length || 0
    };

    const prompt = `
You are NeuralOS Brain.
You CONTROL the application.

USER: "${userInput}"
APP_CONTEXT: ${JSON.stringify(context)}

AVAILABLE ACTIONS:
1. { "type": "SET_TIMER", "minutes": number }
2. { "type": "STOP_TIMER" }
3. { "type": "NAVIGATE", "view": "dashboard" | "goals" | "course-detail" }
4. { "type": "ADD_GOAL", "title": string }

Respond STRICTLY in RAW JSON:

{
  "text": "your reply",
  "action": { ...optional }
}
`;

    try {
      const result = await api.post("/ai/generate", { prompt });
      const text = result.response || "";

      const clean = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(clean);

      if (parsed.action) {
        await this.dispatch(parsed.action);
      }

      return parsed.text;
    } catch (e) {
      console.error("NeuralBrain generate error", e);
      throw new Error("NeuralBrain failed to think.");
    }
  }
}