import mongoose from "mongoose";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  try {
    if (!process.env.MONGO_URI) {
      console.warn("⚠️ MONGO_URI is missing. Backend operations requiring DB will fail.");
      return;
    }
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    if (process.env.NODE_ENV !== "production") {
      process.exit(1);
    }
  }
};

export default connectDB;
