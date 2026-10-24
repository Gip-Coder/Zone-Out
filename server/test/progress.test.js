import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import request from "supertest";
import { startDb, stopDb, clearDb, tokenFor, newUserId } from "./helpers.js";

vi.mock("../src/config/firebaseAdmin.js", () => ({ default: { auth: () => ({}) } }));

const { default: app } = await import("../src/app.js");
const { default: Progress } = await import("../src/models/Progress.js");
const { default: ProgressSummary } = await import("../src/models/ProgressSummary.js");
const { default: Goal } = await import("../src/models/Goal.js");
const { periodStart } = await import("../src/controllers/progressController.js");
const { utcToday } = await import("../src/utils/validators.js");

const user = newUserId();
const auth = { Authorization: `Bearer ${tokenFor(user)}` };
const today = utcToday();

const shift = (date, days) => {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

beforeAll(startDb);
afterAll(stopDb);
beforeEach(clearDb);

describe("progress API", () => {
  // Regression: completed focus sessions only bumped a counter; no Progress
  // entry was written, so the Progress page charts were always empty.
  it("records completed focus sessions as entries that appear in stats", async () => {
    const ev = await request(app).post("/api/progress/event").set(auth)
      .send({ eventType: "focus_session_completed", value: { minutes: 25, courseName: "Physics" }, date: today });
    expect(ev.status).toBe(200);
    expect(ev.body.focus.minutesCompleted).toBe(25);
    expect(await Progress.countDocuments({ user })).toBe(1);

    const summary = await request(app).get(`/api/progress/summary?from=${shift(today, -7)}&to=${today}`).set(auth);
    expect(summary.status).toBe(200);
    expect(summary.body.stats.sessionsCompleted).toBe(1);
    expect(summary.body.stats.totalMinutes).toBe(25);
    expect(summary.body.stats.subjectBreakdown).toEqual([{ subject: "Physics", minutes: 25 }]);
    expect(summary.body.stats.dailyBreakdown).toEqual([{ date: today, minutes: 25 }]);
  });

  // Regression: summaries are per-day, so the focus goal reset to 0 every day
  it("carries the focus goal and totals forward to a new day", async () => {
    const yesterday = shift(today, -1);
    await ProgressSummary.create({
      user, date: yesterday,
      focus: { periodType: "weekly", goalMinutes: 300, minutesCompleted: 40 },
      goals: { completed: 2, total: 5, month: yesterday.slice(0, 7) },
      modules: { completed: 3, total: 10 },
    });

    const res = await request(app).get(`/api/progress/summary?date=${today}`).set(auth);
    expect(res.status).toBe(200);
    expect(res.body.summary.focus.goalMinutes).toBe(300);
    expect(res.body.summary.goals).toMatchObject({ completed: 2, total: 5 });
    expect(res.body.summary.modules).toMatchObject({ completed: 3, total: 10 });
    expect(res.body.summary.focus.todayMinutes).toBe(0);
  });

  it("measures weekly focus progress across the whole week", async () => {
    await request(app).post("/api/progress/set-focus-goal").set(auth).send({ periodType: "weekly", goalMinutes: 100, date: today });
    const weekStart = periodStart(today, "weekly");
    // An earlier session in the same week (if today is not Monday) plus one today
    if (weekStart < today) {
      await Progress.create({ user, type: "focus", durationMinutes: 30, date: weekStart });
    }
    await request(app).post("/api/progress/event").set(auth).send({ eventType: "focus_session_completed", value: { minutes: 20 }, date: today });
    // A session from last week must not count
    await Progress.create({ user, type: "focus", durationMinutes: 999, date: shift(weekStart, -1) });

    const res = await request(app).get(`/api/progress/summary?date=${today}`).set(auth);
    const expected = weekStart < today ? 50 : 20;
    expect(res.body.summary.focus.minutesCompleted).toBe(expected);
    expect(res.body.percentages.focusProgressPercentage).toBe(expected);
  });

  it("computes ISO-week and month period starts", () => {
    expect(periodStart("2026-10-24", "weekly")).toBe("2026-10-19"); // Saturday → Monday
    expect(periodStart("2026-10-19", "weekly")).toBe("2026-10-19"); // Monday
    expect(periodStart("2026-10-25", "weekly")).toBe("2026-10-19"); // Sunday
    expect(periodStart("2026-10-24", "monthly")).toBe("2026-10-01");
    expect(periodStart("2026-10-24", "daily")).toBe("2026-10-24");
  });

  // Regression: concurrent first requests of the day raced on the unique index (E11000 → 500)
  it("handles concurrent first-of-day requests without duplicate-key errors", async () => {
    const results = await Promise.all(
      Array.from({ length: 8 }, () => request(app).get(`/api/progress/summary?date=${today}`).set(auth))
    );
    expect(results.every((r) => r.status === 200)).toBe(true);
    expect(await ProgressSummary.countDocuments({ user, date: today })).toBe(1);
  });

  it("recounts goals from the database on goal events", async () => {
    await Goal.create([{ user, text: "a", completed: true }, { user, text: "b" }, { user: newUserId(), text: "other user" }]);
    const res = await request(app).post("/api/progress/event").set(auth).send({ eventType: "goal_updated", date: today });
    expect(res.body.goals).toMatchObject({ completed: 1, total: 2 });
  });

  it("never lets completed modules exceed the total", async () => {
    await request(app).post("/api/progress/event").set(auth).send({ eventType: "module_updated", value: { total: 2, completed: 2 }, date: today });
    const res = await request(app).post("/api/progress/event").set(auth).send({ eventType: "module_completed", date: today });
    expect(res.body.modules).toMatchObject({ completed: 2, total: 2 });
  });

  // Regression: string/negative values were concatenated into counters or crashed with 500
  it("validates event and goal payloads", async () => {
    const cases = [
      { eventType: "focus_session_completed", value: "25" },
      { eventType: "focus_session_completed", value: { minutes: -5 } },
      { eventType: "focus_session_completed", value: { minutes: 1e9 } },
      { eventType: "module_updated", value: { total: -1 } },
      { eventType: "drop_tables" },
    ];
    for (const body of cases) {
      const res = await request(app).post("/api/progress/event").set(auth).send(body);
      expect(res.status, JSON.stringify(body)).toBe(400);
    }
    expect((await request(app).post("/api/progress/set-focus-goal").set(auth).send({ periodType: "yearly" })).status).toBe(400);
    expect((await request(app).post("/api/progress/set-focus-goal").set(auth).send({ goalMinutes: "lots" })).status).toBe(400);
    expect((await request(app).get("/api/progress/summary?from=2026-01-01&to=bad").set(auth)).status).toBe(400);
    expect((await request(app).get("/api/progress/summary?from=2020-01-01&to=2026-01-01").set(auth)).status).toBe(400);
  });

  it("uses the client's local date when plausible and ignores implausible ones", async () => {
    const tomorrow = shift(today, 1);
    await request(app).post("/api/progress/event").set(auth).send({ eventType: "focus_session_completed", value: { minutes: 10 }, date: tomorrow });
    expect(await Progress.countDocuments({ user, date: tomorrow })).toBe(1);

    await request(app).post("/api/progress/event").set(auth).send({ eventType: "focus_session_completed", value: { minutes: 10 }, date: "1999-01-01" });
    expect(await Progress.countDocuments({ user, date: "1999-01-01" })).toBe(0);
    expect(await Progress.countDocuments({ user, date: today })).toBe(1);
  });

  it("isolates progress data between users", async () => {
    await request(app).post("/api/progress/event").set(auth).send({ eventType: "focus_session_completed", value: { minutes: 25 }, date: today });
    const other = { Authorization: `Bearer ${tokenFor(newUserId())}` };
    const res = await request(app).get(`/api/progress/summary?from=${today}&to=${today}`).set(other);
    expect(res.body.stats.sessionsCompleted).toBe(0);
    expect(res.body.summary.focus.minutesCompleted).toBe(0);
  });
});
