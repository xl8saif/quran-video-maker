import { test, expect } from '@playwright/test'

test('production app loads the current Waraq Quran Reel Maker UI', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Waraq Quran Reel Maker', exact: true })).toBeVisible()
  await expect(page.getByText('Quran', { exact: true })).toBeVisible()
  await expect(page.getByText('Mushaf style', { exact: true })).toBeVisible()
  await expect(page.getByText('Preview', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Export video', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'En', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Ar', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Ur', exact: true })).toBeVisible()
})

test('Surah, language and translation-library controls are interactive', async ({ page }) => {
  await page.goto('/')
  const surah = page.locator('select[aria-label="Surah selector"]')
  await expect(surah).toBeVisible()
  await expect(surah.locator('option')).toHaveCount(114, { timeout: 30000 })
  await surah.selectOption('2')
  await expect(surah).toHaveValue('2')

  await expect(page.getByText('Loading selected translations…', { exact: true })).toHaveCount(0, { timeout: 30000 })
  const languageSwitcher = page.locator('.language-switcher')
  await languageSwitcher.getByRole('button', { name: 'Ur', exact: true }).click()
  await expect(page.locator('.app-shell.theme-ur')).toBeVisible({ timeout: 10000 })
  await expect(page.locator('.app-shell.theme-ur .section-title').filter({ hasText: 'قرآن' })).toBeVisible({ timeout: 10000 })
  await languageSwitcher.getByRole('button', { name: 'Ar', exact: true }).click()
  await expect(page.locator('.app-shell.theme-ar')).toBeVisible({ timeout: 10000 })
  await expect(page.locator('.app-shell.theme-ar .section-title').filter({ hasText: 'القرآن' })).toBeVisible({ timeout: 10000 })
  await languageSwitcher.getByRole('button', { name: 'En', exact: true }).click()
  await expect(page.locator('.app-shell.theme-en')).toBeVisible({ timeout: 10000 })

  await page.getByRole('button', { name: 'Open translation library', exact: true }).click()
  await expect(page.getByText('Open translation sources', { exact: true })).toBeVisible()
})

test('background library and default logo controls are visible', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Background', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: /Masjid Interior/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /Desert Landscape/ })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Waraq logo', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'CloudTrans logo', exact: true })).toBeVisible()
  await expect(page.locator('.glass-logo')).toHaveCount(2)
})

test('export is initially available and does not start without user action', async ({ page }) => {
  await page.goto('/')
  const exportButton = page.getByRole('button', { name: 'Export video', exact: true })
  await expect(exportButton).toBeEnabled()
  await expect(page.getByText(/Exporting/)).toHaveCount(0)
})

test('Chromium can record a combined canvas video and Web Audio stream', async ({ page }) => {
  await page.goto('/')
  const result = await page.evaluate(async () => {
    const canvas = document.createElement('canvas')
    canvas.width = 320
    canvas.height = 180
    document.body.appendChild(canvas)
    const context = new AudioContext()
    const oscillator = context.createOscillator()
    const destination = context.createMediaStreamDestination()
    oscillator.frequency.value = 440
    oscillator.connect(destination)
    const videoStream = canvas.captureStream(10)
    const combined = new MediaStream([
      ...videoStream.getVideoTracks(),
      ...destination.stream.getAudioTracks().map(track => track.clone()),
    ])
    const audioTracks = combined.getAudioTracks().length
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' : 'video/webm'
    const chunks: BlobPart[] = []
    const blob = await new Promise<Blob>((resolve, reject) => {
      const recorder = new MediaRecorder(combined, { mimeType })
      recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data) }
      recorder.onerror = () => reject(new Error('MediaRecorder failed'))
      recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }))
      oscillator.start()
      void context.resume()
      recorder.start()
      window.setTimeout(() => recorder.stop(), 350)
    })
    oscillator.stop()
    combined.getTracks().forEach(track => track.stop())
    await context.close()
    canvas.remove()
    return { audioTracks, size: blob.size, type: blob.type }
  })

  expect(result.audioTracks).toBeGreaterThan(0)
  expect(result.size).toBeGreaterThan(0)
  expect(result.type).toContain('video/webm')
})
