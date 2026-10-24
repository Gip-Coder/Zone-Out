import mongoose from "mongoose";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const isNonEmptyString = (v, max = Infinity) =>
  typeof v === "string" && v.trim().length > 0 && v.length <= max;

export const isEmail = (v) => typeof v === "string" && v.length <= 254 && EMAIL_RE.test(v);

export const isObjectId = (v) => typeof v === "string" && mongoose.isValidObjectId(v);

/** Strict YYYY-MM-DD that is also a real calendar date. */
export const isDateString = (v) => {
  if (typeof v !== "string" || !DATE_RE.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
};

export const isFiniteNumberInRange = (v, min, max) =>
  typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;

export const utcToday = () => new Date().toISOString().split("T")[0];

/**
 * Resolve the user's "today". Clients send their local calendar date so a
 * student in IST does not have post-midnight sessions filed under yesterday.
 * Only dates within one day of the server's UTC date are accepted (every real
 * timezone is within ±14h of UTC); anything else falls back to UTC today.
 */
export const resolveClientDate = (candidate) => {
  const today = utcToday();
  if (!isDateString(candidate)) return today;
  const diffDays = Math.abs(Date.parse(`${candidate}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000;
  return diffDays <= 1 ? candidate : today;
};

export const httpError = (status, message) => Object.assign(new Error(message), { status });
