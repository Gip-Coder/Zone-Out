# Test Matrix

Result key: ✅ verified by an automated test that passed on 2026-10-24 · 🔶 partially verified · ⛔ not verified (reason given).
E2E = Playwright against the real Express API + in-memory MongoDB + Vite dev server, run in Microsoft Edge (desktop 1280×720 and Pixel 7 emulation). AI providers are deliberately unconfigured in E2E, so AI paths exercise their fallbacks.

| # | Feature / journey | Expected behavior | Method | Result | Evidence |
|---|-------------------|-------------------|--------|--------|----------|
| 1 | Register | Account created, token stored, dashboard shown | E2E + API | ✅ | `e2e/app.spec.js` register…, `auth.test.js` |
| 2 | Login / wrong password / logout | Bad password → "Invalid credentials"; logout returns to sign-in; re-login works | E2E + API | ✅ | `e2e/app.spec.js` |
| 3 | Auth input validation & injection | 400 for missing/invalid fields and `{ "$gt": "" }` payloads | API | ✅ | `auth.test.js` |
| 4 | Google sign-in | Verified emails only; bad token → 401 | API (mocked Firebase Admin) | 🔶 | `auth.test.js`; real popup flow not run (needs a Google account) |
| 5 | Protected routes | Missing/forged/garbage tokens → 401 | API | ✅ | `auth.test.js` |
| 6 | Goals CRUD | Add, toggle, delete; persists across reload | E2E + API + component | ✅ | `e2e/app.spec.js` goals, `goals.test.js`, `StudyGoals.test.jsx` |
| 7 | Goal authorization (IDOR) | Users can't read, edit or delete others' goals; can't reassign owner | API | ✅ | `goals.test.js` |
| 8 | Duplicate goal submission | Repeated clicks create one goal | Component | ✅ | `StudyGoals.test.jsx` |
| 9 | Goals offline fallback | API down → local goals shown | Component | ✅ | `StudyGoals.test.jsx` (merge-on-reconnect not handled, see O-3) |
| 10 | Focus timer countdown/completion | Counts down, completes, logs correct minutes | Component + E2E (fake clock) | ✅ | `Timer.test.jsx`, E2E focus session |
| 11 | Timer background-tab accuracy | Wall-clock accurate when ticks are delayed | Component | ✅ | `Timer.test.jsx` |
| 12 | Timer reset / manual set / keyboard | Reset doesn't restart; invalid input ignored; Enter opens editor | Component | ✅ | `Timer.test.jsx` |
| 13 | AI chat timer command | "start a 1 min timer" opens widget and runs | E2E | ✅ | E2E focus session |
| 14 | Session → Progress page | Session appears in totals, daily chart and subject chart | E2E + API | ✅ | E2E, `progress.test.js` |
| 15 | Focus goal | Set weekly goal; persists after reload and across days; weekly sum | E2E + API | ✅ | E2E focus goal, `progress.test.js` |
| 16 | Progress concurrency & validation | No duplicate summaries; bad payloads → 400 | API | ✅ | `progress.test.js` |
| 17 | Progress user isolation | Other users' sessions never counted | API | ✅ | `progress.test.js` |
| 18 | Course Vault: create course (paste) | Course with parsed modules | E2E | ✅ | E2E course vault |
| 19 | Course Vault: PDF syllabus upload | Text extracted from PDF | ⛔ | ⛔ | No fixture PDF in E2E; pdf.js worker loads from jsDelivr CDN (needs network) |
| 20 | Course Vault: file upload + manual sort | Modal assignment; file still opens after reload | E2E | ✅ | E2E (opens the stored file after reload) |
| 21 | Course Vault: quiz | AI quiz validated; manual fallback when AI is down | Unit + E2E | ✅ | `notesSectionUtils.test.js`, E2E |
| 22 | Course Vault: study plan, video rec, module notes, delete course/file | Plans/recs validated; notes autosave; deletes confirmed | Unit (validators); UI not E2E | 🔶 | Validators covered; UI paths not automated |
| 23 | IndexedDB schema migration | v3 DB missing `goals` repaired without data loss | Unit (fake-indexeddb) | ✅ | `studyVaultDb.test.js` |
| 24 | Flashcards | Lists Course Vault courses; generates deck (fallback) | E2E | ✅ | E2E course vault |
| 25 | AI router fallback, cache, dedup | Fails over on 429/503; cache keyed on full prompt | Unit (fake provider) | ✅ | `ai.test.js` |
| 26 | AI action allowlist | Unknown/out-of-range actions dropped (server + client) | Unit | ✅ | `ai.test.js`, `actions.test.js`, `Brain.test.js` |
| 27 | AI endpoints auth + input caps | 401 unauthenticated; 400 oversized/invalid | API | ✅ | `ai.test.js` |
| 28 | Live Gemini responses | Real model answers | ⛔ | ⛔ | Not run: would spend real quota; no live verification claimed |
| 29 | Dashboard layout customize | Validated save; invalid layouts rejected | API; UI drag not automated | 🔶 | `auth.test.js` layout |
| 30 | All sidebar pages render | No console errors / failed requests | E2E | ✅ | E2E "every sidebar page…" |
| 31 | Unknown route | Not-found page with a way back | E2E | ✅ | E2E |
| 32 | Responsive layout | No horizontal overflow at 1280 px and 412 px | E2E | ✅ | `e2e/responsive.spec.js` (+ screenshots) |
| 33 | Accessibility (automated) | No serious/critical axe WCAG 2.1 A/AA violations | E2E axe | ✅ | 0 violations on login + 6 app pages, desktop & mobile |
| 34 | Accessibility (manual screen reader) | — | ⛔ | ⛔ | Not performed |
| 35 | Study Groups (Firestore posts/likes/comments) | — | ⛔ | ⛔ | Firebase disabled in tests to avoid writing to production Firestore; rules not in repo |
| 36 | Music player (Spotify/YouTube/Apple) | — | ⛔ | ⛔ | Requires third-party accounts |
| 37 | Theme toggle & persistence | Persists in localStorage | Code review | 🔶 | Not automated |
| 38 | PWA install / offline | — | ⛔ | ⛔ | Not tested |
