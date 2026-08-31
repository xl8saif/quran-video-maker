export interface ExportFrameSource { canvas: HTMLCanvasElement }

export interface BrowserExportOptions {
  fps?: number
  mimeType?: string
  videoBitsPerSecond?: number
}

export function supportedExportMimeTypes(): string[] {
  if (typeof MediaRecorder === 'undefined') return []
  return ['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].filter(type => MediaRecorder.isTypeSupported(type))
}

export function createCanvasRecorder(canvas: HTMLCanvasElement, options: BrowserExportOptions = {}) {
  if (typeof MediaRecorder === 'undefined') throw new Error('This browser does not support MediaRecorder video export.')
  const fps = options.fps ?? 30
  const mimeType = options.mimeType ?? supportedExportMimeTypes()[0]
  if (!mimeType) throw new Error('No supported WebM video format was found in this browser.')
  const stream = canvas.captureStream(fps)
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: options.videoBitsPerSecond ?? 6_000_000 })
  const chunks: Blob[] = []
  recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data) }
  return {
    recorder,
    stream,
    start: () => recorder.start(250),
    stop: () => new Promise<Blob>((resolve, reject) => {
      recorder.onerror = () => reject(new Error('Video recording failed.'))
      recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }))
      recorder.stop()
    }),
  }
}

export function downloadExport(blob: Blob, filename = 'quran-video.webm') {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
