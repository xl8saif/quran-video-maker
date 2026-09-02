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

function isRemoteHttpUrl(url: string) {
  return /^https?:\/\//i.test(url)
}

function loadImage(url: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(url)
  if (cached) return Promise.resolve(cached)
  return new Promise((resolve, reject) => {
    const image = new Image()
    if (isRemoteHttpUrl(url) && new URL(url, window.location.href).origin !== window.location.origin) {
      image.crossOrigin = 'anonymous'
    }
    image.onload = () => { imageCache.set(url, image); resolve(image) }
    image.onerror = () => reject(new Error(`Unable to load image: ${url}`))
    image.src = url
  })
}

function drawFit(ctx: CanvasRenderingContext2D, source: CanvasImageSource & { width: number; height: number }, width: number, height: number, fit: 'cover' | 'contain' | 'fill', x: number, y: number) {
  if (!source.width || !source.height) return
  if (fit === 'fill') { ctx.drawImage(source, 0, 0, width, height); return }
  const scale = fit === 'contain' ? Math.min(width / source.width, height / source.height) : Math.max(width / source.width, height / source.height)
  const sw = source.width * scale, sh = source.height * scale
  ctx.drawImage(source, (width - sw) * x / 100, (height - sh) * y / 100, sw, sh)
}

export function isRtlLanguage(language: string) {
  return /^(ar|ur|fa|ps|ku)([-_]|$)/i.test(language.trim())
}

export function translationFont(language: string, size: number) {
  const normalized = language.trim().toLowerCase()
  if (/^ur([-_]|$)/.test(normalized)) return `${size}px "Noto Nastaliq Urdu", "Noto Naskh Arabic", Amiri, serif`
  if (isRtlLanguage(normalized)) return `${size}px "Noto Naskh Arabic", Amiri, serif`
  return `${size}px system-ui, sans-serif`
}

export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.trim().split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let line = ''

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (!line || ctx.measureText(candidate).width <= maxWidth) {
      line = candidate
      continue
    }
    lines.push(line)
    line = word
  }

  if (line) lines.push(line)
  return lines
}

export async function createExportCompositor(options: ExportCompositorOptions) {
  const { canvas } = options
  let backgroundImage: HTMLImageElement | null = null
  let backgroundVideo: HTMLVideoElement | null = null
  const logo = options.logo?.url ? await loadImage(options.logo.url).catch(() => null) : null

  if (options.background?.url) {
    if (options.background.kind === 'video') {
      backgroundVideo = document.createElement('video')
      if (isRemoteHttpUrl(options.background.url) && new URL(options.background.url, window.location.href).origin !== window.location.origin) {
        backgroundVideo.crossOrigin = 'anonymous'
      }
      backgroundVideo.src = options.background.url
      backgroundVideo.muted = true
      backgroundVideo.loop = true
      backgroundVideo.playsInline = true
      backgroundVideo.preload = 'auto'
      void backgroundVideo.play().catch(() => undefined)
    } else {
      backgroundImage = await loadImage(options.background.url).catch(() => null)
    }
  }

  const draw = () => {
    const ctx = canvas.getContext('2d'); if (!ctx) return
    const width = canvas.width || options.width
    const height = canvas.height || options.height
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = '#f7f1e4'; ctx.fillRect(0, 0, width, height)
    const background = options.background
    if (backgroundImage && background) { ctx.globalAlpha = background.opacity ?? 0.35; drawFit(ctx, backgroundImage, width, height, background.fit || 'cover', background.x ?? 50, background.y ?? 50); ctx.globalAlpha = 1 }
    else if (backgroundVideo && background && backgroundVideo.readyState >= 2) { ctx.globalAlpha = background.opacity ?? 0.35; drawFit(ctx, backgroundVideo, width, height, background.fit || 'cover', background.x ?? 50, background.y ?? 50); ctx.globalAlpha = 1 }
    options.drawMushaf(ctx, width, height)

    if (options.translations?.length) {
      const blockWidth = width * 0.9
      const baseSize = Math.max(20, Math.min(36, width / 55))
      const labelSize = Math.max(14, Math.min(22, width / 85))
      const bottom = height - 58
      const gap = Math.max(14, height / 180)
      let cursorY = bottom

      for (let index = options.translations.length - 1; index >= 0; index -= 1) {
        const translation = options.translations[index]
        const rtl = isRtlLanguage(translation.language)
        const size = rtl && /^ur([-_]|$)/i.test(translation.language.trim()) ? baseSize * 0.9 : baseSize
        ctx.direction = rtl ? 'rtl' : 'ltr'
        ctx.textAlign = 'center'
        ctx.fillStyle = '#40372b'
        ctx.font = `600 ${labelSize}px system-ui, sans-serif`
        ctx.fillText(translation.language.toUpperCase(), width / 2, cursorY)
        cursorY -= labelSize + 8

        ctx.font = translationFont(translation.language, size)
        const lines = wrapText(ctx, translation.text, blockWidth)
        const lineHeight = size * 1.45
        for (let lineIndex = lines.length - 1; lineIndex >= 0; lineIndex -= 1) {
          ctx.fillText(lines[lineIndex], width / 2, cursorY)
          cursorY -= lineHeight
        }
        cursorY -= gap
      }

      ctx.direction = 'ltr'
      ctx.textAlign = 'start'
      ctx.font = '10px sans-serif'
    }

    if (logo) { const size = width * ((options.logo?.size ?? 18) / 100); const x = width * ((options.logo?.x ?? 88) / 100); const y = height * ((options.logo?.y ?? 90) / 100); ctx.globalAlpha = (options.logo?.opacity ?? 100) / 100; ctx.drawImage(logo, x - size / 2, y - size / 2, size, size); ctx.globalAlpha = 1 }
  }

  let animationFrame = 0
  const animate = () => { draw(); animationFrame = window.requestAnimationFrame(animate) }
  animate()

  return { draw, destroy: () => { window.cancelAnimationFrame(animationFrame); if (backgroundVideo) { backgroundVideo.pause(); backgroundVideo.removeAttribute('src'); backgroundVideo.load() } } }
}
