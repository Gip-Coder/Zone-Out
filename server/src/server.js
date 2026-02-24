import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

// LOAD ENV FIRST
dotenv.config();

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import goalRoutes from "./routes/goalRoutes.js";

connectDB();

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://zone-out-jade.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/progress", progressRoutes);

app.use("/api/goals", goalRoutes);

// Error Handler must be the LAST middleware
app.use(errorHandler);

// Export app for Vercel Serverless
export default app;

// Only start the server locally if not in a serverless environment
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
