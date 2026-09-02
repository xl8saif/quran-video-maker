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

test('export playback speed control exposes all supported speeds', async ({ page }) => {
  await page.goto('/')
  const speed = page.getByLabel('Playback speed')
  await expect(speed).toBeVisible()

  const options = await speed.locator('option').evaluateAll((nodes) =>
    nodes.map((node) => (node as HTMLOptionElement).value),
  )
  expect(options).toEqual(['0.75', '1', '1.25', '1.5', '2'])

  for (const value of options) {
    await speed.selectOption(value)
    await expect(speed).toHaveValue(value)
  }
})

test('preview speed control is available and updates across its supported range', async ({ page }) => {
  await page.goto('/')
  const speed = page.getByText('Speed', { exact: true }).locator('..').locator('input[type="range"]')
  await expect(speed).toBeVisible()
  await expect(speed).toHaveAttribute('min', '25')
  await expect(speed).toHaveAttribute('max', '100')

  for (const value of ['25', '50', '75', '100']) {
    await speed.fill(value)
    await expect(speed).toHaveValue(value)
  }
})
