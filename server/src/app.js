import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

const DEFAULT_ORIGINS = [
  "http://localhost:5173",
  "https://zone-out-jade.vercel.app",
];

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
  : DEFAULT_ORIGINS;

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1); // Render / Vercel sit behind a single proxy hop

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "200kb" }));
app.use(cookieParser());

if (process.env.DEBUG_REQUESTS === "true") {
  app.use((req, res, next) => {
    console.log(`[DEBUG] ${req.method} ${req.path}`);
    next();
  });
}

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/goals", goalRoutes);

app.use("/api", notFound);

// Error Handler must be the LAST middleware
app.use(errorHandler);

export default app;
