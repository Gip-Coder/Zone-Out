const responseCache = new Map();

export function getCached(prompt) {
  return responseCache.get(prompt);
}

export function setCache(prompt, response) {
  if (response && response.trim() !== "") {
    responseCache.set(prompt, response);
  }
}
