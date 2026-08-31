export interface StreamExportOptions {
  durationMs: number
  mimeType?: string
  frameRate?: number
}

export interface StreamExportResult {
  blob: Blob
  mimeType: string
}

export function createCanvasAudioStream(
  canvas: HTMLCanvasElement,
  audio: HTMLMediaElement | null,
  frameRate = 30,
): MediaStream {
  const videoStream = canvas.captureStream(frameRate)
  if (!audio) return videoStream

  const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextCtor) return videoStream

  const context = new AudioContextCtor()
  const source = context.createMediaElementSource(audio)
  const destination = context.createMediaStreamDestination()
  source.connect(destination)
  source.connect(context.destination)

  destination.stream.getAudioTracks().forEach(track => videoStream.addTrack(track))
  return videoStream
}

export async function recordMediaStream(
  stream: MediaStream,
  options: StreamExportOptions,
  onProgress?: (progress: number) => void,
): Promise<StreamExportResult> {
  const mimeType = options.mimeType ?? (
    MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? 'video/webm;codecs=vp9,opus'
      : 'video/webm'
  )
  const recorder = new MediaRecorder(stream, { mimeType })
  const chunks: BlobPart[] = []

  return new Promise((resolve, reject) => {
    const started = performance.now()
    const timer = window.setInterval(() => {
      const progress = Math.min(1, (performance.now() - started) / options.durationMs)
      onProgress?.(progress)
    }, 100)

    recorder.ondataavailable = event => {
      if (event.data.size) chunks.push(event.data)
    }
    recorder.onerror = () => {
      window.clearInterval(timer)
      reject(recorder.error ?? new Error('MediaRecorder failed.'))
    }
    recorder.onstop = () => {
      window.clearInterval(timer)
      onProgress?.(1)
      resolve({ blob: new Blob(chunks, { type: mimeType }), mimeType })
    }

    recorder.start(250)
    window.setTimeout(() => {
      if (recorder.state !== 'inactive') recorder.stop()
    }, options.durationMs)
  })
}
