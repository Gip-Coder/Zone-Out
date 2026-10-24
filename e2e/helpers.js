import { expect } from '@playwright/test'

let counter = 0

/** Registers a fresh user through the real UI and waits for the dashboard. */
export async function registerNewUser(page, { name = 'E2E Student' } = {}) {
  const email = `e2e-${Date.now()}-${++counter}@test.com`
  await page.goto('/')
  await page.getByRole('button', { name: 'Create account' }).click()
  await page.getByLabel('Name').fill(name)
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill('Test123!')
  await page.getByRole('button', { name: 'Register', exact: true }).click()
  await expect(page.getByRole('link', { name: 'Dashboard' }).first()).toBeVisible()
  return { email, password: 'Test123!' }
}

/** Collects console errors and failed requests so tests can assert none occurred. */
export function trackPageErrors(page) {
  const errors = []
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`))
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return
    const text = msg.text()
    // Expected while AI is deliberately unconfigured in the E2E stack
    if (/503|AI service is temporarily unavailable|Service Unavailable/i.test(text)) return
    // Third-party Google sign-in icon may be blocked offline
    if (/svgrepo/i.test(text)) return
    errors.push(`console: ${text}`)
  })
  page.on('requestfailed', (req) => {
    if (/svgrepo|fonts\.g/.test(req.url())) return
    errors.push(`requestfailed: ${req.method()} ${req.url()} ${req.failure()?.errorText}`)
  })
  return errors
}
