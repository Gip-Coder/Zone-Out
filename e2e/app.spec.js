import { test, expect } from '@playwright/test'
import { registerNewUser, trackPageErrors } from './helpers.js'

test.describe('core user journeys', () => {
  test('register, log out and log back in', async ({ page }) => {
    const errors = trackPageErrors(page)
    const { email, password } = await registerNewUser(page)

    await page.getByRole('button', { name: 'Account menu' }).click()
    await page.getByRole('button', { name: /log ?out/i }).click()
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()

    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill('wrong-password')
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()
    await expect(page.getByText(/Invalid credentials/)).toBeVisible()

    await page.getByLabel('Password').fill(password)
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()
    await expect(page.getByRole('link', { name: 'Dashboard' }).first()).toBeVisible()
    expect(errors.filter((e) => !/400/.test(e))).toEqual([])
  })

  test('goals: add, complete, persist across reload, delete', async ({ page }) => {
    const errors = trackPageErrors(page)
    await registerNewUser(page)
    await page.getByRole('link', { name: 'Timeline' }).first().click()

    const input = page.getByLabel('New goal')
    await input.fill('Finish OS lab record')
    await input.press('Enter')
    await expect(page.getByText('Finish OS lab record')).toBeVisible()

    const checkbox = page.getByRole('checkbox', { name: /Finish OS lab record/ })
    await checkbox.click()
    await expect(checkbox).toHaveAttribute('aria-checked', 'true')

    await page.reload()
    await expect(page.getByRole('checkbox', { name: /Finish OS lab record/ })).toHaveAttribute('aria-checked', 'true')

    await page.getByRole('button', { name: 'Delete goal "Finish OS lab record"' }).click()
    await expect(page.getByText('Finish OS lab record')).toHaveCount(0)
    await page.reload()
    await expect(page.getByText('No goals yet.')).toBeVisible()
    expect(errors).toEqual([])
  })

  test('focus session completes and appears on the Progress page', async ({ page }) => {
    const errors = trackPageErrors(page)
    await page.clock.install()
    await registerNewUser(page)

    // Local intent routing: no AI call needed for a simple timer command
    await page.evaluate(() => window.dispatchEvent(new CustomEvent('open-ai-chat')))
    const chatInput = page.getByPlaceholder('Ask anything or give a command...')
    await chatInput.fill('start a 1 min timer')
    await chatInput.press('Enter')
    await expect(page.getByText("I've set a 1 minute focus timer for you!")).toBeVisible()
    await expect(page.getByRole('timer')).toHaveText(/00:00:5\d|00:01:00/)

    await page.clock.runFor(62_000)
    await expect(page.getByText('Focus session complete!')).toBeVisible()

    await page.getByRole('link', { name: 'Progress' }).first().click()
    await expect(page.getByText('1 min', { exact: true })).toBeVisible()
    await expect(page.getByText('Sessions completed')).toBeVisible()
    const sessions = page.getByText('Sessions completed', { exact: true }).locator('xpath=preceding-sibling::div[1]')
    await expect(sessions).toHaveText('1')
    await expect(page.getByText('General', { exact: true })).toBeVisible()
    expect(errors).toEqual([])
  })

  test('focus goal persists and shows weekly progress', async ({ page }) => {
    await registerNewUser(page)
    await page.getByRole('link', { name: 'Progress' }).first().click()
    await page.getByRole('button', { name: 'Set a focus goal to start tracking' }).click()
    await page.getByLabel('Weekly focus goal in minutes').fill('120')
    await page.getByRole('button', { name: 'Set', exact: true }).click()
    await expect(page.getByText('0 / 120 min')).toBeVisible()
    await page.reload()
    await expect(page.getByText('0 / 120 min')).toBeVisible()
  })

  test('course vault: create course, attach a file that survives reload, flashcards fallback', async ({ page }) => {
    const errors = trackPageErrors(page)
    await registerNewUser(page)
    await page.getByRole('link', { name: 'Course Vault' }).first().click()

    // Create a course from pasted syllabus text (AI is unavailable → manual parser)
    await page.locator('button:has(svg.lucide-plus)').click()
    await page.getByPlaceholder('Code').fill('cse2001')
    await page.getByPlaceholder('Name').fill('Data Structures')
    await page.getByText('Paste Text').click()
    await page.getByPlaceholder(/Paste full syllabus/).fill('Module 1: Arrays\n- Static arrays\n- Dynamic arrays\nModule 2: Trees\n- Binary trees')
    await page.getByRole('button', { name: 'Create course' }).click()
    await expect(page.getByText('Data Structures')).toBeVisible()
    await expect(page.getByText('2 Modules • 0 Files')).toBeVisible()

    // Upload a file; AI sorting is unavailable so the manual assignment modal appears
    await page.locator('input[type=file][multiple]').setInputFiles({
      name: 'arrays-notes.txt', mimeType: 'text/plain', buffer: Buffer.from('Arrays are contiguous memory.'),
    })
    await expect(page.getByText('Assign files to course & module')).toBeVisible()
    await page.getByRole('button', { name: 'Assign all' }).click()
    await expect(page.getByText('2 Modules • 1 Files')).toBeVisible()

    // Regression: files were stored as blob: URLs and broke after a reload
    await page.reload()
    await page.getByText('Data Structures').click()
    const fileButton = page.getByRole('button', { name: /^arrays-notes\.txt/ })
    await expect(fileButton).toBeVisible()
    await expect(fileButton).not.toContainText('re-upload needed')
    const [popup] = await Promise.all([page.waitForEvent('popup'), fileButton.click()])
    await expect(popup.locator('body')).toContainText('Arrays are contiguous memory.')
    await popup.close()

    // Quiz falls back to a manual quiz when AI is unavailable
    await page.getByRole('button', { name: 'Quiz' }).first().click()
    await expect(page.getByText(/Question 1 of \d/)).toBeVisible()
    await page.getByRole('button', { name: 'Close quiz' }).click()

    // Flashcards read the same IndexedDB
    await page.getByRole('link', { name: 'Flashcards' }).first().click()
    await page.locator('select').first().selectOption({ label: 'Data Structures' })
    await page.locator('select').nth(1).selectOption({ index: 1 })
    await page.getByRole('button', { name: 'Generate deck' }).click()
    await expect(page.getByText(/What is .*Static arrays/)).toBeVisible()
    expect(errors).toEqual([])
  })

  test('unknown routes show a not-found page', async ({ page }) => {
    await registerNewUser(page)
    await page.goto('/this-page-does-not-exist')
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
    await page.getByRole('link', { name: 'Back to dashboard' }).click()
    await expect(page).toHaveURL(/\/$/)
  })

  test('every sidebar page renders without errors', async ({ page }) => {
    const errors = trackPageErrors(page)
    await registerNewUser(page)
    for (const name of ['Dashboard', 'Timeline', 'Course Vault', 'Flashcards', 'Progress', 'Resources', 'Settings', 'Profile']) {
      await page.getByRole('link', { name }).first().click()
      await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
    }
    expect(errors).toEqual([])
  })
})
