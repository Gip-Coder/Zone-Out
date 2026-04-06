import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { logProgress, getProgress, getSummary, logProgressEvent, setFocusGoal } from "../controllers/progressController.js";

const router = express.Router();

router.post("/", protect, logProgress);
router.get("/", protect, getProgress);

router.get("/summary", protect, getSummary);
router.post("/event", protect, logProgressEvent);
router.post("/set-focus-goal", protect, setFocusGoal);

export default router;
