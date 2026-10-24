import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { registerNewUser } from './helpers.js'

const PAGES = [
  ['Dashboard', '/'],
  ['Timeline', '/timeline'],
  ['Course Vault', '/course-vault'],
  ['Flashcards', '/flashcards'],
  ['Progress', '/progress'],
  ['Settings', '/settings'],
]

test.describe('layout and accessibility', () => {
  test('pages do not overflow horizontally', async ({ page }, testInfo) => {
    await registerNewUser(page)
    const overflowing = []
    for (const [name, path] of PAGES) {
      await page.goto(path)
      await page.waitForLoadState('networkidle')
      const { scrollWidth, innerWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }))
      if (scrollWidth > innerWidth + 1) overflowing.push(`${name}: ${scrollWidth}px > ${innerWidth}px`)
      await page.screenshot({ path: testInfo.outputPath(`${testInfo.project.name}-${name.replace(/\s/g, '-')}.png`), fullPage: true })
    }
    expect(overflowing).toEqual([])
  })

  test('login page has no serious automated accessibility violations', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('heading', { name: 'Sign in' }).waitFor()
    // Let the 0.8s entrance fade finish; mid-fade colours are not what users read
    await page.waitForTimeout(1200)
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    const serious = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact))
    for (const v of results.violations) {
      for (const n of v.nodes) console.log(`AXE_NODE Login ${v.id} ${n.target.join(' ')} :: ${(n.failureSummary || '').split('\n').slice(1, 2).join(' ').trim()}`)
    }
    expect(serious.map((v) => `${v.id} (${v.nodes.length})`)).toEqual([])
  })

  test('app pages: report automated accessibility violations', async ({ page }) => {
    await registerNewUser(page)
    const report = {}
    for (const [name, path] of PAGES) {
      await page.goto(path)
      await page.waitForLoadState('networkidle')
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
      report[name] = results.violations.map((v) => `${v.impact}:${v.id}(${v.nodes.length})`)
      for (const v of results.violations) {
        for (const n of v.nodes) console.log(`AXE_NODE ${name} ${v.id} ${n.target.join(' ')} :: ${(n.failureSummary || '').split('\n').slice(1, 2).join(' ').trim()}`)
      }
    }
    console.log('AXE_REPORT ' + JSON.stringify(report))
    const blocking = Object.entries(report).flatMap(([n, vs]) => vs.filter((v) => /^(critical|serious):/.test(v)).map((v) => `${n} ${v}`))
    expect(blocking).toEqual([])
  })
})
