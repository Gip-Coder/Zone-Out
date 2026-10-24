import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import request from "supertest";
import { startDb, stopDb, clearDb, tokenFor, newUserId } from "./helpers.js";

vi.mock("../src/config/firebaseAdmin.js", () => ({ default: { auth: () => ({ verifyIdToken: vi.fn() }) } }));

const { default: app } = await import("../src/app.js");
const { default: Goal } = await import("../src/models/Goal.js");

const alice = newUserId();
const mallory = newUserId();
const auth = (id) => ({ Authorization: `Bearer ${tokenFor(id)}` });

beforeAll(startDb);
afterAll(stopDb);
beforeEach(clearDb);

describe("goals API", () => {
  it("creates, lists, updates and deletes the caller's own goal", async () => {
    const created = await request(app).post("/api/goals").set(auth(alice)).send({ text: "Finish DSA module", targetDate: "2026-11-01", plan: [] });
    expect(created.status).toBe(201);
    expect(created.body.text).toBe("Finish DSA module");

    const list = await request(app).get("/api/goals").set(auth(alice));
    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(1);

    const updated = await request(app).put(`/api/goals/${created.body._id}`).set(auth(alice)).send({ completed: true });
    expect(updated.status).toBe(200);
    expect(updated.body.completed).toBe(true);

    const deleted = await request(app).delete(`/api/goals/${created.body._id}`).set(auth(alice));
    expect(deleted.status).toBe(200);
    expect(await Goal.countDocuments()).toBe(0);
  });

  // Regression: PUT/DELETE /api/goals/:id had no auth and no ownership check
  it("rejects unauthenticated update and delete", async () => {
    const goal = await Goal.create({ user: alice, text: "secret goal" });

    const put = await request(app).put(`/api/goals/${goal._id}`).send({ text: "pwned" });
    expect(put.status).toBe(401);
    const del = await request(app).delete(`/api/goals/${goal._id}`);
    expect(del.status).toBe(401);

    const stored = await Goal.findById(goal._id);
    expect(stored.text).toBe("secret goal");
  });

  it("prevents a user from reading, modifying or deleting another user's goal", async () => {
    const goal = await Goal.create({ user: alice, text: "alice's goal" });

    const list = await request(app).get("/api/goals").set(auth(mallory));
    expect(list.body).toHaveLength(0);

    const put = await request(app).put(`/api/goals/${goal._id}`).set(auth(mallory)).send({ completed: true });
    expect(put.status).toBe(404);
    const del = await request(app).delete(`/api/goals/${goal._id}`).set(auth(mallory));
    expect(del.status).toBe(404);

    const stored = await Goal.findById(goal._id);
    expect(stored.completed).toBe(false);
  });

  it("ignores attempts to reassign ownership through the body", async () => {
    const created = await request(app).post("/api/goals").set(auth(alice)).send({ text: "mine", user: mallory });
    expect(created.status).toBe(201);
    expect(String(created.body.user)).toBe(alice);

    await request(app).put(`/api/goals/${created.body._id}`).set(auth(alice)).send({ user: mallory, text: "still mine" });
    const stored = await Goal.findById(created.body._id);
    expect(String(stored.user)).toBe(alice);
    expect(stored.text).toBe("still mine");
  });

  it("validates input instead of returning 500", async () => {
    const noText = await request(app).post("/api/goals").set(auth(alice)).send({ text: "" });
    expect(noText.status).toBe(400);

    const badDate = await request(app).post("/api/goals").set(auth(alice)).send({ text: "x", targetDate: "tomorrow" });
    expect(badDate.status).toBe(400);

    const badId = await request(app).put("/api/goals/not-an-id").set(auth(alice)).send({ completed: true });
    expect(badId.status).toBe(404);

    const badCompleted = await request(app).post("/api/goals").set(auth(alice)).send({ text: "x" });
    const r = await request(app).put(`/api/goals/${badCompleted.body._id}`).set(auth(alice)).send({ completed: "yes" });
    expect(r.status).toBe(400);
  });

  it("returns 400 for malformed JSON and 404 JSON for unknown API routes", async () => {
    const malformed = await request(app).post("/api/goals").set(auth(alice)).set("Content-Type", "application/json").send("{bad json");
    expect(malformed.status).toBe(400);

    const missing = await request(app).get("/api/does-not-exist");
    expect(missing.status).toBe(404);
    expect(missing.body.message).toBe("Not found");
  });
});
