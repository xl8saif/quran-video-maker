import type { QuranPage, WordCoordinate } from './quranCoordinates'

export type TranslationLanguage = 'ar' | 'en' | 'ur'

export interface TranslationVerse {
  surah: number
  ayah: number
  text: string
}

export interface TranslationRenderOptions {
  language: TranslationLanguage
  x?: number
  y?: number
  width?: number
  fontSize?: number
  lineHeight?: number
  color?: string
  background?: string
  direction?: 'rtl' | 'ltr'
  align?: CanvasTextAlign
}

export function getVerseTranslation(verses: TranslationVerse[], surah: number, ayah: number) {
  return verses.find(v => v.surah === surah && v.ayah === ayah)?.text ?? ''
}

export function drawTranslation(ctx: CanvasRenderingContext2D, text: string, options: TranslationRenderOptions) {
  if (!text) return
  const canvas = ctx.canvas
  const x = options.x ?? canvas.width / 2
  const y = options.y ?? canvas.height * 0.82
  const width = options.width ?? canvas.width * 0.84
  const fontSize = options.fontSize ?? 34
  const lineHeight = options.lineHeight ?? fontSize * 1.55
  const direction = options.direction ?? (options.language === 'en' ? 'ltr' : 'rtl')

  ctx.save()
  ctx.direction = direction
  ctx.textAlign = options.align ?? 'center'
  ctx.textBaseline = 'top'
  ctx.font = `${fontSize}px sans-serif`

  if (options.background) {
    ctx.fillStyle = options.background
    ctx.fillRect(x - width / 2, y - 12, width, lineHeight * 3)
  }

  ctx.fillStyle = options.color ?? '#fff'
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > width && line) {
      lines.push(line)
      line = word
    } else line = test
  }
  if (line) lines.push(line)

  lines.slice(0, 4).forEach((value, index) => ctx.fillText(value, x, y + index * lineHeight))
  ctx.restore()
}

export function getActiveAyah(page: QuranPage | undefined, activeWordId?: string): number | undefined {
  if (!page || !activeWordId) return undefined
  for (const line of page.lines) {
    const word = line.words.find((item: WordCoordinate) => item.id === activeWordId)
    if (word) return word.ayah
  }
  return undefined
}
