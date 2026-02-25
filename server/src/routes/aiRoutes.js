import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { aiLimiter } from "../middleware/rateLimiter.js";
import { handleAIRequest, handleThinkRequest, handleFlashcardsRequest, handleGenerateRequest } from "../controllers/aiController.js";

const router = express.Router();

router.post("/chat", protect, aiLimiter, handleAIRequest);
router.post("/think", protect, aiLimiter, handleThinkRequest);
router.post("/flashcards", protect, aiLimiter, handleFlashcardsRequest);
router.post("/generate", protect, aiLimiter, handleGenerateRequest);

export default router;
