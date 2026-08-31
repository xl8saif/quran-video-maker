import type { QuranAyah, QuranWord } from './quranData'

export type MushafLine = {
  page: number
  line: number
  words: QuranWord[]
}

/** Group positioned words by physical Mushaf line. A line may contain words from multiple ayahs. */
export function groupWordsByLine(words: QuranWord[], page = 1): MushafLine[] {
  const groups = new Map<number, QuranWord[]>()
  for (const word of words) {
    const list = groups.get(word.line) ?? []
    list.push(word)
    groups.set(word.line, list)
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([line, lineWords]) => ({ page, line, words: lineWords }))
}

export function flattenAyahWords(ayahs: QuranAyah[]): QuranWord[] {
  return ayahs.flatMap(ayah => ayah.words)
}

export function getActiveWord(ayahs: QuranAyah[], time: number) {
  for (const ayah of ayahs) {
    const index = ayah.words.findIndex(word => time >= word.start && time < word.end)
    if (index >= 0) return { verseKey: ayah.verseKey, wordIndex: index, word: ayah.words[index] }
  }
  return null
}

export function getActiveLine(ayahs: QuranAyah[], time: number) {
  const active = getActiveWord(ayahs, time)
  return active ? active.word.line : null
}
