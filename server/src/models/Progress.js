import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["focus", "module"],
      required: true,
    },
    durationMinutes: {
      type: Number,
      default: 0,
    },
    courseName: {
      type: String,
      default: null,
    },
    moduleTitle: {
      type: String,
      default: null,
    },
    date: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Progress", progressSchema);
