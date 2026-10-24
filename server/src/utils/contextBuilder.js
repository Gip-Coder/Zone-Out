/** Word budgets that keep token usage low without cutting the user's message. */
export const MAX_MESSAGE_WORDS = 300;
export const MAX_HISTORY_WORDS = 120;

const words = (text) => String(text).split(/\s+/).filter(Boolean);

export const capWords = (text, max) => {
  const w = words(text);
  return w.length <= max ? String(text).trim() : `${w.slice(0, max).join(" ")}...`;
};

/**
 * Most recent history turns that fit in `maxWords`, oldest first. Older turns
 * are dropped before newer ones; the new message is never truncated away.
 */
export const recentHistory = (conversationHistory = [], maxWords = MAX_HISTORY_WORDS) => {
  const lines = [];
  let used = 0;
  const valid = conversationHistory.filter((m) => m && m.role && m.content != null);
  for (let i = valid.length - 1; i >= 0; i--) {
    const m = valid[i];
    const line = `${m.role === "user" ? "User" : "Assistant"}: ${String(m.content).trim()}`;
    const count = words(line).length;
    if (used + count > maxWords) {
      // Always keep at least a trimmed version of the latest turn for context
      if (lines.length === 0) lines.unshift(capWords(line, maxWords));
      break;
    }
    lines.unshift(line);
    used += count;
  }
  return lines.join("\n");
};

export const buildContextPrompt = (message, context) => {
  return `
You are a productivity AI assistant.

User context:
Active goal: ${context?.goal || "None"}
Focus time today: ${context?.focusTime || 0}

User message:
${capWords(message, MAX_MESSAGE_WORDS)}
`;
};

/** For Study Buddy control flow: returns JSON { text, action? } */
export const buildThinkPrompt = (userInput, appContext) => {
  return `You are Study Buddy with CONTROL over this app.
USER: "${userInput}"
APP CONTEXT: ${JSON.stringify(appContext || {})}

CRITICAL: If the user requests an action for a widget that is NOT in 'availableWidgets' (such as setting the timer when 'timer' is missing), you MUST NOT dispatch any actions. Instead, respond politely explaining that the requested widget is not currently on their dashboard.

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
  const historyStr = recentHistory(conversationHistory);
  const prefix = historyStr
    ? `Previous conversation:\n${historyStr}\n\nNow respond to this new message only.\nUser: `
    : "User: ";
  return `You are ZoneOut Study Buddy — a friendly study expert for students. Answer doubts clearly with bullet points and short explanations. Keep replies helpful and under 4–5 sentences. You do NOT control the app; you only help with study questions and concepts.

${prefix}${capWords(message, MAX_MESSAGE_WORDS)}`;
};
