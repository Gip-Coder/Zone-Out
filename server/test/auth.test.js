import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import request from "supertest";
import { startDb, stopDb, clearDb, tokenFor } from "./helpers.js";

const verifyIdToken = vi.fn();
vi.mock("../src/config/firebaseAdmin.js", () => ({ default: { auth: () => ({ verifyIdToken }) } }));

const { default: app } = await import("../src/app.js");
const { default: User } = await import("../src/models/User.js");

beforeAll(startDb);
afterAll(stopDb);
beforeEach(async () => {
  await clearDb();
  verifyIdToken.mockReset();
});

const register = (body) => request(app).post("/api/auth/register").send(body);

describe("auth API", () => {
  it("registers and logs in without exposing the password hash", async () => {
    const reg = await register({ name: "Alice", email: "alice@test.com", password: "Test123!" });
    expect(reg.status).toBe(201);
    expect(reg.body.token).toBeTruthy();
    expect(reg.body.user.password).toBeUndefined();

    const login = await request(app).post("/api/auth/login").send({ email: "alice@test.com", password: "Test123!" });
    expect(login.status).toBe(200);
    expect(login.body.user.email).toBe("alice@test.com");
    expect(login.body.user.password).toBeUndefined();
  });

  it("rejects wrong passwords and unknown users with the same message", async () => {
    await register({ name: "Alice", email: "alice@test.com", password: "Test123!" });
    const wrong = await request(app).post("/api/auth/login").send({ email: "alice@test.com", password: "nope" });
    const unknown = await request(app).post("/api/auth/login").send({ email: "bob@test.com", password: "nope" });
    expect(wrong.status).toBe(400);
    expect(unknown.status).toBe(400);
    expect(wrong.body.message).toBe(unknown.body.message);
  });

  // Regression: missing fields crashed bcrypt and returned 500 with internal error text
  it("returns 400 for missing or invalid registration fields", async () => {
    expect((await register({ email: "a@b.co", password: "Test123!" })).status).toBe(400);
    expect((await register({ name: "A", email: "not-an-email", password: "Test123!" })).status).toBe(400);
    expect((await register({ name: "A", email: "a@b.co", password: "123" })).status).toBe(400);
    expect((await register({ name: "A", email: "a@b.co" })).status).toBe(400);
    expect((await request(app).post("/api/auth/login").send({ email: "a@b.co" })).status).toBe(400);
  });

  // Regression: object-valued email allowed MongoDB operator injection in findOne
  it("rejects NoSQL operator injection in credentials", async () => {
    await register({ name: "Alice", email: "alice@test.com", password: "Test123!" });
    const res = await request(app).post("/api/auth/login").send({ email: { $gt: "" }, password: "Test123!" });
    expect(res.status).toBe(400);
    expect(res.body.token).toBeUndefined();
  });

  it("does not create duplicate accounts", async () => {
    await register({ name: "Alice", email: "alice@test.com", password: "Test123!" });
    const again = await register({ name: "Alice 2", email: "alice@test.com", password: "Other123!" });
    expect(again.status).toBe(400);
    expect(await User.countDocuments()).toBe(1);
  });

  it("only accepts verified Google emails", async () => {
    verifyIdToken.mockResolvedValue({ email: "g@test.com", email_verified: false, name: "G" });
    const unverified = await request(app).post("/api/auth/google").send({ idToken: "tok" });
    expect(unverified.status).toBe(401);

    verifyIdToken.mockResolvedValue({ email: "g@test.com", email_verified: true, name: "G" });
    const ok = await request(app).post("/api/auth/google").send({ idToken: "tok" });
    expect(ok.status).toBe(200);
    expect(ok.body.token).toBeTruthy();

    verifyIdToken.mockRejectedValue(new Error("bad token"));
    const bad = await request(app).post("/api/auth/google").send({ idToken: "tok" });
    expect(bad.status).toBe(401);
  });

  it("validates and sanitizes dashboard layouts", async () => {
    const reg = await register({ name: "Alice", email: "alice@test.com", password: "Test123!" });
    const auth = { Authorization: `Bearer ${reg.body.token}` };

    const ok = await request(app).put("/api/auth/layout").set(auth).send({ dashboardLayout: [{ id: "timer", order: 0, size: "huge" }] });
    expect(ok.status).toBe(200);
    expect(ok.body.dashboardLayout[0]).toMatchObject({ id: "timer", order: 0, size: "medium" });

    expect((await request(app).put("/api/auth/layout").set(auth).send({ dashboardLayout: [null] })).status).toBe(400);
    expect((await request(app).put("/api/auth/layout").set(auth).send({ dashboardLayout: [{ id: "evil" }] })).status).toBe(400);
    expect((await request(app).put("/api/auth/layout").set(auth).send({ dashboardLayout: [{ id: "ai" }, { id: "ai" }] })).status).toBe(400);
  });

  it("rejects missing, malformed and forged tokens on protected routes", async () => {
    expect((await request(app).get("/api/goals")).status).toBe(401);
    expect((await request(app).get("/api/goals").set("Authorization", "Bearer garbage")).status).toBe(401);
    const forged = (await import("jsonwebtoken")).default.sign({ id: "x" }, "wrong-secret");
    expect((await request(app).get("/api/goals").set("Authorization", `Bearer ${forged}`)).status).toBe(401);
    expect((await request(app).get("/api/goals").set("Authorization", `Bearer ${tokenFor("507f1f77bcf86cd799439011")}`)).status).toBe(200);
  });
});
