import { generateAIResponse, generateThinkResponse, generateChatResponse } from "../services/aiService.js";

export const handleAIRequest = async (req, res) => {
  const { message, context, history } = req.body;

  try {
    if (Array.isArray(history)) {
      const response = await generateChatResponse(message, history);
      return res.json({ response });
    }
    const response = await generateAIResponse(message, context || {});
    res.json({ response });
  } catch (error) {
    res.status(500).json({ message: "AI failed" });
  }
};

export const handleThinkRequest = async (req, res) => {
  const { userInput, context } = req.body;

  try {
    const result = await generateThinkResponse(userInput, context || {});
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "AI think failed" });
  }
};
