import express from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import admin from "../config/firebaseAdmin.js";
import { protect } from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { asyncHandler } from "../middleware/errorMiddleware.js";
import { isEmail, isNonEmptyString, httpError } from "../utils/validators.js";

const router = express.Router();

const MIN_PASSWORD = 6;
const MAX_PASSWORD = 128; // bcrypt only uses the first 72 bytes; cap to bound hashing cost
const VALID_WIDGET_IDS = ["timeline", "vault", "timer", "music", "ai"];
const VALID_WIDGET_SIZES = ["small", "medium", "large"];

const signToken = (userId) => {
  if (!process.env.JWT_SECRET) throw httpError(500, "Server auth is not configured");
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const toSafeUser = (user, extra = {}) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  dashboardLayout: user.dashboardLayout,
  ...extra,
});

/**
 * Rejects non-string credentials (e.g. `{ "$gt": "" }` operator injection).
 * Registration enforces the full rules; login only enforces types and bounds so
 * accounts created before validation existed can still sign in.
 */
function readCredentials(body, { strict }) {
  const { email, password } = body || {};
  if (typeof email !== "string" || (strict ? !isEmail(email.trim()) : !isNonEmptyString(email, 254))) {
    throw httpError(400, "A valid email is required");
  }
  const minLength = strict ? MIN_PASSWORD : 1;
  if (typeof password !== "string" || password.length < minLength || password.length > MAX_PASSWORD) {
    throw httpError(400, strict ? `Password must be ${MIN_PASSWORD}-${MAX_PASSWORD} characters` : "Password is required");
  }
  return { email: email.trim(), password };
}

// REGISTER
router.post("/register", authLimiter, asyncHandler(async (req, res) => {
  const { email, password } = readCredentials(req.body, { strict: true });
  const { name } = req.body;
  if (!isNonEmptyString(name, 100)) throw httpError(400, "Name is required (max 100 chars)");

  const existingUser = await User.findOne({ email });
  if (existingUser) throw httpError(400, "User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  let user;
  try {
    user = await User.create({ name: name.trim(), email, password: hashedPassword });
  } catch (err) {
    // Concurrent registration with the same email hits the unique index
    if (err?.code === 11000) throw httpError(400, "User already exists");
    throw err;
  }

  res.status(201).json({ message: "User registered successfully", token: signToken(user._id), user: toSafeUser(user) });
}));

// LOGIN
router.post("/login", authLimiter, asyncHandler(async (req, res) => {
  const { email, password } = readCredentials(req.body, { strict: false });

  const user = await User.findOne({ email });
  const isMatch = user ? await bcrypt.compare(password, user.password) : false;
  if (!user || !isMatch) throw httpError(400, "Invalid credentials");

  res.json({ token: signToken(user._id), user: toSafeUser(user) });
}));

// GOOGLE OAUTH LOGIN/REGISTER
router.post("/google", authLimiter, asyncHandler(async (req, res) => {
  const { idToken } = req.body || {};
  if (!isNonEmptyString(idToken, 8192)) throw httpError(400, "No ID token provided");

  let decodedToken;
  try {
    decodedToken = await admin.auth().verifyIdToken(idToken);
  } catch {
    throw httpError(401, "Failed to authenticate with Google");
  }
  const { name, email, picture, email_verified: emailVerified } = decodedToken;

  // Linking to an existing account by email is only safe for verified addresses
  if (!email || emailVerified !== true) throw httpError(401, "Google account email is not verified");

  let user = await User.findOne({ email });

  if (!user) {
    // Unusable random password: Google users sign in through Firebase only
    const randomPassword = crypto.randomBytes(32).toString("hex");
    const hashedPassword = await bcrypt.hash(randomPassword, 10);
    try {
      user = await User.create({ name: name || "Google User", email, password: hashedPassword });
    } catch (err) {
      if (err?.code !== 11000) throw err;
      user = await User.findOne({ email });
    }
  }

  res.json({ message: "Google Auth successful", token: signToken(user._id), user: toSafeUser(user, { profilePic: picture }) });
}));

// UPDATE DASHBOARD LAYOUT
router.put("/layout", protect, asyncHandler(async (req, res) => {
  const { dashboardLayout } = req.body || {};

  if (!Array.isArray(dashboardLayout) || dashboardLayout.length > VALID_WIDGET_IDS.length) {
    throw httpError(400, "Invalid layout format");
  }

  const seen = new Set();
  const sanitized = dashboardLayout.map((widget, index) => {
    if (!widget || !VALID_WIDGET_IDS.includes(widget.id)) {
      throw httpError(400, `Invalid widget ID: ${widget?.id}`);
    }
    if (seen.has(widget.id)) throw httpError(400, `Duplicate widget ID: ${widget.id}`);
    seen.add(widget.id);
    return {
      id: widget.id,
      order: Number.isInteger(widget.order) ? widget.order : index,
      size: VALID_WIDGET_SIZES.includes(widget.size) ? widget.size : "medium",
    };
  });

  const user = await User.findByIdAndUpdate(req.user, { dashboardLayout: sanitized }, { returnDocument: "after" });
  if (!user) throw httpError(404, "User not found");

  res.json({ dashboardLayout: user.dashboardLayout });
}));

export default router;
