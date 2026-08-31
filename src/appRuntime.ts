import type { ExportPanelOptions, ExportPanelState } from './exportPanel'
import { createCanvasAudioStream } from './streamExporter'

export interface AppRuntimeMedia { canvas: HTMLCanvasElement; audio: HTMLMediaElement | null }
export interface AppRuntime {
  state: ExportPanelState
  options: ExportPanelOptions
  setMedia: (media: AppRuntimeMedia | null) => void
  startExport: (options: ExportPanelOptions) => void
  cancelExport: () => void
  subscribe: (listener: (state: ExportPanelState, options: ExportPanelOptions) => void) => () => void
  destroy: () => void
}

export function createAppRuntime(): AppRuntime {
  let options: ExportPanelOptions = { resolution: '1080p', fps: 30, mushafStyle: 'hafs-naskh', translationLanguage: 'none', filename: 'quran-video.webm' }
  let state: ExportPanelState = { status: 'idle', progress: 0, elapsed: 0, duration: 0 }
  const listeners = new Set<(state: ExportPanelState, options: ExportPanelOptions) => void>()
  let timer: number | undefined, stopTimeout: number | undefined, recorder: MediaRecorder | undefined, stream: MediaStream | undefined
  let media: AppRuntimeMedia | null = null, chunks: BlobPart[] = [], runId = 0
  const emit = () => listeners.forEach(listener => listener(state, options))
  const stopTimer = () => { if (timer !== undefined) window.clearInterval(timer); timer = undefined }
  const stopTimeoutTimer = () => { if (stopTimeout !== undefined) window.clearTimeout(stopTimeout); stopTimeout = undefined }
  const cleanupStream = () => { stream?.getTracks().forEach(track => track.stop()); stream = undefined }
  const setMedia = (next: AppRuntimeMedia | null) => { media = next }

  const startExport = (nextOptions: ExportPanelOptions) => {
    stopTimer(); stopTimeoutTimer(); cleanupStream()
    const thisRun = ++runId
    if (recorder && recorder.state !== 'inactive') { recorder.onstop = null; recorder.stop() }
    recorder = undefined; options = { ...nextOptions }
    if (!media) { state = { status: 'error', progress: 0, elapsed: 0, duration: 0, error: 'Export canvas is not available.' }; emit(); return }
    const sizes: Record<ExportPanelOptions['resolution'], [number, number]> = { '720p': [1280, 720], '1080p': [1920, 1080], '1440p': [2560, 1440], '2160p': [3840, 2160] }
    const [width, height] = sizes[options.resolution]
    media.canvas.width = width; media.canvas.height = height
    stream = createCanvasAudioStream(media.canvas, media.audio, options.fps)
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' : 'video/webm'
    recorder = new MediaRecorder(stream, { mimeType }); chunks = []
    const duration = media.audio?.duration && Number.isFinite(media.audio.duration) && media.audio.duration > 0 ? media.audio.duration * 1000 : 30000
    const started = performance.now()
    recorder.ondataavailable = event => { if (thisRun === runId && event.data.size) chunks.push(event.data) }
    recorder.onerror = () => { if (thisRun !== runId) return; stopTimer(); stopTimeoutTimer(); state = { ...state, status: 'error', error: recorder?.error?.message ?? 'MediaRecorder failed.' }; cleanupStream(); recorder = undefined; emit() }
    recorder.onstop = () => {
      const current = thisRun === runId
      stopTimer(); stopTimeoutTimer(); media?.audio?.pause(); cleanupStream()
      if (!current) { if (recorder?.state === 'inactive') recorder = undefined; return }
      const blobUrl = URL.createObjectURL(new Blob(chunks, { type: mimeType }))
      state = { ...state, status: 'ready', progress: 100, elapsed: duration, duration, blobUrl }
      recorder = undefined; emit()
    }
    state = { status: 'recording', progress: 0, elapsed: 0, duration }; emit()
    recorder.start(250)
    if (media.audio) { media.audio.currentTime = 0; media.audio.playbackRate = 1; void media.audio.play() }
    timer = window.setInterval(() => { if (thisRun !== runId) return; const elapsed = Math.min(duration, performance.now() - started); state = { ...state, elapsed, progress: duration ? elapsed / duration * 100 : 0 }; emit() }, 100)
    stopTimeout = window.setTimeout(() => { if (thisRun === runId && recorder?.state !== 'inactive') { media?.audio?.pause(); recorder?.stop() } }, duration)
  }

  const cancelExport = () => {
    const wasActive = recorder?.state !== 'inactive'
    ++runId; stopTimer(); stopTimeoutTimer(); media?.audio?.pause()
    state = { ...state, status: 'cancelled' }; emit()
    if (wasActive) recorder?.stop()
    else cleanupStream()
  }

  return {
    get state() { return state }, get options() { return options }, setMedia, startExport, cancelExport,
    subscribe(listener) { listeners.add(listener); listener(state, options); return () => listeners.delete(listener) },
    destroy() { ++runId; stopTimer(); stopTimeoutTimer(); media?.audio?.pause(); if (recorder && recorder.state !== 'inactive') recorder.stop(); cleanupStream(); recorder = undefined; listeners.clear(); media = null }
  }
}
