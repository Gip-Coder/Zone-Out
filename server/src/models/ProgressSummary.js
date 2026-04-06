import mongoose from "mongoose";

const progressSummarySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD format
      required: true,
    },
    focus: {
      periodType: { type: String, enum: ["daily", "weekly", "monthly"], default: "weekly" },
      goalMinutes: { type: Number, default: 0 },
      minutesCompleted: { type: Number, default: 0 },
    },
    goals: {
      month: { type: String, default: "" }, // YYYY-MM
      completed: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    modules: {
      semesterId: { type: String, default: "" },
      completed: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Ensure only one summary exists per user per day
progressSummarySchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model("ProgressSummary", progressSummarySchema);
