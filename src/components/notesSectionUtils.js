/**
 * Validation for Course Vault data produced by the AI (or parsed from text).
 * Model output is untrusted: anything that doesn't match the shape the UI
 * renders is dropped, and callers fall back to their manual implementations.
 */

const MAX_TITLE = 200;
const MAX_TOPIC = 300;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const cleanText = (v, max) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);

/**
 * Normalizes a module list to `{ title, topics[], completed }`. Module titles
 * are used as keys for files and notes, so blank titles are dropped and
 * duplicates get a numeric suffix. Returns null when nothing usable remains.
 */
export function normalizeModules(list) {
  if (!Array.isArray(list)) return null;
  const seen = new Map();
  const modules = [];
  for (const m of list.slice(0, 100)) {
    const base = cleanText(m?.title, MAX_TITLE);
    if (!base) continue;
    const count = (seen.get(base) || 0) + 1;
    seen.set(base, count);
    const title = count === 1 ? base : `${base} (${count})`;
    const topics = Array.isArray(m.topics)
      ? m.topics.map((t) => cleanText(t, MAX_TOPIC)).filter(Boolean).slice(0, 100)
      : [];
    modules.push({ title, topics, completed: m.completed === true });
  }
  return modules.length ? modules : null;
}

/** Normalizes an AI quiz; returns UI state or null if no question is usable. */
export function normalizeQuiz(data) {
  if (!data || !Array.isArray(data.questions)) return null;
  const questions = data.questions
    .map((q) => {
      const text = cleanText(q?.q, 1000);
      const options = Array.isArray(q?.options) ? q.options.map((o) => cleanText(String(o ?? ''), 500)).filter(Boolean) : [];
      const answer = Number(q?.answer);
      if (!text || options.length < 2 || options.length > 6) return null;
      if (!Number.isInteger(answer) || answer < 0 || answer >= options.length) return null;
      return { q: text, options, answer, explanation: cleanText(q.explanation, 2000) || '' };
    })
    .filter(Boolean)
    .slice(0, 20);
  if (!questions.length) return null;
  return { questions, current: 0, score: 0, showResult: false };
}

/** Normalizes a study-plan checklist; returns null if no task is usable. */
export function normalizePlan(plan) {
  if (!Array.isArray(plan)) return null;
  const items = plan
    .map((p) => {
      const task = cleanText(p?.task, MAX_TITLE);
      if (!task) return null;
      return { date: typeof p.date === 'string' && DATE_RE.test(p.date) ? p.date : '', task, done: p.done === true };
    })
    .filter(Boolean)
    .slice(0, 100);
  return items.length ? items : null;
}

export function normalizeVideoRec(data) {
  const videoTitle = cleanText(data?.videoTitle, 300);
  if (!videoTitle) return null;
  return {
    videoTitle,
    channelName: cleanText(data.channelName, 200) || 'YouTube',
    reason: cleanText(data.reason, 500) || '',
  };
}

/** Keeps only file→course→module matches whose indices actually exist. */
export function validFileMatches(matches, fileCount, courses) {
  if (!Array.isArray(matches)) return [];
  const usedFiles = new Set();
  return matches.filter((m) => {
    const { fileIndex, courseIndex, moduleIndex = 0 } = m || {};
    if (![fileIndex, courseIndex, moduleIndex].every(Number.isInteger)) return false;
    if (fileIndex < 0 || fileIndex >= fileCount || usedFiles.has(fileIndex)) return false;
    const course = courses[courseIndex];
    if (!course || !course.modules?.length) return false;
    if (moduleIndex < 0 || moduleIndex >= course.modules.length) return false;
    usedFiles.add(fileIndex);
    return true;
  });
}

let fileSeq = 0;

/** File record persisted in IndexedDB. The Blob itself is stored, not a URL. */
export function makeFileRecord(file) {
  const ext = file.name.includes('.') ? file.name.split('.').pop().toUpperCase() : 'FILE';
  return {
    id: `${Date.now()}-${++fileSeq}`,
    title: file.name,
    type: ext,
    mimeType: file.type || '',
    size: file.size,
    date: new Date().toLocaleDateString(),
    blob: file,
  };
}

/**
 * Opens a stored file in a new tab. Returns false when the record has no Blob
 * (uploaded by older versions that only kept a blob: URL, which dies on reload).
 */
export function openStoredFile(record) {
  if (!record?.blob) return false;
  const url = URL.createObjectURL(record.blob);
  window.open(url, '_blank', 'noopener');
  // Give the new tab time to load the URL before releasing it
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return true;
}
