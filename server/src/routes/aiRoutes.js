import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { handleAIRequest, handleThinkRequest } from "../controllers/aiController.js";

const router = express.Router();

router.post("/chat", protect, handleAIRequest);
router.post("/think", protect, handleThinkRequest);

export default router;
