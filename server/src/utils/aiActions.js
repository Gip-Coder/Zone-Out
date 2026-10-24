import { isDateString, isNonEmptyString } from "./validators.js";

export const MAX_TIMER_MINUTES = 300;
const NAV_VIEWS = ["dashboard", "goals", "notes", "course"];

/**
 * Model output is untrusted: only actions on this allowlist, with parameters in
 * range, are passed to the client. Anything else is dropped (returns null).
 */
export function sanitizeAction(action) {
  if (!action || typeof action !== "object" || Array.isArray(action)) return null;

  switch (action.type) {
    case "SET_TIMER": {
      const minutes = Number(action.minutes);
      if (!Number.isFinite(minutes) || minutes < 1 || minutes > MAX_TIMER_MINUTES) return null;
      return { type: "SET_TIMER", minutes: Math.round(minutes) };
    }
    case "STOP_TIMER":
    case "PAUSE_TIMER":
      return { type: action.type };
    case "NAVIGATE": {
      if (!NAV_VIEWS.includes(action.view)) return null;
      const out = { type: "NAVIGATE", view: action.view };
      if (typeof action.courseId === "string" || typeof action.courseId === "number") out.courseId = action.courseId;
      return out;
    }
    case "ADD_GOAL": {
      if (!isNonEmptyString(action.title, 200)) return null;
      const out = { type: "ADD_GOAL", title: action.title.trim() };
      if (isDateString(action.date)) out.date = action.date;
      if (Array.isArray(action.plan)) {
        out.plan = action.plan
          .slice(0, 50)
          .map((p) => (typeof p === "string" ? p : p?.task))
          .filter((task) => isNonEmptyString(task, 200))
          .map((task) => ({ task: task.trim(), done: false }));
      }
      return out;
    }
    case "OPEN_RESOURCE":
      if (action.resource !== "notes" || !isNonEmptyString(action.moduleName, 200)) return null;
      return { type: "OPEN_RESOURCE", resource: "notes", moduleName: action.moduleName.trim() };
    default:
      return null;
  }
}
