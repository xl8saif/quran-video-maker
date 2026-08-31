import { createCanvasAudioStream } from './streamExporter'
import { createExportController, type ExportProgress } from './exportController'

export interface ExportSessionOptions {
  canvas: HTMLCanvasElement
  audio: HTMLMediaElement | null
  duration: number
  frameRate?: number
  timeslice?: number
  onProgress?: (progress: ExportProgress) => void
}

export interface ExportSession {
  start: () => void
  stop: () => void
  cancel: () => void
}

export function createExportSession(options: ExportSessionOptions): ExportSession {
  const stream = createCanvasAudioStream(options.canvas, options.audio, options.frameRate ?? 30)
  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
    ? 'video/webm;codecs=vp9,opus'
    : 'video/webm'
  const recorder = new MediaRecorder(stream, { mimeType })
  const controller = createExportController({
    recorder,
    duration: options.duration,
    timeslice: options.timeslice,
    onProgress: options.onProgress,
  })

  return {
    start: () => {
      if (options.audio) {
        options.audio.currentTime = 0
        void options.audio.play()
      }
      controller.start()
    },
    stop: () => {
      controller.stop()
      options.audio?.pause()
      stream.getTracks().forEach(track => track.stop())
    },
    cancel: () => {
      controller.cancel()
      options.audio?.pause()
      stream.getTracks().forEach(track => track.stop())
    },
  }
}
