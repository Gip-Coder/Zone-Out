// Post-deployment smoke test for the goal-ownership fix (D-01).
//
// Phase 1 (always): unauthenticated probes against a random, non-existent goal
// ID. Read-only in effect — no real goal can match.
// Phase 2 (opt-in): needs TWO dedicated test accounts. Creates one goal owned by
// account A, checks account B cannot change or delete it, then deletes it.
// It never touches any goal it did not create in this run.
//
// Usage:
//   SMOKE_API=https://zone-out.onrender.com node e2e/smoke-prod.mjs
//   SMOKE_API=... SMOKE_A_EMAIL=... SMOKE_A_PASSWORD=... \
//     SMOKE_B_EMAIL=... SMOKE_B_PASSWORD=... node e2e/smoke-prod.mjs
// SMOKE_REGISTER=1 registers the two accounts first (only allowed on localhost).
import crypto from "crypto";

const API = (process.env.SMOKE_API || "").replace(/\/$/, "");
if (!API) {
  console.error("Set SMOKE_API to the API origin, e.g. https://zone-out.onrender.com");
  process.exit(2);
}
const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(API);

let failures = 0;
const results = [];
const check = (name, ok, detail) => {
  results.push({ name, ok, detail });
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
};

async function call(method, path, { token, body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let json = null;
  try { json = await res.json(); } catch { /* non-JSON body */ }
  return { status: res.status, json };
}

const randomObjectId = () => crypto.randomBytes(12).toString("hex");

// ---------- Phase 1: no credentials ----------
const health = await call("GET", "/api/health");
check("GET /api/health returns 200 {status:ok} (new build is live)", health.status === 200 && health.json?.status === "ok", `status ${health.status}`);

const probeId = randomObjectId();
for (const [method, label] of [["PUT", "update"], ["DELETE", "delete"]]) {
  const r = await call(method, `/api/goals/${probeId}`, { body: method === "PUT" ? { completed: true } : undefined });
  check(`unauthenticated ${label} is rejected`, r.status === 401, `status ${r.status}`);
  const forged = await call(method, `/api/goals/${probeId}`, { token: "not-a-real-token", body: method === "PUT" ? { completed: true } : undefined });
  check(`invalid-token ${label} is rejected`, forged.status === 401, `status ${forged.status}`);
}
const list = await call("GET", "/api/goals");
check("unauthenticated list is rejected", list.status === 401, `status ${list.status}`);

// ---------- Phase 2: two test accounts ----------
const A = { email: process.env.SMOKE_A_EMAIL, password: process.env.SMOKE_A_PASSWORD };
const B = { email: process.env.SMOKE_B_EMAIL, password: process.env.SMOKE_B_PASSWORD };

if (A.email && A.password && B.email && B.password) {
  if (process.env.SMOKE_REGISTER === "1") {
    if (!isLocal) {
      console.error("SMOKE_REGISTER is only allowed against localhost.");
      process.exit(2);
    }
    for (const u of [A, B]) await call("POST", "/api/auth/register", { body: { name: "Smoke Test", ...u } });
  }

  const loginA = await call("POST", "/api/auth/login", { body: A });
  const loginB = await call("POST", "/api/auth/login", { body: B });
  check("test account A can log in", loginA.status === 200 && !!loginA.json?.token, `status ${loginA.status}`);
  check("test account B can log in", loginB.status === 200 && !!loginB.json?.token, `status ${loginB.status}`);

  if (loginA.json?.token && loginB.json?.token) {
    const ta = loginA.json.token;
    const tb = loginB.json.token;
    const text = `release-smoke ${new Date().toISOString()}`;
    const created = await call("POST", "/api/goals", { token: ta, body: { text } });
    check("A can create a goal", created.status === 201 && created.json?.text === text, `status ${created.status}`);
    const id = created.json?._id;

    if (id) {
      try {
        const bPut = await call("PUT", `/api/goals/${id}`, { token: tb, body: { completed: true, text: "tampered" } });
        check("B cannot modify A's goal", bPut.status === 404, `status ${bPut.status}`);
        const bDel = await call("DELETE", `/api/goals/${id}`, { token: tb });
        check("B cannot delete A's goal", bDel.status === 404, `status ${bDel.status}`);
        const bList = await call("GET", "/api/goals", { token: tb });
        check("B's goal list does not include A's goal", bList.status === 200 && !bList.json?.some((g) => g._id === id), `status ${bList.status}`);

        const steal = await call("PUT", `/api/goals/${id}`, { token: ta, body: { user: loginB.json.user?.id } });
        const aList = await call("GET", "/api/goals", { token: ta });
        const still = aList.json?.find((g) => g._id === id);
        check("owner field cannot be reassigned", steal.status === 200 && !!still && still.text === text && still.completed === false, `status ${steal.status}`);

        const toggle = await call("PUT", `/api/goals/${id}`, { token: ta, body: { completed: true } });
        check("A can update own goal", toggle.status === 200 && toggle.json?.completed === true, `status ${toggle.status}`);
      } finally {
        const del = await call("DELETE", `/api/goals/${id}`, { token: ta });
        check("A can delete own goal (cleanup)", del.status === 200, `status ${del.status}`);
      }
      const after = await call("GET", "/api/goals", { token: ta });
      check("smoke goal is gone after cleanup", after.status === 200 && !after.json?.some((g) => g._id === id), `status ${after.status}`);
    }
  }
} else {
  console.log("SKIP  phase 2 (set SMOKE_A_EMAIL/PASSWORD and SMOKE_B_EMAIL/PASSWORD for dedicated test accounts)");
}

console.log(`\n${results.length - failures}/${results.length} checks passed against ${API}`);
process.exit(failures ? 1 : 0);
