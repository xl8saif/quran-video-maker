import { test, expect } from '@playwright/test'

test('production app loads and exposes core Quran controls', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Quran Video Maker')).toBeVisible()
  await expect(page.getByText('Quran', { exact: true })).toBeVisible()
  await expect(page.locator('select').nth(0)).toBeVisible()
  await expect(page.getByText('Mushaf style', { exact: true })).toBeVisible()
  await expect(page.getByText('Display', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Export video', exact: true })).toBeVisible()
})

test('Surah and translation controls remain interactive', async ({ page }) => {
  await page.goto('/')
  const surah = page.locator('select').nth(0)
  await surah.selectOption('2')
  await expect(surah).toHaveValue('2')

  const translation = page.locator('select').filter({ has: page.locator('option[value="ur"]') }).first()
  await translation.selectOption('ur')
  await expect(translation).toHaveValue('ur')
})

test('export is initially available and does not start without user action', async ({ page }) => {
  await page.goto('/')
  const exportButton = page.getByRole('button', { name: 'Export video', exact: true })
  await expect(exportButton).toBeEnabled()
  await expect(page.getByText(/Exporting/)).toHaveCount(0)
})

test('export playback speed control exposes supported speeds and updates selection', async ({ page }) => {
  await page.goto('/')
  const speed = page.locator('label').filter({ hasText: 'Playback speed' }).locator('select')
  await expect(speed).toBeVisible()
  await expect(speed.locator('option')).toHaveText(['0.75×', '1×', '1.25×', '1.5×', '2×'])

  for (const value of ['0.75', '1', '1.25', '1.5', '2']) {
    await speed.selectOption(value)
    await expect(speed).toHaveValue(value)
  }
})
