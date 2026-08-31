import type { QuranAyah, QuranWord } from './quranData'
import { groupWordsByLine } from './mushafRenderer'

export type MushafPage = {
  page: number
  lines: ReturnType<typeof groupWordsByLine>
  verseKeys: string[]
}

export type MushafEngineConfig = {
  mushafId: number
  lineCount: 15 | 16
}

export const MUSHAF_ENGINE_CONFIG: Record<string, MushafEngineConfig> = {
  'hafs-arabic-naskh': { mushafId: 4, lineCount: 15 },
  'indo-pak-muhammadi': { mushafId: 6, lineCount: 15 },
}

/** Build a page model from verified word data. No Quran text is generated or modified here. */
export function buildMushafPage(ayahs: QuranAyah[], page: number): MushafPage {
  const words = ayahs.flatMap((ayah) => ayah.words.filter((word) => word.page === page))
  const lines = groupWordsByLine(words, page)
  return { page, lines, verseKeys: [...new Set(words.map((word) => word.verseKey))] }
}

export function getActivePage(ayahs: QuranAyah[], time: number): number | null {
  for (const ayah of ayahs) {
    const word = ayah.words.find((item) => time >= item.start && time < item.end)
    if (word?.page) return word.page
  }
  return null
}

export function getActiveLineOnPage(ayahs: QuranAyah[], time: number, page: number) {
  for (const ayah of ayahs) {
    const word = ayah.words.find((item) => time >= item.start && time < item.end && item.page === page)
    if (word) return word.line
  }
  return null
}
