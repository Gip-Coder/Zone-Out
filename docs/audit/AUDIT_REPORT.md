# ZoneOut — Audit Report

**Date:** 2026-10-24 · **Scope:** full repository (React/Vite frontend, Express/MongoDB API, AI integration) · **Overall status:** **PASS WITH DOCUMENTED LIMITATIONS**

Companion documents: [REMEDIATION_LOG.md](REMEDIATION_LOG.md) (every defect, root cause, fix, test) · [TEST_MATRIX.md](TEST_MATRIX.md) (feature-by-feature verification).

## 1. Executive summary

41 defects were found and fixed: 1 Critical, 9 High, 23 Medium, 7 Low, plus one dependency-hygiene item that was partially resolved. Each has a regression test or a stated verification method. The most serious:

- **Critical:** anyone could modify or delete any user's goals (`PUT`/`DELETE /api/goals/:id` had no authentication or ownership check).
- **High:** the Progress page charts were always empty (sessions were never recorded); the weekly focus goal reset every day; every Course Vault AI feature was dead (it called a method that didn't exist); uploaded files disappeared on reload; one IndexedDB bug could permanently break Course Vault; the AI cache could return one prompt's answer for a different prompt; the API's `package.json` omitted four runtime dependencies; auth accepted NoSQL operator payloads; the focus timer ran slow in background tabs.

8 items remain open, none Critical (see §7).

## 2. Architecture and feature inventory

| Layer | Stack | Notes |
|-------|-------|-------|
| Frontend | React 19, Vite 7, React Router 7, framer-motion, dnd-kit, PWA plugin | Deployed on Vercel (`vercel.json` SPA rewrite) |
| API | Express 5, Mongoose 9, JWT, bcrypt, express-rate-limit | Hosted on Render (`zone-out.onrender.com`); entry `server/src/server.js`, app in `server/src/app.js` |
| Data | MongoDB (users, goals, progress entries, daily summaries); IndexedDB (Course Vault courses, files, study plans); localStorage (token, user, theme, offline goals) | |
| AI | Gemini via `@google/generative-ai`, 4-model fallback queue, in-memory cache + dedup | `/api/ai/chat`, `/think` (app control), `/generate`, `/flashcards` |
| Social | Firebase Firestore (Study Groups), Firebase Auth (Google sign-in) | Firestore accessed directly from the browser |

**Live routes:** Dashboard, Timeline (goals), Course Vault, Study Groups, Flashcards, Progress, Resources (placeholder), Settings, Profile, AI (info page), 404. **Floating widgets:** Focus Timer, Music, AI chat.

**Unreachable code (verified unreferenced, left in place):** `src/features/study-groups/` (~40 files), `src/ai/*`, `src/services/NeuralBrain.js`, `src/components/AIAssistant.jsx`, server `authController.js`, `validate.js`, `authValidation.js`, `providers/{gemini,openrouter,openrouterProvider,claudeProvider,geminiProvider}.js`.

## 3. Baseline (before changes)

| Check | Result |
|-------|--------|
| `vite build` | Passed; main chunk **1,185 KB** (gzip 361 KB) |
| `eslint .` | **135 errors**, 1 warning (39 were config false positives: server linted with browser globals) |
| Tests | **None existed** (`server` test script was a stub that exits 1) |
| `npm audit` | Root 35 (3 critical, 23 high); production-only 13; server 23 (3 critical, 9 high) |
| Uncommitted user work | Lazy routes, rAF cleanup, two indexes, `bcryptjs` dep: preserved and kept |

## 4. Findings by category

**Security & privacy:** D-01 IDOR (critical), D-09 NoSQL injection, D-14 unvalidated AI actions, D-27 token/user-ID logging, D-28 Google account linking without `email_verified` and with `Math.random` passwords, D-29 internal error leakage, D-30 no brute-force limits, D-31 unbounded AI input. A search found no XSS sinks (`dangerouslySetInnerHTML`, `innerHTML`, `eval`). Secrets: `.env` files are gitignored and have never been committed; no secrets appear in the diff. No penetration testing was performed.

**Data integrity:** D-02, D-03, D-05, D-06, D-16, D-17, D-18, D-26.

**AI:** D-04 (dead feature), D-07 (cache collision), D-13 (message truncation), D-14 (allowlist), D-15 (env load order), D-25 (malformed output handling), D-31 (timeouts). Model output is now treated as untrusted on both server and client.

**Reliability / UX:** D-10–D-12 timer, D-19–D-24 state sync and duplicates, D-32 widget overlap (found by the E2E run), D-35 404.

**Accessibility:** D-34. axe-core (WCAG 2.1 A/AA rules) reports **0 violations** on the login page and 6 app pages, desktop and mobile. Before the fixes it found 3 critical rule types (unnamed buttons, unlabeled selects) and 9+ contrast failures. `prefers-reduced-motion` is now honored.

**Performance:** D-33. Main JS chunk **1,185 KB → 467 KB (−61%); gzip 361 → 149 KB (−59%)**. Course Vault now loads as its own 42 KB lazy chunk, and Firebase (681 KB) loads only after the login screen mounts. Build: `vite build`, Node 22.18, Windows 11.

## 5. Commands executed and final results

| Command | Final result |
|---------|--------------|
| `npx eslint . --max-warnings=0` | ✅ 0 errors, 0 warnings |
| `npm test` (`vitest run`) | ✅ 11 files, **68 tests passed** (36 API integration against in-memory MongoDB, 32 frontend unit/component) |
| `PW_CHANNEL=msedge npm run test:e2e` | ✅ **13 passed** (7 journeys + responsive + axe; desktop and mobile) |
| `npx vite build` | ✅ passes |
| `npm audit` (root) | 4 high (Firebase → grpc-js chain, see O-1); production-only: 4 |
| `npm audit` (server) | 8 moderate (`uuid` via firebase-admin, see O-2); **0 high/critical** |
| Server manifest check | Every bare import in `server/src` is declared, except `zod` (used only by dead `authValidation.js`) |

**Regression-test validity was checked** by running tests against the original code: 4/6 goal-API tests and 6/6 Timer tests fail on the pre-fix files. Some Timer failures there are selector misses, because the original Timer had no accessible names; the reset, wall-clock and session-length assertions target behavior directly.

## 6. How to run

```bash
npm install && (cd server && npm install)
npm test                            # API + frontend tests (downloads a MongoDB binary on first run)
npx playwright install chromium     # once; or set PW_CHANNEL=msedge / chrome to use an installed browser
npm run test:e2e                    # starts an isolated API (in-memory DB, no AI/Firebase keys) + Vite
```

The E2E harness overrides `MONGO_URI`, `JWT_SECRET`, Gemini and Firebase settings, so it never touches production services configured in `.env`.

**Deployment notes:** `npm start` in `server/` is unchanged (`node src/server.js`). Optional new env vars: `CORS_ORIGINS` (comma-separated; defaults to the previous two origins) and `DEBUG_REQUESTS=true`. Re-deploy the API so the Render build picks up the newly declared dependencies.

## 7. Remaining risks and limitations

See REMEDIATION_LOG "Unresolved". In short: Firebase/grpc and firebase-admin/uuid advisories need major upgrades (O-1, O-2). Goals created offline can be overwritten on reconnect (O-3). The JWT lives in localStorage (O-4). Study Groups' Firestore rules aren't in the repo and the page wasn't E2E-tested (O-5). Dead code is left in place (O-6). Spotify uses the deprecated implicit grant (O-7). AI cache and limits are per-process (O-8).

**Not verified:** live Gemini responses (would spend real quota; the model names in `AIRouter` are unverified), real Google sign-in, PDF syllabus extraction (pdf.js worker loads from a CDN), music providers, PWA/offline behavior, manual screen-reader testing, and Lighthouse/runtime profiling (only bundle size was measured).

## 8. Release readiness review (2026-10-24)

A focused re-verification ran on the final working tree. Full checklist, Render instructions, advisory upgrade paths and the proposed commit are in [RELEASE.md](RELEASE.md).

**Local results (re-run, this tree):** lint exit 0 (0 warnings) · API tests 36/36 · frontend tests 32/32 · E2E 13/13 · production build OK (main chunk 467.42 kB) · no server secret values in `dist/`.

**Goal-ownership fix:** confirmed in `server/src/routes/goalRoutes.js` (auth on every route, owner-scoped update/delete, field whitelist). The new post-deploy script `e2e/smoke-prod.mjs` passes 16/16 locally and reports 8 failures against the original code.

**Production verification: not performed.** No commit, push or deployment has been authorized. The currently deployed API still runs the pre-fix code, so the goal IDOR remains exploitable in production until the API is redeployed.

## 9. Readiness assessment

Every Critical and High defect found is fixed and covered by an automated test that passes. Lint, build, unit, integration and E2E suites all pass. The app is in a materially safer and more correct state, but it is **not claimed defect-free**: the integrations listed in §7 were not exercised against live services. The API change (D-01 especially) only protects production once the server is re-deployed.
