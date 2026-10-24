// Starts the real Express API against an in-memory MongoDB for end-to-end
// tests. Every credential is overridden BEFORE the app loads so nothing can
// reach the production database, Gemini, or Firebase from a test run.
import { MongoMemoryServer } from "mongodb-memory-server";

const mongod = await MongoMemoryServer.create();

Object.assign(process.env, {
  NODE_ENV: "test",
  PORT: process.env.E2E_API_PORT || "5055",
  MONGO_URI: mongod.getUri(),
  JWT_SECRET: "e2e-jwt-secret",
  GEMINI_API_KEY: "",
  GEMINI_CHAT_KEY: "",
  GEMINI_CONTROL_KEY: "",
  GEMINI_GEN_KEY: "",
  FIREBASE_PROJECT_ID: "",
  FIREBASE_CLIENT_EMAIL: "",
  FIREBASE_PRIVATE_KEY: "",
});

const { default: connectDB } = await import("../server/src/config/db.js");
const { default: app } = await import("../server/src/app.js");

await connectDB();
const server = app.listen(Number(process.env.PORT), () => {
  console.log(`E2E API listening on ${process.env.PORT}`);
});

const shutdown = async () => {
  server.close();
  await mongod.stop();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
