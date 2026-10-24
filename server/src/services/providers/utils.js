/**
 * Patch 3: Timeout Wrapper (Global Utility)
 * Clears its timer once the race settles so it never keeps the process alive.
 */
export function withTimeout(promise, ms = 8000) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error("Timeout")), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
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
