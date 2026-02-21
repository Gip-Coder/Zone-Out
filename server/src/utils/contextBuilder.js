export const buildContextPrompt = (message, context) => {
  return `
You are a productivity AI assistant.

User context:
Active goal: ${context?.goal || "None"}
Focus time today: ${context?.focusTime || 0}

User message:
${message}
`;
};

/** For Study Buddy control flow: returns JSON { text, action? } */
export const buildThinkPrompt = (userInput, appContext) => {
  return `You are Study Buddy with CONTROL over this app.
USER: "${userInput}"
APP CONTEXT: ${JSON.stringify(appContext || {})}

AVAILABLE ACTIONS (return JSON "action" only when user asks to do something):
1. { "type": "SET_TIMER", "minutes": number }
2. { "type": "STOP_TIMER" } or { "type": "PAUSE_TIMER" }
3. { "type": "NAVIGATE", "view": "dashboard" | "goals" | "notes" | "course", "courseId": optional }
4. { "type": "ADD_GOAL", "title": string, "date": "YYYY-MM-DD", "plan": optional }
5. { "type": "OPEN_RESOURCE", "resource": "notes", "moduleName": string }

Respond STRICTLY in RAW JSON only:
{ "text": "your reply", "action": { ... } optional }`;
};

/** For Study Buddy Q&A chat (no control). */
export const buildChatPrompt = (message, conversationHistory = []) => {
  const historyStr = conversationHistory
    .filter((m) => m.role && m.content != null)
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");
  const prefix = historyStr
    ? `Previous conversation:\n${historyStr}\n\nNow respond to this new message only.\nUser: `
    : "User: ";
  return `You are ZoneOut Study Buddy — a friendly study expert for students. Answer doubts clearly with bullet points and short explanations. Keep replies helpful and under 4–5 sentences. You do NOT control the app; you only help with study questions and concepts.

${prefix}${message}`;
};
