// Shared test setup. Never let tests pick up real credentials or databases
// from .env files: force test-only values before any app module loads.
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-jwt-secret'
process.env.MONGO_URI = ''
process.env.GEMINI_API_KEY = 'test-key'
process.env.GEMINI_CHAT_KEY = ''
process.env.GEMINI_CONTROL_KEY = ''
process.env.GEMINI_GEN_KEY = ''

if (typeof window !== 'undefined') {
  await import('fake-indexeddb/auto')
  const { cleanup } = await import('@testing-library/react')
  const { afterEach } = await import('vitest')
  afterEach(() => cleanup())
}
