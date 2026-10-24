export const notFound = (req, res) => {
  res.status(404).json({ message: "Not found" });
};

// eslint-disable-next-line no-unused-vars -- Express identifies error handlers by arity
export const errorHandler = (err, req, res, next) => {
  // Malformed JSON bodies are client errors, not server errors
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Malformed JSON body" });
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({ message: "Request body too large" });
  }

  const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 500;
  if (status >= 500) console.error("[ERROR]", err);

  const expose = status < 500 || process.env.NODE_ENV !== "production";
  res.status(status).json({ message: expose ? err.message || "Server error" : "Server error" });
};

/** Wraps an async route handler so rejected promises reach errorHandler. */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
