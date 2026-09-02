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

test('real app export produces a downloadable WebM with audio and valid timing', async ({ page }) => {
  await page.goto('/')

  const audioDataUrl = await page.evaluate(() => {
    const sampleRate = 8000
    const durationSeconds = 1
    const samples = sampleRate * durationSeconds
    const buffer = new ArrayBuffer(44 + samples * 2)
    const view = new DataView(buffer)
    const write = (offset: number, value: string) => [...value].forEach((char, index) => view.setUint8(offset + index, char.charCodeAt(0)))
    write(0, 'RIFF')
    view.setUint32(4, 36 + samples * 2, true)
    write(8, 'WAVE')
    write(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, 1, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * 2, true)
    view.setUint16(32, 2, true)
    view.setUint16(34, 16, true)
    write(36, 'data')
    view.setUint32(40, samples * 2, true)
    for (let i = 0; i < samples; i += 1) {
      const sample = Math.round(Math.sin((i / sampleRate) * Math.PI * 2 * 440) * 8000)
      view.setInt16(44 + i * 2, sample, true)
    }
    let binary = ''
    const bytes = new Uint8Array(buffer)
    for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i])
    return `data:audio/wav;base64,${btoa(binary)}`
  })

  await page.locator('audio').evaluate((audio, src) => {
    const element = audio as HTMLAudioElement
    element.src = src
    element.load()
  }, audioDataUrl)
  await page.waitForFunction(() => {
    const audio = document.querySelector('audio') as HTMLAudioElement | null
    return Boolean(audio && Number.isFinite(audio.duration) && audio.duration > 0)
  })

  await page.getByRole('button', { name: 'Export video', exact: true }).click()
  await expect(page.getByText(/Exporting/)).toBeVisible({ timeout: 5000 })

  const exportLink = page.locator('a[href^="blob:"]').first()
  await expect(exportLink).toBeVisible({ timeout: 10000 })
  const href = await exportLink.getAttribute('href')
  expect(href).toMatch(/^blob:/)

  const exported = await page.evaluate(async (url) => {
    const response = await fetch(url)
    const blob = await response.blob()
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true
    const objectUrl = URL.createObjectURL(blob)
    video.src = objectUrl
    const metadata = await new Promise<{ duration: number; width: number; height: number }>((resolve, reject) => {
      video.onloadedmetadata = () => resolve({ duration: video.duration, width: video.videoWidth, height: video.videoHeight })
      video.onerror = () => reject(new Error('Exported WebM could not be decoded by Chromium'))
    })
    await video.play()
    const stream = video.captureStream()
    await new Promise(resolve => window.setTimeout(resolve, 100))
    const tracks = { video: stream.getVideoTracks().length, audio: stream.getAudioTracks().length }
    stream.getTracks().forEach(track => track.stop())
    video.pause()
    video.remove()
    URL.revokeObjectURL(objectUrl)
    return { size: blob.size, type: blob.type, ...metadata, ...tracks }
  }, href)

  expect(exported.size).toBeGreaterThan(1000)
  expect(exported.type).toContain('video/webm')
  expect(exported.duration).toBeGreaterThan(0.5)
  expect(exported.duration).toBeLessThan(2)
  expect(exported.width).toBeGreaterThan(0)
  expect(exported.height).toBeGreaterThan(0)
  expect(exported.video).toBeGreaterThan(0)
  expect(exported.audio).toBeGreaterThan(0)
})
