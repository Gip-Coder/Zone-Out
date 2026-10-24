import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized" });
  }

  if (!process.env.JWT_SECRET) {
    console.error("[CRITICAL] JWT_SECRET is not defined in environment variables!");
    return res.status(500).json({ message: "Server auth is not configured" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};
