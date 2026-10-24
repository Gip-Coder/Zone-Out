# Remediation Log

Audit date: 2026-10-24. Severity: **C** Critical, **H** High, **M** Medium, **L** Low.
"Regression test" names refer to files under `server/test/`, `src/**/*.test.*` and `e2e/`.

## Fixed and verified

| ID | Sev | Area | Defect → root cause | Fix (files) | Regression test | Verified |
|----|-----|------|--------------------|-------------|-----------------|----------|
| D-01 | C | Goals API | `PUT`/`DELETE /api/goals/:id` had **no auth and no ownership check**; any caller could edit/delete any user's goal. `PUT` also passed `req.body` straight to Mongo (could reassign `user`). | `router.use(protect)`, queries scoped to `{_id, user}`, field whitelist + validation, 404 on foreign/invalid IDs (`server/src/routes/goalRoutes.js`) | `goals.test.js` (4 tests fail on the original code, pass now) | ✅ |
| D-02 | H | Progress | Completed focus sessions only incremented a counter; no `Progress` entry was written, so every Progress-page chart was always empty for real users (only the seed script wrote entries). | `focus_session_completed` now creates a `Progress` entry (`progressController.js`) | `progress.test.js` "records completed focus sessions…", E2E "focus session completes…" | ✅ |
| D-03 | H | Progress | `ProgressSummary` is per-day; a new day started with `goalMinutes: 0`, so the weekly focus goal was lost every midnight and "min / week" only ever counted today. | New day inherits goal + totals from the latest earlier summary; focus progress summed over the goal's period (ISO week / month / day) | `progress.test.js` "carries the focus goal…", "measures weekly focus progress…", E2E focus-goal test | ✅ |
| D-04 | H | Course Vault AI | Course Vault called `brain.generateWithRouter()`, which did not exist → every AI feature (syllabus parsing, quizzes, study plans, video recs, file sorting) threw and silently used manual stubs. | Added `Brain.generateWithRouter` (rejects on failure/empty so fallbacks still work) | `Brain.test.js` | ✅ |
| D-05 | H | Course Vault files | Uploaded files were persisted as `blob:` URLs, which die on page reload → every upload was lost. | Store the `File`/`Blob` in IndexedDB; create object URL on open; legacy records show "re-upload needed" (`notesSectionUtils.js`, `NotesSection.jsx`) | `notesSectionUtils.test.js`, E2E "course vault… survives reload" (opens the file after reload) | ✅ |
| D-06 | H | Persistence | Flashcards opened the same IndexedDB (v3) but only created `courses`; visiting Flashcards first left no `goals` store and Course Vault failed on every load thereafter. | Single DB module, version 4, upgrade creates any missing store (repairs broken DBs, keeps data) (`src/utils/studyVaultDb.js`) | `studyVaultDb.test.js` "repairs a v3 database…" | ✅ |
| D-07 | H | AI cache | Cache key = first 300 chars of the prompt; prompts sharing a long template returned **another prompt's answer** (up to 10 min). | SHA-256 of the full normalized prompt (`cache/cache.js`); TTL key typo `generation`→`generate` | `ai.test.js` "does not serve one prompt's cached answer…" | ✅ |
| D-08 | H | Deploy | `server/package.json` lacked `mongoose`, `cookie-parser`, `express-rate-limit`, `jsonwebtoken`; it only ran because Node resolved them from the root `node_modules`. A build from `server/` alone would crash. | Declared deps (same ranges as root) | Manifest-vs-imports check (see AUDIT_REPORT) | ✅ |
| D-09 | H | Auth | No input validation: object-valued `email` allowed MongoDB operator injection in `findOne`; missing fields crashed bcrypt → 500 with internal error text. | Type/format validation, generic error responses (`authRoutes.js`) | `auth.test.js` injection + validation tests | ✅ |
| D-10 | H | Timer | Countdown decremented once per `setInterval` tick; browsers throttle background tabs, so the timer ran far slower than real time while users studied elsewhere. | Wall-clock deadline + `visibilitychange` catch-up (`Timer.jsx`) | `Timer.test.jsx` "tracks wall-clock time…" | ✅ |
| D-11 | M | Timer | Reset button click bubbled to the ring → reset then immediately restarted the timer. | `stopPropagation` | `Timer.test.jsx` "reset restores…" | ✅ |
| D-12 | M | Timer / AI | AI `SET_TIMER` didn't update the session length (logged wrong minutes) and didn't open the widget (timer never ran if closed). | Session duration lifted to App; widget opened on `SET_TIMER` | `Timer.test.jsx`, E2E chat-started session | ✅ |
| D-13 | M | AI chat | Whole chat prompt truncated to 100 words from the front, so with any history the user's **new message was cut off**. | History trimmed oldest-first within a budget; message always kept (`contextBuilder.js`) | `ai.test.js` "always keeps the user's new message" | ✅ |
| D-14 | M | AI safety | Model-returned actions were dispatched without validation (any type, any `minutes`). | Allowlist + range checks on server (`utils/aiActions.js`) **and** client (`src/agent/actions.js`) | `ai.test.js`, `actions.test.js`, `Brain.test.js` | ✅ |
| D-15 | M | Config | `dotenv.config()` ran after ESM imports were evaluated, so `AIRouter` read Gemini keys before `.env` loaded (AI broken locally). | `import "dotenv/config"` first; clients created lazily | `ai.test.js` missing-key test | ✅ |
| D-16 | M | Dates | Server and Progress page used UTC dates; a 1 AM IST session was filed under the previous day. | Client sends local date (validated within ±1 day); `src/utils/date.js` | `progress.test.js`, `date.test.js` | ✅ |
| D-17 | M | Data integrity | find-then-create of the daily summary raced on the unique index → E11000 → 500. | Atomic upsert with duplicate-key retry | `progress.test.js` 8 concurrent requests | ✅ |
| D-18 | M | Validation | Progress event payloads unvalidated (`"25"` string-concatenated into counters; negative/huge values; completed > total). | Numeric/range validation, completed ≤ total, unknown events → 400 | `progress.test.js` "validates event…" | ✅ |
| D-19 | M | Progress state | Progress never loaded after same-tab login; previous user's numbers remained after logout. | `refreshProgress` on auth, `resetProgress` on logout | E2E login journeys | ✅ |
| D-20 | M | Progress state | Event-triggered refresh dropped the page's date range (charts blanked); stale responses could overwrite newer ones. | Remember last range; request-id guard (`ProgressContext.jsx`) | E2E progress test | ✅ |
| D-21 | L | Progress page | Fetched N+1 days but charted N; sorted context state in place during render. | Range fixed; copy before sort | E2E | ✅ |
| D-22 | M | AI navigation | `NAVIGATE {view:"dashboard"}` (sent for "home"/"dashboard") was ignored. | Handled in App dispatcher | Manual code path + validator tests | ✅ |
| D-23 | M | Goals UI | Double click / repeated Enter created duplicate goals; concurrent toggles raced. | In-flight guards | `StudyGoals.test.jsx` | ✅ |
| D-24 | M | Goals UI | Timeline kept its own goal state, so goals added by the AI didn't appear until remount. | StudyGoals uses App's shared state when provided | `StudyGoals.test.jsx` | ✅ |
| D-25 | M | Course Vault AI | Malformed AI output (quiz without options, out-of-range answers, module titles missing/duplicated, bogus file indices) crashed or corrupted the UI; quiz hard-coded "of 5". | `normalizeQuiz/Modules/Plan/VideoRec`, `validFileMatches` | `notesSectionUtils.test.js` | ✅ |
| D-26 | M | State | `toggleGoalTask` and file sorting mutated React state objects in place. | Immutable updates | E2E course vault | ✅ |
| D-27 | M | Privacy | Every request logged; auth middleware logged token prefixes and user IDs. | Removed; optional `DEBUG_REQUESTS=true` logs method+path only | Diff review | ✅ |
| D-28 | M | Google auth | Account password from `Math.random`; accounts linked by email without checking `email_verified`; raw errors returned. | `crypto.randomBytes`, require verified email, 401 on bad token | `auth.test.js` Google tests | ✅ |
| D-29 | M | API errors | Internal error messages returned to clients; malformed JSON → 500; unknown `/api/*` → HTML. | Central error handler (400/413, generic 500 in production), JSON 404 | `goals.test.js` | ✅ |
| D-30 | M | Abuse | No brute-force protection on login/register/google. | Failed-attempt rate limiter (30/15 min/IP; successful logins don't count — campus NAT safe) | Config review (limiter skipped in tests) | ✅ |
| D-31 | M | AI cost/reliability | No per-call timeout on Gemini; unbounded prompt/message/history sizes. | 15 s per-model timeout; input caps on all AI endpoints | `ai.test.js` route validation | ✅ |
| D-32 | M | UI | Timer widget opened over the sidebar nav (blocked links) and stayed in headless mode (no close) after completion. Found by E2E. | Widgets open beside the sidebar; headless mode ends on completion | E2E focus-session test | ✅ |
| D-33 | M | Performance | App eagerly imported NotesSection/StudyGoals/Header (defeating lazy routes) and Auth eagerly imported Firebase compat → 1,185 KB main chunk. | Removed unused imports; Firebase preloaded after login screen mounts | Build output | ✅ 1,185 → 467 KB (gzip 361 → 149 KB) |
| D-34 | M | Accessibility | Unnamed icon buttons, unlabeled selects, mouse-only controls (goal checkbox, delete icons, timer ring, dashboard action cards), 9 contrast failures, reduced-motion ignored. | Buttons/labels/roles/keyboard handlers; token colors instead of stacked opacity; `MotionConfig reducedMotion="user"` | E2E axe scan: 0 violations on 7 pages, desktop + mobile | ✅ |
| D-35 | L | Routing | Unknown routes rendered an empty page. | `NotFoundPage` catch-all | E2E | ✅ |
| D-36 | L | Layout API | `null`/duplicate widgets → 500/duplicates stored; `size` unvalidated. | Validated + sanitized | `auth.test.js` layout test | ✅ |
| D-37 | L | Tooling | ESLint linted server code with browser globals; 135 errors. | Node globals for server/tests; all real issues fixed | `eslint . --max-warnings=0` passes | ✅ |
| D-38 | L | React | `navigate`/`setShowAI` used before declaration; refs written during render; cascading setState-in-effect (Flashcards, Profile, music auth, Timer). | Reordered; layout effects; handlers/lazy init | Lint + tests | ✅ |
| D-39 | L | Course Vault | Re-selecting the same file didn't fire `onChange`. | Input value reset | E2E | ✅ |
| D-40 | L | Goals | Deadline countdown measured to UTC midnight at the *start* of the due date. | Count to end of local day | Code review | ✅ |
| D-41 | — | Dependencies | 35 root / 23 server advisories. | `npm audit fix` (non-breaking) + Vitest 5 | `npm audit` | Partially, see below |

## Unresolved / deferred (with reason)

| ID | Sev | Item | Reason / next action |
|----|-----|------|----------------------|
| O-1 | H (advisory) | `firebase` → `@firebase/firestore` → `@grpc/grpc-js` advisory (4 high, prod). | Only "fix" offered is a downgrade to firebase 9 (breaking). grpc-js is used by Firestore under Node, not in the browser bundle. Re-check when Firebase ships an update. |
| O-2 | M (advisory) | `firebase-admin` → Google Cloud libs → `uuid` (8 moderate, server). | Fix requires a major `firebase-admin` change; out of scope for a safe patch. |
| O-3 | M | Offline goal fallback: goals created while the API is unreachable (`local_*` IDs) are overwritten by the next successful server load. | Needs a sync/merge design decision; not changed. |
| O-4 | M | JWT kept in `localStorage`, 7-day expiry, no revocation. | Architectural (httpOnly cookie + refresh flow). Not changed; XSS sinks were checked and none found. |
| O-5 | M | Study Groups uses Firestore directly; security rules aren't in the repo. Likes/counters are written client-side. | Can't verify authorization without the Firebase rules; the page wasn't E2E-tested (Firebase disabled in tests to avoid touching production). |
| O-6 | L | Dead code left in place: `src/features/study-groups/` (~40 files), `src/ai/*`, `NeuralBrain.js`, `AIAssistant.jsx`, server `authController.js`, `validate.js`, `authValidation.js` (imports undeclared `zod`), unused provider files. | Verified unreferenced; deletion is a product decision. |
| O-7 | L | Spotify implicit-grant flow (deprecated by Spotify); stored tokens never expire client-side. Music providers untested. | Needs a PKCE flow; requires provider credentials. |
| O-8 | L | AI cache, dedup and rate limiting are per-process memory. | Fine for one Render instance; use a shared store if scaled out. |
