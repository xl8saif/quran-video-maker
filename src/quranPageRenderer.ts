import type { QuranPage, QuranLine, WordCoordinate } from './quranCoordinates'

export interface PageRenderOptions {
  lineHighlight?: string
  lineAlpha?: number
  wordHighlight?: string
  wordAlpha?: number
  showLineHighlight?: boolean
  showWordHighlight?: boolean
}

export function getPageLines(page: QuranPage | undefined): QuranLine[] {
  return page?.lines ?? []
}

export function getPageWords(page: QuranPage | undefined): WordCoordinate[] {
  return getPageLines(page).flatMap(line => line.words)
}

export function renderQuranPage(ctx: CanvasRenderingContext2D, pageImage: HTMLImageElement, page: QuranPage | undefined, activeWordId?: string, options: PageRenderOptions = {}) {
  if (!pageImage.naturalWidth || !pageImage.naturalHeight) return
  const canvas = ctx.canvas
  ctx.drawImage(pageImage, 0, 0, canvas.width, canvas.height)
  if (!page) return

  const word = getPageWords(page).find(item => item.id === activeWordId)
  const line = word ? page.lines.find(item => item.number === word.line) : undefined

  if (options.showLineHighlight !== false && line) {
    ctx.save()
    ctx.globalAlpha = options.lineAlpha ?? 0.22
    ctx.fillStyle = options.lineHighlight ?? '#b7d98a'
    ctx.fillRect(0, line.y, canvas.width, line.height)
    ctx.restore()
  }

  if (options.showWordHighlight !== false && word) {
    ctx.save()
    ctx.globalAlpha = options.wordAlpha ?? 0.5
    ctx.fillStyle = options.wordHighlight ?? '#d9e85b'
    const pad = 4
    ctx.fillRect(word.x - pad, word.y - pad, word.width + pad * 2, word.height + pad * 2)
    ctx.restore()
  }
}
