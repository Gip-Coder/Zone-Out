export function trimPrompt(prompt, maxLength) {
  if (!prompt) return "";
  if (prompt.length > maxLength) {
    return prompt.substring(0, maxLength) + "...[truncated]";
  }
  return prompt;
}

export function prepareGeminiPrompt(prompt) {
  return trimPrompt(prompt, 1800);
}

export function prepareOpenSourcePrompt(prompt) {
  return trimPrompt(prompt, 1200);
}

export function prepareClaudePrompt(prompt) {
  return trimPrompt(prompt, 4000);
}
