import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { handleAIRequest } from "../controllers/aiController.js";

const router = express.Router();

router.post("/chat", protect, handleAIRequest);

export default router;
