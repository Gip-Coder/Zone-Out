import { generateAIResponse, generateThinkResponse, generateChatResponse, generateFlashcards, generateRawContent } from "../services/aiService.js";

export const handleFlashcardsRequest = async (req, res) => {
  try {
    const { courseName, moduleTitle, topics } = req.body;
    const result = await generateFlashcards({ courseName, moduleTitle, topics: topics || [] });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Flashcards generation failed" });
  }
};

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
    console.error("AI think failed:", error);
    res.status(500).json({ message: "AI think failed" });
  }
};

export const handleGenerateRequest = async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ message: "Prompt is required" });

  try {
    const response = await generateRawContent(prompt);
    res.json({ response });
  } catch (error) {
    console.error("AI generate text failed:", error);
    res.status(500).json({ message: "AI text generation failed" });
  }
};
