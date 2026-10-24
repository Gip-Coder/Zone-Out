// LOAD ENV FIRST — must be the first import so modules that read process.env
// at load time (AI router, Firebase admin) see the values from .env.
import "dotenv/config";

import connectDB from "./config/db.js";
import app from "./app.js";

connectDB();

// Export app for Vercel Serverless
export default app;

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
