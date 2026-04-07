import Progress from "../models/Progress.js";
import ProgressSummary from "../models/ProgressSummary.js";
import Goal from "../models/Goal.js";

export const logProgress = async (req, res) => {
  try {
    const { type, durationMinutes, courseName, moduleTitle } = req.body;
    const date = new Date().toISOString().split("T")[0];

    const entry = await Progress.create({
      user: req.user,
      type: type || "focus",
      durationMinutes: durationMinutes ?? 0,
      courseName: courseName || null,
      moduleTitle: moduleTitle || null,
      date,
    });

    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProgress = async (req, res) => {
  // Original log history fetcher
  try {
    const from = req.query.from;
    const to = req.query.to;
    const query = { user: req.user };

    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = from;
      if (to) query.date.$lte = to;
    }

    const entries = await Progress.find(query).sort({ date: 1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/progress/summary
// Returns all three progress types together for the user's current day/month/semester context
export const getSummary = async (req, res) => {
  try {
    const { from, to, date: queryDate } = req.query;
    const date = to || queryDate || new Date().toISOString().split("T")[0];
    
    // 1. Fetch/Create today's (or 'to' date's) summary
    let summary = await ProgressSummary.findOne({ user: req.user, date });
    if (!summary) {
      summary = await ProgressSummary.create({ user: req.user, date });
    }

    // 2. Fetch Detailed Stats for range
    let stats = {
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
        const d = e.date;
        const s = e.courseName || "General";
        byDate[d] = (byDate[d] || 0) + (e.durationMinutes || 0);
        bySub[s] = (bySub[s] || 0) + (e.durationMinutes || 0);
      });

      stats.dailyBreakdown = Object.entries(byDate).map(([date, minutes]) => ({ date, minutes }));
      stats.subjectBreakdown = Object.entries(bySub).map(([subject, minutes]) => ({ subject, minutes }));
    }

    // 3. Calculate Independent Percentages for current day
    const focusProgressPercentage = summary.focus.goalMinutes > 0
      ? Math.round((summary.focus.minutesCompleted / summary.focus.goalMinutes) * 100)
      : 0;

    const goalsProgressPercentage = summary.goals.total > 0
      ? Math.round((summary.goals.completed / summary.goals.total) * 100)
      : 0;

    const modulesProgressPercentage = summary.modules.total > 0
      ? Math.round((summary.modules.completed / summary.modules.total) * 100)
      : 0;

    res.json({
      summary,
      stats, // NEW: Detailed range stats
      percentages: {
        focusProgressPercentage: Math.min(focusProgressPercentage, 100),
        goalsProgressPercentage: Math.min(goalsProgressPercentage, 100),
        modulesProgressPercentage: Math.min(modulesProgressPercentage, 100)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/progress/event
export const logProgressEvent = async (req, res) => {
  try {
    const { eventType, value } = req.body; // value can be exact ID or generic payload
    const date = new Date().toISOString().split("T")[0];

    let summary = await ProgressSummary.findOne({ user: req.user, date });
    if (!summary) {
      summary = await ProgressSummary.create({ user: req.user, date });
    }

    switch (eventType) {
      case "focus_session_completed":
        summary.focus.minutesCompleted += (value?.minutes || value || 0);
        break;

      case "goal_completed":
      case "goal_updated":
        // Track completedGoals vs totalGoals
        const totalGoals = await Goal.countDocuments({ user: req.user });
        const completedGoals = await Goal.countDocuments({ user: req.user, completed: true });
        
        summary.goals.total = totalGoals;
        summary.goals.completed = completedGoals;
        summary.goals.month = date.substring(0, 7); // Extract YYYY-MM
        break;

      case "module_completed":
      case "module_updated":
        // Since modules are local-heavy, we allow the frontend to specify the new totals
        if (value && value.total !== undefined) {
          summary.modules.total = value.total;
        }
        if (value && value.completed !== undefined) {
          summary.modules.completed = value.completed;
        } else if (eventType === "module_completed") {
          summary.modules.completed += 1;
        }
        break;

      default:
        break;
    }

    await summary.save();
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/progress/set-focus-goal
export const setFocusGoal = async (req, res) => {
  try {
    const { periodType, goalMinutes } = req.body;
    const date = new Date().toISOString().split("T")[0];

    let summary = await ProgressSummary.findOne({ user: req.user, date });
    if (!summary) {
      summary = await ProgressSummary.create({ user: req.user, date });
    }

    if (periodType) summary.focus.periodType = periodType;
    if (goalMinutes !== undefined) summary.focus.goalMinutes = goalMinutes;

    await summary.save();
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
