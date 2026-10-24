/**
 * Calendar date (YYYY-MM-DD) in the user's local timezone.
 * `toISOString()` is UTC, which files a 1 AM IST session under the previous day.
 */
export function localDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Local calendar date `n` days before today. */
export function localDaysAgo(n, from = new Date()) {
  const d = new Date(from);
  d.setDate(d.getDate() - n);
  return localDateString(d);
}
