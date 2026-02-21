import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { handleAIRequest, handleThinkRequest, handleFlashcardsRequest } from "../controllers/aiController.js";

const router = express.Router();

router.post("/chat", protect, handleAIRequest);
router.post("/think", protect, handleThinkRequest);
router.post("/flashcards", protect, handleFlashcardsRequest);

export default router;
