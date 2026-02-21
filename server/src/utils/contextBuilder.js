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
