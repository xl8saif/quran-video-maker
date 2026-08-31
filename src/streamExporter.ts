export interface StreamExportOptions {
  durationMs: number
  mimeType?: string
  frameRate?: number
}

export interface StreamExportResult {
  blob: Blob
  mimeType: string
}

export interface CanvasAudioStream {
  stream: MediaStream
  dispose: () => void
}

const audioSources = new WeakMap<HTMLMediaElement, { context: AudioContext; source: MediaElementAudioSourceNode; destination: MediaStreamAudioDestinationNode }>()

export function createCanvasAudioStream(canvas: HTMLCanvasElement, audio: HTMLMediaElement | null, frameRate = 30): MediaStream {
  return createCanvasAudioStreamController(canvas, audio, frameRate).stream
}

export function createCanvasAudioStreamController(canvas: HTMLCanvasElement, audio: HTMLMediaElement | null, frameRate = 30): CanvasAudioStream {
  const videoStream = canvas.captureStream(frameRate)
  if (!audio) return { stream: videoStream, dispose: () => videoStream.getTracks().forEach(track => track.stop()) }

  const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextCtor) return { stream: videoStream, dispose: () => videoStream.getTracks().forEach(track => track.stop()) }

  let graph = audioSources.get(audio)
  if (!graph) {
    const context = new AudioContextCtor()
    const source = context.createMediaElementSource(audio)
    const destination = context.createMediaStreamDestination()
    source.connect(destination)
    source.connect(context.destination)
    graph = { context, source, destination }
    audioSources.set(audio, graph)
  }
  graph.destination.stream.getAudioTracks().forEach(track => videoStream.addTrack(track))
  return {
    stream: videoStream,
    dispose: () => videoStream.getVideoTracks().forEach(track => track.stop()),
  }
}

export async function recordMediaStream(stream: MediaStream, options: StreamExportOptions, onProgress?: (progress: number) => void): Promise<StreamExportResult> {
  const mimeType = options.mimeType ?? (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' : 'video/webm')
  const recorder = new MediaRecorder(stream, { mimeType })
  const chunks: BlobPart[] = []
  return new Promise((resolve, reject) => {
    const started = performance.now()
    const timer = window.setInterval(() => onProgress?.(Math.min(1, (performance.now() - started) / options.durationMs)), 100)
    recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data) }
    recorder.onerror = () => { window.clearInterval(timer); reject(recorder.error ?? new Error('MediaRecorder failed.')) }
    recorder.onstop = () => { window.clearInterval(timer); onProgress?.(1); resolve({ blob: new Blob(chunks, { type: mimeType }), mimeType }) }
    recorder.start(250)
    window.setTimeout(() => { if (recorder.state !== 'inactive') recorder.stop() }, options.durationMs)
  })
}
