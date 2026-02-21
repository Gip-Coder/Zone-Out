import express from "express";
import Goal from "../models/Goal.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all goals
router.get("/", protect, async (req, res) => {
  const goals = await Goal.find({ user: req.user });
  res.json(goals);
});


// CREATE new goal
router.post("/", protect, async (req, res) => {
  try {
    const goal = await Goal.create({
      ...req.body,
      user: req.user,
    });

    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// TOGGLE complete
router.put("/:id", async (req, res) => {
  try {
    const updatedGoal = await Goal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedGoal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE goal
router.delete("/:id", async (req, res) => {
  try {
    await Goal.findByIdAndDelete(req.params.id);
    res.json({ message: "Goal deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
