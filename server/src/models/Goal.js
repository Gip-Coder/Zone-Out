import mongoose from "mongoose";

const subTaskSchema = new mongoose.Schema({
  task: String,
  done: {
    type: Boolean,
    default: false,
  },
});

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    targetDate: {
      type: String,
      default: "",
    },
    plan: {
      type: [subTaskSchema],
      default: [],
    },
  },
  { timestamps: true }
);


export default mongoose.model("Goal", goalSchema);
