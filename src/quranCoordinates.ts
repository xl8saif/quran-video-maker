export type MushafStyle = 'hafs-naskh' | 'indo-pak-muhammadi'

export interface WordCoordinate {
  id: string
  text: string
  ayah: number
  line: number
  x: number
  y: number
  width: number
  height: number
  start?: number
  end?: number
}

export interface QuranLine {
  number: number
  y: number
  height: number
  words: WordCoordinate[]
}

export interface QuranPage {
  page: number
  style: MushafStyle
  width: number
  height: number
  lines: QuranLine[]
}

export function normalizeWordCoordinate(word: WordCoordinate, sourceWidth: number, sourceHeight: number, targetWidth: number, targetHeight: number): WordCoordinate {
  const sx = targetWidth / sourceWidth
  const sy = targetHeight / sourceHeight
  return { ...word, x: word.x * sx, y: word.y * sy, width: word.width * sx, height: word.height * sy }
}

export function findWordAtTime(page: QuranPage, time: number): WordCoordinate | undefined {
  for (const line of page.lines) {
    const word = line.words.find(w => w.start !== undefined && w.end !== undefined && time >= w.start && time < w.end)
    if (word) return word
  }
  return undefined
}

export function findLineForWord(page: QuranPage, wordId: string): QuranLine | undefined {
  return page.lines.find(line => line.words.some(word => word.id === wordId))
}
