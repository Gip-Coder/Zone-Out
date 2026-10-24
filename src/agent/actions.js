/**
 * Client-side allowlist for AI-requested actions. Model output is untrusted, so
 * every action is validated here before it can change app state, even though
 * the backend also sanitizes it.
 */
export const MAX_TIMER_MINUTES = 300;

const NAV_VIEWS = ['dashboard', 'goals', 'notes', 'course'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const isText = (v, max = 200) => typeof v === 'string' && v.trim().length > 0 && v.length <= max;

/** Returns a normalized copy of a valid action, or null if it must be ignored. */
export function validateAction(action) {
  if (!action || typeof action !== 'object' || Array.isArray(action)) return null;

  switch (action.type) {
    case 'SET_TIMER': {
      const minutes = Number(action.minutes);
      if (!Number.isFinite(minutes) || minutes < 1 || minutes > MAX_TIMER_MINUTES) return null;
      return { type: 'SET_TIMER', minutes: Math.round(minutes) };
    }
    case 'STOP_TIMER':
    case 'PAUSE_TIMER':
      return { type: action.type };
    case 'NAVIGATE': {
      if (!NAV_VIEWS.includes(action.view)) return null;
      const out = { type: 'NAVIGATE', view: action.view };
      if (typeof action.courseId === 'string' || typeof action.courseId === 'number') out.courseId = action.courseId;
      return out;
    }
    case 'ADD_GOAL': {
      if (!isText(action.title)) return null;
      const out = { type: 'ADD_GOAL', title: action.title.trim() };
      if (typeof action.date === 'string' && DATE_RE.test(action.date)) out.date = action.date;
      out.plan = Array.isArray(action.plan)
        ? action.plan
          .map((p) => (typeof p === 'string' ? p : p?.task))
          .filter((t) => isText(t))
          .slice(0, 50)
          .map((task) => ({ task: task.trim(), done: false }))
        : [];
      return out;
    }
    case 'OPEN_RESOURCE':
      if (action.resource !== 'notes' || !isText(action.moduleName)) return null;
      return { type: 'OPEN_RESOURCE', resource: 'notes', moduleName: action.moduleName.trim() };
    default:
      return null;
  }
}
