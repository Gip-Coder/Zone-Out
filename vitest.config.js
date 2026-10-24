import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    // Backend tests run in Node; frontend tests opt into jsdom per file with
    // a `// @vitest-environment jsdom` comment.
    environment: 'node',
    include: ['src/**/*.test.{js,jsx}', 'server/test/**/*.test.js'],
    setupFiles: ['./test/setup.js'],
    // The in-memory MongoDB binary download can be slow on first run
    hookTimeout: 120000,
    testTimeout: 20000,
    restoreMocks: true,
  },
})
