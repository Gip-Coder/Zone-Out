import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("[DEBUG] Auth Header:", authHeader ? authHeader.substring(0, 15) + "..." : "MISSING");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("[DEBUG] No Bearer token found.");
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const token = authHeader.split(" ")[1];
    if (!process.env.JWT_SECRET) {
      console.error("[CRITICAL] JWT_SECRET is not defined in environment variables!");
      throw new Error("Secret not configured");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("[DEBUG] Token valid for user:", decoded.id);
    req.user = decoded.id;
    next();
  } catch (error) {
    console.error("[DEBUG] JWT Error:", error.message);
    res.status(401).json({ message: "Invalid token" });
  }
};
