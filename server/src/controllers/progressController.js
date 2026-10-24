import Progress from "../models/Progress.js";
import ProgressSummary from "../models/ProgressSummary.js";
import Goal from "../models/Goal.js";
import {
  httpError,
  isDateString,
  isFiniteNumberInRange,
  isNonEmptyString,
  resolveClientDate,
} from "../utils/validators.js";

const MAX_SESSION_MINUTES = 24 * 60;
const MAX_GOAL_MINUTES = 100_000;
const MAX_MODULES = 10_000;
const MAX_RANGE_DAYS = 366;
const PERIOD_TYPES = ["daily", "weekly", "monthly"];

const optionalName = (v) => (isNonEmptyString(v, 200) ? v.trim() : null);

const addDays = (date, days) => {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

/** First day (inclusive) of the focus-goal period containing `date`. */
export const periodStart = (date, periodType) => {
  if (periodType === "daily") return date;
  if (periodType === "monthly") return `${date.slice(0, 7)}-01`;
  // weekly: ISO week, Monday start
  const dow = new Date(`${date}T00:00:00Z`).getUTCDay(); // 0 = Sunday
  return addDays(date, -((dow + 6) % 7));
};

/**
 * Fetch the user's summary for `date`, creating it atomically if missing.
 * A new day inherits the focus goal and goal/module totals from the most recent
 * earlier summary — otherwise the user's focus goal silently reset every day.
 */
export async function getOrCreateSummary(user, date) {
  const existing = await ProgressSummary.findOne({ user, date });
  if (existing) return existing;

  const prev = await ProgressSummary.findOne({ user, date: { $lt: date } }).sort({ date: -1 });
  const seed = prev
    ? {
        focus: { periodType: prev.focus.periodType, goalMinutes: prev.focus.goalMinutes, minutesCompleted: 0 },
        goals: { month: prev.goals.month, completed: prev.goals.completed, total: prev.goals.total },
        modules: { semesterId: prev.modules.semesterId, completed: prev.modules.completed, total: prev.modules.total },
      }
    : {};

  try {
    return await ProgressSummary.findOneAndUpdate(
      { user, date },
      { $setOnInsert: { user, date, ...seed } },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
  } catch (err) {
    // Two concurrent first requests of the day: the loser re-reads the winner's doc
    if (err?.code === 11000) return ProgressSummary.findOne({ user, date });
    throw err;
  }
}

/**
 * Focus minutes in the current goal period. Session records (Progress entries)
 * are the source of truth; today's summary counter is also considered so days
 * recorded before sessions were persisted as entries are not under-counted.
 */
async function focusMinutesForPeriod(user, summary) {
  const from = periodStart(summary.date, summary.focus.periodType);
  const entries = await Progress.find({ user, type: "focus", date: { $gte: from, $lte: summary.date } });
  let today = 0;
  let earlier = 0;
  for (const e of entries) {
    if (e.date === summary.date) today += e.durationMinutes || 0;
    else earlier += e.durationMinutes || 0;
  }
  return earlier + Math.max(today, summary.focus.minutesCompleted || 0);
}

const pct = (completed, total) => (total > 0 ? Math.min(Math.round((completed / total) * 100), 100) : 0);

export const logProgress = async (req, res, next) => {
  try {
    const { type = "focus", durationMinutes = 0, courseName, moduleTitle, date } = req.body || {};
    if (!["focus", "module"].includes(type)) throw httpError(400, "Invalid progress type");
    if (!isFiniteNumberInRange(durationMinutes, 0, MAX_SESSION_MINUTES)) throw httpError(400, "Invalid durationMinutes");

    const entry = await Progress.create({
      user: req.user,
      type,
      durationMinutes: Math.round(durationMinutes),
      courseName: optionalName(courseName),
      moduleTitle: optionalName(moduleTitle),
      date: resolveClientDate(date),
    });

    res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
};

const readRange = (query) => {
  const { from, to } = query;
  if (from !== undefined && !isDateString(from)) throw httpError(400, "from must be YYYY-MM-DD");
  if (to !== undefined && !isDateString(to)) throw httpError(400, "to must be YYYY-MM-DD");
  if (from && to) {
    if (from > to) throw httpError(400, "from must not be after to");
    if ((Date.parse(to) - Date.parse(from)) / 86_400_000 > MAX_RANGE_DAYS) throw httpError(400, "Date range too large");
  }
  return { from, to };
};

export const getProgress = async (req, res, next) => {
  // Original log history fetcher
  try {
    const { from, to } = readRange(req.query);
    const query = { user: req.user };

    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = from;
      if (to) query.date.$lte = to;
    }

    const entries = await Progress.find(query).sort({ date: 1 });
    res.json(entries);
  } catch (error) {
    next(error);
  }
};

// GET /api/progress/summary
// Returns all three progress types together for the user's current day/month/semester context
export const getSummary = async (req, res, next) => {
  try {
    const { from, to } = readRange(req.query);
    const date = to || resolveClientDate(req.query.date);

    // 1. Fetch/Create today's (or 'to' date's) summary
    const summaryDoc = await getOrCreateSummary(req.user, date);

    // 2. Fetch Detailed Stats for range
    const stats = {
      totalMinutes: 0,
      sessionsCompleted: 0,
      dailyBreakdown: [],
      subjectBreakdown: []
    };

    if (from && to) {
      const entries = await Progress.find({
        user: req.user,
        type: "focus",
        date: { $gte: from, $lte: to }
      });

      stats.sessionsCompleted = entries.length;
      stats.totalMinutes = entries.reduce((s, e) => s + (e.durationMinutes || 0), 0);

      // Aggregates
      const byDate = {};
      const bySub = {};
      entries.forEach(e => {
        const s = e.courseName || "General";
        byDate[e.date] = (byDate[e.date] || 0) + (e.durationMinutes || 0);
        bySub[s] = (bySub[s] || 0) + (e.durationMinutes || 0);
      });

      stats.dailyBreakdown = Object.entries(byDate)
        .map(([d, minutes]) => ({ date: d, minutes }))
        .sort((a, b) => a.date.localeCompare(b.date));
      stats.subjectBreakdown = Object.entries(bySub)
        .map(([subject, minutes]) => ({ subject, minutes }))
        .sort((a, b) => b.minutes - a.minutes);
    }

    // 3. Focus progress is measured over the goal's period (e.g. this week),
    //    not just the current day.
    const summary = summaryDoc.toObject();
    summary.focus.todayMinutes = summary.focus.minutesCompleted;
    summary.focus.minutesCompleted = await focusMinutesForPeriod(req.user, summaryDoc);

    res.json({
      summary,
      stats,
      percentages: {
        focusProgressPercentage: pct(summary.focus.minutesCompleted, summary.focus.goalMinutes),
        goalsProgressPercentage: pct(summary.goals.completed, summary.goals.total),
        modulesProgressPercentage: pct(summary.modules.completed, summary.modules.total)
      }
    });
  } catch (error) {
    next(error);
  }
};

const readSessionMinutes = (value) => {
  const raw = typeof value === "number" ? value : value?.minutes;
  if (!isFiniteNumberInRange(raw, 0, MAX_SESSION_MINUTES)) throw httpError(400, "Invalid session minutes");
  return Math.round(raw);
};

const readModuleCount = (v, field) => {
  if (v === undefined) return undefined;
  if (!Number.isInteger(v) || v < 0 || v > MAX_MODULES) throw httpError(400, `Invalid module ${field}`);
  return v;
};

// POST /api/progress/event
export const logProgressEvent = async (req, res, next) => {
  try {
    const { eventType, value, date: clientDate } = req.body || {}; // value can be exact ID or generic payload
    const date = resolveClientDate(clientDate);

    switch (eventType) {
      case "focus_session_completed": {
        const minutes = readSessionMinutes(value);
        if (minutes > 0) {
          // Persist the session itself: Progress entries drive the daily and
          // per-subject charts on the Progress page.
          await Progress.create({
            user: req.user,
            type: "focus",
            durationMinutes: minutes,
            courseName: optionalName(value?.courseName),
            moduleTitle: optionalName(value?.moduleTitle),
            date,
          });
        }
        await getOrCreateSummary(req.user, date);
        const summary = await ProgressSummary.findOneAndUpdate(
          { user: req.user, date },
          { $inc: { "focus.minutesCompleted": minutes } },
          { returnDocument: "after" }
        );
        return res.json(summary);
      }

      case "goal_completed":
      case "goal_updated": {
        const summary = await getOrCreateSummary(req.user, date);
        // Track completedGoals vs totalGoals
        const [totalGoals, completedGoals] = await Promise.all([
          Goal.countDocuments({ user: req.user }),
          Goal.countDocuments({ user: req.user, completed: true }),
        ]);

        summary.goals.total = totalGoals;
        summary.goals.completed = completedGoals;
        summary.goals.month = date.substring(0, 7); // Extract YYYY-MM
        await summary.save();
        return res.json(summary);
      }

      case "module_completed":
      case "module_updated": {
        const summary = await getOrCreateSummary(req.user, date);
        // Since modules are local-heavy, we allow the frontend to specify the new totals
        const total = readModuleCount(value?.total, "total");
        const completed = readModuleCount(value?.completed, "completed");

        if (total !== undefined) summary.modules.total = total;
        if (completed !== undefined) {
          summary.modules.completed = completed;
        } else if (eventType === "module_completed") {
          summary.modules.completed += 1;
        }
        // Completed can never exceed the number of modules that exist
        if (summary.modules.total > 0) {
          summary.modules.completed = Math.min(summary.modules.completed, summary.modules.total);
        }
        await summary.save();
        return res.json(summary);
      }

      default:
        throw httpError(400, "Unknown eventType");
    }
  } catch (error) {
    next(error);
  }
};

// POST /api/progress/set-focus-goal
export const setFocusGoal = async (req, res, next) => {
  try {
    const { periodType, goalMinutes, date: clientDate } = req.body || {};
    if (periodType !== undefined && !PERIOD_TYPES.includes(periodType)) throw httpError(400, "Invalid periodType");
    if (goalMinutes !== undefined && !(Number.isInteger(goalMinutes) && goalMinutes >= 0 && goalMinutes <= MAX_GOAL_MINUTES)) {
      throw httpError(400, "Invalid goalMinutes");
    }

    const summary = await getOrCreateSummary(req.user, resolveClientDate(clientDate));

    if (periodType) summary.focus.periodType = periodType;
    if (goalMinutes !== undefined) summary.focus.goalMinutes = goalMinutes;

    await summary.save();
    res.json(summary);
  } catch (error) {
    next(error);
  }
};
