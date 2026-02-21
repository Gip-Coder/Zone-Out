import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL = "gemini-2.5-flash";

export class NeuralBrain {

  constructor(getAppState, dispatch) {
    this.getAppState = getAppState;
    this.dispatch = dispatch;

    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");
    this.model = genAI.getGenerativeModel({ model: MODEL });
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

    const result = await this.model.generateContent(prompt);
    const text = result.response.text();

    const clean = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(clean);

    if (parsed.action) {
      await this.dispatch(parsed.action);
    }

    return parsed.text;
  }
}