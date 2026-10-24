import express from "express";
import Goal from "../models/Goal.js";
import { protect } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/errorMiddleware.js";
import { isDateString, isNonEmptyString, isObjectId, httpError } from "../utils/validators.js";

const router = express.Router();

const MAX_TEXT = 500;
const MAX_PLAN_ITEMS = 100;

// Every goal route requires an authenticated user.
router.use(protect);

/**
 * Build a sanitized update from the request body. Only user-editable fields are
 * accepted, so a client can never reassign `user` or other internal fields.
 */
function pickGoalFields(body, { requireText }) {
  const out = {};
  if (body == null || typeof body !== "object") throw httpError(400, "Invalid body");

  if (body.text !== undefined || requireText) {
    if (!isNonEmptyString(body.text, MAX_TEXT)) throw httpError(400, `Goal text is required (max ${MAX_TEXT} chars)`);
    out.text = body.text.trim();
  }
  if (body.completed !== undefined) {
    if (typeof body.completed !== "boolean") throw httpError(400, "completed must be a boolean");
    out.completed = body.completed;
  }
  if (body.targetDate !== undefined) {
    if (body.targetDate !== "" && !isDateString(body.targetDate)) throw httpError(400, "targetDate must be YYYY-MM-DD");
    out.targetDate = body.targetDate;
  }
  if (body.plan !== undefined) {
    if (!Array.isArray(body.plan) || body.plan.length > MAX_PLAN_ITEMS) throw httpError(400, "plan must be an array");
    out.plan = body.plan.map((p) => {
      if (!p || !isNonEmptyString(p.task, MAX_TEXT)) throw httpError(400, "Each plan item needs a task");
      return { task: p.task.trim(), done: p.done === true };
    });
  }
  return out;
}

const requireGoalId = (req) => {
  if (!isObjectId(req.params.id)) throw httpError(404, "Goal not found");
};

// GET all goals (newest first, matching how the UI prepends new goals)
router.get("/", asyncHandler(async (req, res) => {
  const goals = await Goal.find({ user: req.user }).sort({ createdAt: -1 });
  res.json(goals);
}));

// CREATE new goal
router.post("/", asyncHandler(async (req, res) => {
  const fields = pickGoalFields(req.body, { requireText: true });
  const goal = await Goal.create({ ...fields, user: req.user });
  res.status(201).json(goal);
}));

// UPDATE (toggle complete, change deadline, edit plan) — owner only
router.put("/:id", asyncHandler(async (req, res) => {
  requireGoalId(req);
  const fields = pickGoalFields(req.body, { requireText: false });
  const updatedGoal = await Goal.findOneAndUpdate(
    { _id: req.params.id, user: req.user },
    { $set: fields },
    { returnDocument: "after", runValidators: true }
  );
  if (!updatedGoal) throw httpError(404, "Goal not found");
  res.json(updatedGoal);
}));

// DELETE goal — owner only
router.delete("/:id", asyncHandler(async (req, res) => {
  requireGoalId(req);
  const deleted = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user });
  if (!deleted) throw httpError(404, "Goal not found");
  res.json({ message: "Goal deleted" });
}));

export default router;
