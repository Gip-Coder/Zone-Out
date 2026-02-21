import Progress from "../models/Progress.js";

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
