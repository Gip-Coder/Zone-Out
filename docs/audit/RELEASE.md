# Release Readiness and Deployment

Prepared 2026-10-24 on branch `main` (in sync with `origin/main` at `fcc4860`). **Nothing has been committed, pushed or deployed.** Local verification only. Production verification is pending an authorized deploy (§5).

## 1. Release checklist

| # | Item | Status | Evidence |
|---|------|--------|----------|
| 1 | Diff reviewed: no secrets, no debug artifacts, user work preserved | PASS | `.env` and `server/.env` are gitignored and never committed; secret-pattern scan of the diff found nothing; only `package.json` has a one-line EOL difference; pre-audit user edits (lazy routes, rAF cleanup, pdf.js lazy import, Widget aria-label, Goal/Progress `user` indexes, `bcryptjs` dep) intact |
| 2 | Goal-ownership fix lives in the API | PASS | `server/src/routes/goalRoutes.js`: `router.use(protect)` on all goal routes; PUT/DELETE query `{ _id, user: req.user }` → 404 for others; `pickGoalFields` whitelist (`user` can't be set); invalid IDs → 404 |
| 3 | Regression tests for unauthorized requests | PASS | `server/test/goals.test.js` (4 of 6 fail on the original code); `e2e/smoke-prod.mjs` 16/16 on fixed code, 8 FAIL on original code |
| 4 | Lint | PASS | `npx eslint . --max-warnings=0`: exit 0, no output |
| 5 | API tests | PASS | `npx vitest run server/test`: 4 files, **36 passed** |
| 6 | Frontend tests | PASS | `npx vitest run src`: 7 files, **32 passed** |
| 7 | End-to-end tests | PASS | `PW_CHANNEL=msedge npx playwright test`: **13 passed** (1.2 min); axe: 0 violations on 6 pages, desktop + mobile |
| 8 | Production build | PASS | `npm run build`: exit 0; `index` 467.42 kB (gzip 149.41 kB), `firebaseDb` 680.92 kB (lazy) |
| 9 | No server secrets in frontend bundle | PASS | Values of `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`, `GEMINI_*`, `OPENROUTER_API_KEY` absent from `dist/`. Present: public `VITE_*` Firebase web config, Google client ID, API URL (expected) |
| 10 | Logs don't leak secrets | PASS | Auth-header/user-ID logging removed; `DEBUG_REQUESTS` logs method + path only (no query/body/headers). Minor note: `db.js` logs the full Mongo connection error object |
| 11 | Dependency advisories | PASS (documented, accepted) | Root: 4 high (Firebase→grpc-js), server: 8 moderate (`uuid`). No upstream non-breaking fix (§4) |
| 12 | Release commit prepared | READY, awaiting approval | §3 |
| 13 | Render configuration identified | BLOCKED | No `render.yaml`/Procfile in repo; service settings exist only in the Render dashboard (§2) |
| 14 | Deployment | BLOCKED | Not authorized |
| 15 | Production smoke tests | BLOCKED | Requires deploy; script ready (§5) |

## 2. Render deployment (from repository facts)

**Known from the repo**
- API origin: `https://zone-out.onrender.com` (hard-coded fallback in `src/services/apiClient.js`).
- Branch: `main` (the only branch).
- Start: `server/package.json` → `npm start` = `node src/server.js`; listens on `process.env.PORT` (Render injects it).
- Frontend: Vercel, origin `https://zone-out-jade.vercel.app` (CORS default, `vercel.json` SPA rewrite).
- Health check: `GET /api/health` → `200 {"status":"ok"}` (new in this release; not present in the currently deployed build).

**Must be confirmed in the Render dashboard (not in the repo)**
- Root Directory and build command. Before this release `server/package.json` lacked `mongoose`, `cookie-parser`, `express-rate-limit` and `jsonwebtoken`, while the root `package.json` lacked `firebase-admin` and `@google/generative-ai`. The current service therefore probably installs in both directories (e.g. root `npm install && cd server && npm install`), but I can't confirm that. After this release, `server/` alone is sufficient: Root Directory `server`, build `npm ci`, start `npm start`.
- Node version (no `engines` field). Mongoose 9 and Express 5 need a current Node LTS; tests ran on Node 22.18.
- Auto-deploy on push to `main`: on or off.

**Environment variables read by the API**

| Variable | Required | Notes |
|----------|----------|-------|
| `MONGO_URI` | yes | Without it the API starts but all DB routes fail |
| `JWT_SECRET` | yes | Missing → protected routes return 500 "Server auth is not configured" |
| `NODE_ENV=production` | strongly recommended | Hides internal 5xx messages; never set `test` (that disables rate limits) |
| `GEMINI_API_KEY` or `GEMINI_CHAT_KEY` / `GEMINI_CONTROL_KEY` / `GEMINI_GEN_KEY` | for AI | Absent → AI routes return 503; the app falls back |
| `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | for Google sign-in | Private key may use `\n` escapes |
| `CORS_ORIGINS` | optional | Comma-separated, exact origins, **no trailing slash**. Unset → `http://localhost:5173,https://zone-out-jade.vercel.app` (unchanged behavior). If set, it **replaces** the default list |
| `DEBUG_REQUESTS` | optional | Leave unset in production |
| `PORT` | auto | Provided by Render |
| `JWT_REFRESH_SECRET`, `OPENROUTER_API_KEY` | not used | Only referenced by unreachable code |

**Rollout order:** deploy the API first (it carries the security fix and stays compatible with the current frontend: new request fields are optional), then the Vercel frontend. On first boot Mongoose builds two new indexes on `progresses` and `goals` (`user`, plus `user,type,date`).

**Rollback:** redeploy the previous commit (`fcc4860`) from the Render dashboard. No data migrations to undo. The frontend's IndexedDB v4 upgrade only adds a missing store.

## 3. Proposed release commit (not created)

Stage explicitly. **Excluded:** your untracked `BENCHMARK_COMMANDS.md`, `BENCHMARK_SUMMARY.md`, `OPTIMIZATION_LOG.md`, `REPORT.md`, `RESUME_METRICS.md`, `benchmarks/`, `scratch/` (and gitignored `dist/`, `test-results/`, `.env*`).

```
git add .gitignore eslint.config.js package.json package-lock.json vitest.config.js playwright.config.js \
  server/package.json server/package-lock.json server/src server/test \
  src test e2e docs/audit
```

Files: 50 modified + new `server/src/app.js`, `server/src/utils/{validators,aiActions}.js`, `server/test/*`, `src/agent/actions.js`, `src/components/notesSectionUtils.js`, `src/pages/NotFoundPage.jsx`, `src/utils/date.js`, 7 frontend test files, `test/setup.js`, `e2e/*`, `docs/audit/*`.

Note: four modified files (`src/App.jsx`, `src/components/Auth.jsx`, `src/components/NotesSection.jsx`, `src/components/Widget.jsx`) also contain your pre-audit uncommitted edits, plus `server/package.json` and the two models. They are interleaved with the fixes, were included in all test runs, and would ship in this commit.

Suggested message:

```
Fix goal IDOR and progress/AI/vault defects; add test suites

- Goals API: require auth on all routes, scope update/delete to the owner,
  whitelist writable fields (fixes unauthenticated/cross-user edits)
- Auth: input validation (blocks operator injection), verified Google emails,
  brute-force limiter, no token logging
- Progress: persist focus sessions, carry focus goal across days, local dates,
  atomic daily summary
- AI: full-prompt cache keys, action allowlist, timeouts, chat history budget
- Course Vault: working AI calls, files persisted as Blobs, IndexedDB v4 repair
- Timer accuracy, accessibility fixes, 61% smaller main bundle
- Declare missing server dependencies; add Vitest/Supertest/Playwright suites
- Audit docs in docs/audit/

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

## 4. Remaining advisories: safe upgrade paths

| Advisory | Path | Why not now | Upgrade path & required tests |
|----------|------|-------------|-------------------------------|
| `@grpc/grpc-js` ≤1.13.5 (high ×4, prod) | `firebase@12.9.0` → `@firebase/firestore` | Even the latest `firebase` 13.1.0 pins `@grpc/grpc-js ~1.9.0`; `npm audit fix --force` proposes a downgrade to firebase 9 (breaking). grpc-js is Firestore's Node transport; the Vite browser build uses the web transport | Watch for a `@firebase/firestore` release that lifts the pin. Upgrade `firebase` within 12.x first. Test: build, Study Groups against a Firebase **emulator or staging project** (posts, likes, comments, presence), Google sign-in popup |
| `uuid` <11.1.1 (moderate ×8, server) | `firebase-admin@13.10.0` → `@google-cloud/*` → `google-gax`/`gaxios`/`teeny-request` | Fix requires `firebase-admin` 14.x (major; 14.5.0 available) | The server only uses `admin.auth().verifyIdToken`. Upgrade on a branch, read the v14 migration notes, run `server/test`, then verify Google sign-in end to end on a **staging** Render service with real Firebase credentials before production |

## 5. Production smoke test (after an authorized deploy)

`e2e/smoke-prod.mjs`, validated locally: 16/16 against the fixed API; against the original code it reports 8 FAIL (unauthenticated and cross-user update/delete return 200), so it detects the vulnerability.

1. Confirm the deployed commit in the Render dashboard (Events → deploy shows the commit SHA) and that `GET https://zone-out.onrender.com/api/health` returns 200 (proves the new build: this route does not exist before).
2. Phase 1, no credentials, no data writes (probes a random non-existent goal ID):
   `SMOKE_API=https://zone-out.onrender.com node e2e/smoke-prod.mjs`
3. Phase 2, opt-in: needs **two dedicated test accounts you create** (not real users). It creates one goal as A, verifies B gets 404 on update and delete, verifies the owner can't be reassigned, toggles and deletes it as A, and confirms cleanup. It touches nothing else.
   `SMOKE_API=… SMOKE_A_EMAIL=… SMOKE_A_PASSWORD=… SMOKE_B_EMAIL=… SMOKE_B_PASSWORD=… node e2e/smoke-prod.mjs`
4. Browser check on `https://zone-out-jade.vercel.app`: log in, add/toggle/delete a goal (after the frontend deploy).

Production results: **not yet collected**.
