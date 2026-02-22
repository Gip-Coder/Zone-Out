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

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/progress", progressRoutes);

app.use(errorHandler);
app.use("/api/goals", goalRoutes);

app.listen(process.env.PORT, () => {
  console.log("Server running");
});
