export interface CompositorOptions {
  width?: number
  height?: number
  backgroundOpacity?: number
  backgroundFit?: 'cover' | 'contain' | 'fill'
}

export interface CompositorAssets {
  background?: HTMLImageElement | HTMLVideoElement | null
  mushaf?: HTMLImageElement | null
  logo?: HTMLImageElement | null
}

export function createExportCanvas(options: CompositorOptions = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = options.width ?? 1080
  canvas.height = options.height ?? 1920
  return canvas
}

function drawMedia(ctx: CanvasRenderingContext2D, media: HTMLImageElement | HTMLVideoElement, canvas: HTMLCanvasElement, fit: 'cover'|'contain'|'fill') {
  const mw = media instanceof HTMLVideoElement ? media.videoWidth : media.naturalWidth
  const mh = media instanceof HTMLVideoElement ? media.videoHeight : media.naturalHeight
  if (!mw || !mh) return
  let w = canvas.width, h = canvas.height
  if (fit !== 'fill') {
    const scale = fit === 'cover' ? Math.max(canvas.width / mw, canvas.height / mh) : Math.min(canvas.width / mw, canvas.height / mh)
    w = mw * scale; h = mh * scale
  }
  ctx.drawImage(media, (canvas.width-w)/2, (canvas.height-h)/2, w, h)
}

export function renderComposition(canvas: HTMLCanvasElement, assets: CompositorAssets, options: CompositorOptions = {}) {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context is unavailable.')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#111'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  if (assets.background) {
    ctx.save(); ctx.globalAlpha = Math.max(0, Math.min(1, options.backgroundOpacity ?? 0.35))
    drawMedia(ctx, assets.background, canvas, options.backgroundFit ?? 'cover'); ctx.restore()
  }
  if (assets.mushaf) {
    const margin = canvas.width * .08
    const w = canvas.width - margin * 2
    const h = w * assets.mushaf.naturalHeight / assets.mushaf.naturalWidth
    ctx.drawImage(assets.mushaf, margin, (canvas.height-h)/2, w, h)
  }
  if (assets.logo) {
    const maxW = canvas.width * .22
    const scale = Math.min(1, maxW / assets.logo.naturalWidth)
    const w = assets.logo.naturalWidth * scale, h = assets.logo.naturalHeight * scale
    ctx.drawImage(assets.logo, canvas.width-w-40, 40, w, h)
  }
  return canvas
}
