import rateLimit from "express-rate-limit";

const isTest = process.env.NODE_ENV === "test";

export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
});

// Brute-force protection for credential endpoints. Only failed attempts count,
// so many students behind one campus NAT IP are not locked out by normal logins.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again later." },
  skip: () => isTest,
});
