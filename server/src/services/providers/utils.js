/**
 * Patch 3: Timeout Wrapper (Global Utility)
 */
export function withTimeout(promise, ms = 8000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), ms)
    ),
  ]);
}

/**
 * Patch 4: Improve Error Classification
 */
export function isRetryableError(e) {
  if (!e || !e.message) return false;
  return (
    e.message.includes("429") ||
    e.message.includes("503") ||
    e.message.includes("Timeout")
  );
}
