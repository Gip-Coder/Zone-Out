import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { tokenFor, newUserId } from "./helpers.js";
import { AIRouter } from "../src/services/AIRouter.js";
import { clearCache, createCacheKey } from "../src/services/cache/cache.js";
import { sanitizeAction } from "../src/utils/aiActions.js";
import { buildChatPrompt } from "../src/utils/contextBuilder.js";
import { parseThinkResponse } from "../src/services/aiService.js";

vi.mock("../src/config/firebaseAdmin.js", () => ({ default: { auth: () => ({}) } }));

/** Fake Gemini client: `behaviour(model, prompt)` returns text or throws. */
const fakeFactory = (behaviour) => () => ({
  getGenerativeModel: ({ model }) => ({
    generateContent: async (prompt) => ({ response: { text: () => behaviour(model, prompt) } }),
  }),
});

beforeEach(() => clearCache());

describe("AIRouter", () => {
  it("fails over to the next model on quota errors", async () => {
    const seen = [];
    const router = new AIRouter({
      clientFactory: fakeFactory((model) => {
        seen.push(model);
        if (seen.length === 1) throw new Error("429 quota exceeded");
        return `answer from ${model}`;
      }),
    });
    const text = await router.safeGenerate("hello", "chat");
    expect(seen).toHaveLength(2);
    expect(text).toBe(`answer from ${seen[1]}`);
  });

  it("throws a clear error when every model fails", async () => {
    const router = new AIRouter({ clientFactory: fakeFactory(() => { throw new Error("503 overloaded"); }) });
    await expect(router.safeGenerate("hello", "chat")).rejects.toThrow(/All Gemini fallbacks failed/);
  });

  it("treats empty model output as a failure", async () => {
    const router = new AIRouter({ clientFactory: fakeFactory(() => "   ") });
    await expect(router.safeGenerate("hello", "generate")).rejects.toThrow(/Empty response/);
  });

  // Regression: cache key was the first 300 chars, so prompts sharing a long
  // preamble (e.g. syllabus or quiz templates) returned each other's answers.
  it("does not serve one prompt's cached answer for a different prompt with the same preamble", async () => {
    const preamble = "x".repeat(400);
    const router = new AIRouter({ clientFactory: fakeFactory((m, prompt) => `reply:${prompt.slice(-1)}`) });
    expect(await router.safeGenerate(`${preamble} A`, "generate")).toBe("reply:A");
    expect(await router.safeGenerate(`${preamble} B`, "generate")).toBe("reply:B");
    expect(createCacheKey({ prompt: `${preamble} A`, type: "generate" }))
      .not.toBe(createCacheKey({ prompt: `${preamble} B`, type: "generate" }));
  });

  it("caches identical prompts and deduplicates in-flight requests", async () => {
    let calls = 0;
    const router = new AIRouter({ clientFactory: fakeFactory(() => { calls++; return "cached"; }) });
    await Promise.all([router.safeGenerate("same", "chat"), router.safeGenerate("same", "chat")]);
    await router.safeGenerate("same", "chat");
    expect(calls).toBe(1);
  });

  it("reports a missing API key instead of calling the provider", async () => {
    const saved = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = "";
    try {
      const router = new AIRouter({ clientFactory: fakeFactory(() => "never") });
      await expect(router.safeGenerate("q", "chat")).rejects.toThrow(/not configured/);
    } finally {
      process.env.GEMINI_API_KEY = saved;
    }
  });
});

describe("AI action allowlist", () => {
  it("accepts valid actions and normalizes parameters", () => {
    expect(sanitizeAction({ type: "SET_TIMER", minutes: "25" })).toEqual({ type: "SET_TIMER", minutes: 25 });
    expect(sanitizeAction({ type: "NAVIGATE", view: "goals" })).toEqual({ type: "NAVIGATE", view: "goals" });
    expect(sanitizeAction({ type: "ADD_GOAL", title: " CAT 2 ", date: "2026-11-01", plan: ["Read ch1", { task: "Quiz" }, { nope: 1 }] }))
      .toEqual({ type: "ADD_GOAL", title: "CAT 2", date: "2026-11-01", plan: [{ task: "Read ch1", done: false }, { task: "Quiz", done: false }] });
  });

  it("rejects unknown actions and out-of-range parameters", () => {
    expect(sanitizeAction({ type: "DELETE_ACCOUNT" })).toBeNull();
    expect(sanitizeAction({ type: "SET_TIMER", minutes: -5 })).toBeNull();
    expect(sanitizeAction({ type: "SET_TIMER", minutes: 100000 })).toBeNull();
    expect(sanitizeAction({ type: "SET_TIMER", minutes: "abc" })).toBeNull();
    expect(sanitizeAction({ type: "NAVIGATE", view: "javascript:alert(1)" })).toBeNull();
    expect(sanitizeAction({ type: "ADD_GOAL", title: "" })).toBeNull();
    expect(sanitizeAction("SET_TIMER")).toBeNull();
    expect(sanitizeAction(null)).toBeNull();
  });

  it("strips unsafe actions from parsed model output", () => {
    const parsed = parseThinkResponse('```json\n{ "text": "Done!", "action": { "type": "SET_TIMER", "minutes": 99999 }, }\n```');
    expect(parsed).toEqual({ text: "Done!", action: null });
    expect(() => parseThinkResponse("no json here")).toThrow();
  });
});

describe("chat prompt construction", () => {
  // Regression: the whole prompt was cut to 100 words from the front, which
  // dropped the user's new message whenever there was conversation history.
  it("always keeps the user's new message even with long history", () => {
    const history = Array.from({ length: 20 }, (_, i) => ({ role: i % 2 ? "assistant" : "user", content: `turn ${i} `.repeat(30) }));
    const prompt = buildChatPrompt("What is a binary search tree?", history);
    expect(prompt).toContain("What is a binary search tree?");
    expect(prompt).toContain("turn 19"); // newest history kept
    expect(prompt).not.toContain("turn 0 "); // oldest dropped first
  });
});

describe("AI routes", () => {
  const { default: appPromise } = { default: import("../src/app.js") };
  const auth = { Authorization: `Bearer ${tokenFor(newUserId())}` };

  it("require authentication", async () => {
    const { default: app } = await appPromise;
    expect((await request(app).post("/api/ai/chat").send({ message: "hi" })).status).toBe(401);
  });

  it("validate input before calling the provider", async () => {
    const { default: app } = await appPromise;
    expect((await request(app).post("/api/ai/chat").set(auth).send({})).status).toBe(400);
    expect((await request(app).post("/api/ai/chat").set(auth).send({ message: "x".repeat(5000) })).status).toBe(400);
    expect((await request(app).post("/api/ai/think").set(auth).send({ userInput: 42 })).status).toBe(400);
    expect((await request(app).post("/api/ai/generate").set(auth).send({ prompt: "" })).status).toBe(400);
    expect((await request(app).post("/api/ai/flashcards").set(auth).send({ topics: "not-array" })).status).toBe(400);
  });
});
