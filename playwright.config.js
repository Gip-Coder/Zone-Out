import { defineConfig, devices } from '@playwright/test'

const API_PORT = 5055
// Use an installed browser when PW_CHANNEL is set (e.g. "msedge" or "chrome");
// otherwise Playwright's bundled Chromium (`npx playwright install chromium`).
const channel = process.env.PW_CHANNEL || undefined

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], channel } },
    { name: 'mobile', use: { ...devices['Pixel 7'], channel }, testMatch: /responsive\.spec\.js/ },
  ],
  webServer: [
    {
      command: 'node e2e/start-api.mjs',
      port: API_PORT,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      // Point the app at the local test API and disable Firebase so the run
      // never touches production services configured in .env.
      command: 'npx vite --port 5173 --strictPort',
      port: 5173,
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        VITE_API_BASE_URL: `http://localhost:${API_PORT}`,
        VITE_FIREBASE_API_KEY: '',
      },
    },
  ],
})
