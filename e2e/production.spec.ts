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
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? 'video/webm;codecs=vp9,opus'
      : 'video/webm'
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
