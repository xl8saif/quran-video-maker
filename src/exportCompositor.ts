export interface ExportCompositorOptions {
  canvas: HTMLCanvasElement
  width: number
  height: number
  background?: { url?: string; kind?: 'image' | 'video' | 'upload'; opacity?: number; fit?: 'cover' | 'contain' | 'fill'; x?: number; y?: number }
  logo?: { url?: string; opacity?: number; size?: number; x?: number; y?: number }
  translations?: Array<{ language: string; text: string }>
  drawMushaf: (ctx: CanvasRenderingContext2D, width: number, height: number) => void
}

const imageCache = new Map<string, HTMLImageElement>()

function loadImage(url: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(url)
  if (cached) return Promise.resolve(cached)
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => { imageCache.set(url, image); resolve(image) }
    image.onerror = () => reject(new Error(`Unable to load image: ${url}`))
    image.src = url
  })
}

function drawFit(ctx: CanvasRenderingContext2D, source: CanvasImageSource & { width: number; height: number }, width: number, height: number, fit: 'cover' | 'contain' | 'fill', x: number, y: number) {
  if (fit === 'fill') { ctx.drawImage(source, 0, 0, width, height); return }
  const scale = fit === 'contain' ? Math.min(width / source.width, height / source.height) : Math.max(width / source.width, height / source.height)
  const sw = source.width * scale, sh = source.height * scale
  ctx.drawImage(source, (width - sw) * x / 100, (height - sh) * y / 100, sw, sh)
}

export async function createExportCompositor(options: ExportCompositorOptions) {
  const { canvas, width, height } = options
  canvas.width = width; canvas.height = height
  const background = options.background?.url && options.background.kind !== 'video' ? await loadImage(options.background.url).catch(() => null) : null
  const logo = options.logo?.url ? await loadImage(options.logo.url).catch(() => null) : null
  const draw = () => {
    const ctx = canvas.getContext('2d'); if (!ctx) return
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = '#f7f1e4'; ctx.fillRect(0, 0, width, height)
    if (background) { ctx.globalAlpha = options.background?.opacity ?? 0.35; drawFit(ctx, background, width, height, options.background?.fit || 'cover', options.background?.x ?? 50, options.background?.y ?? 50); ctx.globalAlpha = 1 }
    options.drawMushaf(ctx, width, height)
    if (options.translations?.length) { ctx.font = `${Math.max(20, width / 55)}px sans-serif`; ctx.textAlign = 'center'; ctx.direction = 'ltr'; options.translations.forEach((translation, index) => { ctx.fillStyle = '#40372b'; ctx.fillText(`${translation.language.toUpperCase()}: ${translation.text}`, width / 2, height - 70 - index * 38) }) }
    if (logo) { const size = width * ((options.logo?.size ?? 18) / 100); const x = width * ((options.logo?.x ?? 88) / 100); const y = height * ((options.logo?.y ?? 90) / 100); ctx.globalAlpha = (options.logo?.opacity ?? 100) / 100; ctx.drawImage(logo, x - size / 2, y - size / 2, size, size); ctx.globalAlpha = 1 }
  }
  draw()
  return { draw }
}
