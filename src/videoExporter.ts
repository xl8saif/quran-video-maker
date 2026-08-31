export interface VideoExportOptions {
  fps?: number
  mimeType?: string
  videoBitsPerSecond?: number
  audioBitsPerSecond?: number
}

export interface VideoExportResult { blob: Blob; mimeType: string; duration: number }

export function getSupportedMimeType(preferred?: string): string {
  const candidates = [preferred, 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].filter(Boolean) as string[]
  return candidates.find(type => MediaRecorder.isTypeSupported(type)) ?? ''
}

export async function recordCanvasWithAudio(
  canvas: HTMLCanvasElement,
  audio: HTMLAudioElement,
  renderFrame: (time: number) => void,
  options: VideoExportOptions = {},
): Promise<VideoExportResult> {
  if (typeof canvas.captureStream !== 'function') throw new Error('Canvas video capture is not supported in this browser.')
  if (typeof MediaRecorder === 'undefined') throw new Error('MediaRecorder is not supported in this browser.')

  const fps = options.fps ?? 30
  const videoStream = canvas.captureStream(fps)
  const audioContext = new AudioContext()
  const source = audioContext.createMediaElementSource(audio)
  const destination = audioContext.createMediaStreamDestination()
  source.connect(destination)
  source.connect(audioContext.destination)

  const stream = new MediaStream([...videoStream.getVideoTracks(), ...destination.stream.getAudioTracks()])
  const mimeType = getSupportedMimeType(options.mimeType)
  if (!mimeType) throw new Error('No supported WebM recording format was found.')

  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: options.videoBitsPerSecond ?? 8_000_000,
    audioBitsPerSecond: options.audioBitsPerSecond ?? 192_000,
  })

  const chunks: Blob[] = []
  recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data) }

  const duration = Number.isFinite(audio.duration) ? audio.duration : 0
  if (!duration) throw new Error('Recitation duration is unavailable.')

  return await new Promise((resolve, reject) => {
    recorder.onerror = () => reject(new Error('Video recording failed.'))
    recorder.onstop = () => {
      videoStream.getTracks().forEach(track => track.stop())
      destination.stream.getTracks().forEach(track => track.stop())
      source.disconnect()
      audioContext.close()
      resolve({ blob: new Blob(chunks, { type: mimeType }), mimeType, duration })
    }

    const startedAt = performance.now()
    recorder.start(1000)
    audio.currentTime = 0
    audio.play().catch(reject)

    const tick = () => {
      if (recorder.state !== 'recording') return
      const time = audio.currentTime
      renderFrame(time)
      if (time >= duration - 0.03 || performance.now() - startedAt >= duration * 1000 + 1000) {
        audio.pause()
        recorder.stop()
        return
      }
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
}

export function downloadVideo(blob: Blob, filename = 'quran-video.webm') {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
