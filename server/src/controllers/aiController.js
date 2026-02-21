import { generateAIResponse } from "../services/aiService.js";

export const handleAIRequest = async (req, res) => {
  const { message, context } = req.body;

  try {
    const response = await generateAIResponse(message, context);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ message: "AI failed" });
  }
};
