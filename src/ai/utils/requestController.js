let requestCount = 0;
const MAX_DAILY_REQUESTS = 450;
let lastRequestTime = 0;

export function canUseGemini() {
  return requestCount < MAX_DAILY_REQUESTS;
}

export function incrementRequest() {
  requestCount++;
}

export function getRequestUsage() {
  return requestCount;
}

export function canMakeRequest(delay = 1500) {
  const now = Date.now();
  if (now - lastRequestTime < delay) {
    return false;
  }
  lastRequestTime = now;
  return true;
}
