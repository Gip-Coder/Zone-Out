import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { logProgress, getProgress } from "../controllers/progressController.js";

const router = express.Router();

router.post("/", protect, logProgress);
router.get("/", protect, getProgress);

export default router;
