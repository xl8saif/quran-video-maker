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

type AudioGraph = {
  context: AudioContext
  source: MediaElementAudioSourceNode
  destination: MediaStreamAudioDestinationNode
}

const audioSources = new WeakMap<HTMLMediaElement, AudioGraph>()

type CapturableMediaElement = HTMLMediaElement & {
  captureStream?: () => MediaStream
}

function getAudioGraph(audio: HTMLMediaElement): AudioGraph | null {
  const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextCtor) return null
  let graph = audioSources.get(audio)
  if (!graph) {
    try {
      const context = new AudioContextCtor()
      const source = context.createMediaElementSource(audio)
      const destination = context.createMediaStreamDestination()
      source.connect(destination)
      source.connect(context.destination)
      graph = { context, source, destination }
      audioSources.set(audio, graph)
    } catch {
      return null
    }
  }
  if (graph.context.state === 'suspended') void graph.context.resume()
  return graph
}

function captureAudioTracks(audio: HTMLMediaElement): { stream: MediaStream | null; tracks: MediaStreamTrack[] } {
  const capturable = audio as CapturableMediaElement
  try {
    const captured = capturable.captureStream?.() ?? null
    return { stream: captured, tracks: captured?.getAudioTracks() ?? [] }
  } catch {
    return { stream: null, tracks: [] }
  }
}

export function createCanvasAudioStream(canvas: HTMLCanvasElement, audio: HTMLMediaElement | null, frameRate = 30): MediaStream {
  return createCanvasAudioStreamController(canvas, audio, frameRate).stream
}

export function createCanvasAudioStreamController(canvas: HTMLCanvasElement, audio: HTMLMediaElement | null, frameRate = 30): CanvasAudioStream {
  const videoStream = canvas.captureStream(frameRate)
  let capturedAudioStream: MediaStream | null = null

  if (audio) {
    // Prefer the browser's native media-element capture. This preserves the exact
    // audio element being exported and is more reliable than routing a media
    // element through a Web Audio graph in headless Chromium.
    const nativeCapture = captureAudioTracks(audio)
    if (nativeCapture.tracks.length) {
      capturedAudioStream = nativeCapture.stream
      nativeCapture.tracks.forEach(track => videoStream.addTrack(track.clone()))
    } else {
      const graph = getAudioGraph(audio)
      const graphTracks = graph?.destination.stream.getAudioTracks() ?? []
      graphTracks.forEach(track => videoStream.addTrack(track.clone()))
    }
  }

  return {
    stream: videoStream,
    dispose: () => {
      videoStream.getTracks().forEach(track => track.stop())
      capturedAudioStream?.getTracks().forEach(track => track.stop())
    },
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
    recorder.onerror = event => { window.clearInterval(timer); reject(event.error ?? new Error('MediaRecorder failed.')) }
    recorder.onstop = () => { window.clearInterval(timer); onProgress?.(1); resolve({ blob: new Blob(chunks, { type: mimeType }), mimeType }) }
    recorder.start(250)
    window.setTimeout(() => { if (recorder.state !== 'inactive') recorder.stop() }, options.durationMs)
  })
}
