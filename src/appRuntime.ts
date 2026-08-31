import type { ExportPanelOptions, ExportPanelState } from './exportPanel'
import { createCanvasAudioStream } from './streamExporter'

export interface AppRuntimeMedia {
  canvas: HTMLCanvasElement
  audio: HTMLMediaElement | null
}

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
  let timer: number | undefined
  let recorder: MediaRecorder | undefined
  let stream: MediaStream | undefined
  let media: AppRuntimeMedia | null = null
  let chunks: BlobPart[] = []

  const emit = () => listeners.forEach(listener => listener(state, options))
  const stopTimer = () => { if (timer !== undefined) window.clearInterval(timer); timer = undefined }
  const setMedia = (next: AppRuntimeMedia | null) => { media = next }

  const startExport = (nextOptions: ExportPanelOptions) => {
    stopTimer()
    if (recorder && recorder.state !== 'inactive') recorder.stop()
    stream?.getTracks().forEach(track => track.stop())
    options = { ...nextOptions }
    if (!media) {
      state = { status: 'error', progress: 0, elapsed: 0, duration: 0, error: 'Export canvas is not available.' }
      emit()
      return
    }

    const sizes: Record<ExportPanelOptions['resolution'], [number, number]> = { '720p': [1280, 720], '1080p': [1920, 1080], '1440p': [2560, 1440], '2160p': [3840, 2160] }
    const [width, height] = sizes[options.resolution]
    media.canvas.width = width
    media.canvas.height = height
    stream = createCanvasAudioStream(media.canvas, media.audio, options.fps)
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' : 'video/webm'
    recorder = new MediaRecorder(stream, { mimeType })
    chunks = []
    const duration = media.audio?.duration && Number.isFinite(media.audio.duration) ? media.audio.duration * 1000 : 30000
    const started = performance.now()

    recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data) }
    recorder.onerror = () => { stopTimer(); state = { ...state, status: 'error', error: recorder?.error?.message ?? 'MediaRecorder failed.' }; emit() }
    recorder.onstop = () => {
      stopTimer()
      if (state.status === 'cancelled') return
      const blobUrl = URL.createObjectURL(new Blob(chunks, { type: mimeType }))
      state = { ...state, status: 'ready', progress: 100, elapsed: duration, duration, blobUrl }
      stream?.getTracks().forEach(track => track.stop())
      stream = undefined
      recorder = undefined
      emit()
    }

    state = { status: 'recording', progress: 0, elapsed: 0, duration }
    emit()
    recorder.start(250)
    if (media.audio) { media.audio.currentTime = 0; void media.audio.play() }
    timer = window.setInterval(() => {
      const elapsed = Math.min(duration, performance.now() - started)
      state = { ...state, elapsed, progress: duration ? elapsed / duration * 100 : 0 }
      emit()
    }, 100)
    window.setTimeout(() => { if (recorder?.state !== 'inactive') recorder.stop(); media?.audio?.pause() }, duration)
  }

  const cancelExport = () => {
    stopTimer()
    media?.audio?.pause()
    if (recorder && recorder.state !== 'inactive') recorder.stop()
    stream?.getTracks().forEach(track => track.stop())
    stream = undefined
    recorder = undefined
    state = { ...state, status: 'cancelled' }
    emit()
  }

  return { get state() { return state }, get options() { return options }, setMedia, startExport, cancelExport, subscribe(listener) { listeners.add(listener); listener(state, options); return () => listeners.delete(listener) }, destroy() { stopTimer(); if (recorder && recorder.state !== 'inactive') recorder.stop(); stream?.getTracks().forEach(track => track.stop()); listeners.clear(); media = null } }
}
