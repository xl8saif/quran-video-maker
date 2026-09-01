import type { QuranDataset, QuranSurah, QuranVerse, QuranTranslation } from './quranSchema'

export function createQuranService(dataset: QuranDataset) {
  const surahMap = new Map<number, QuranSurah>(dataset.surahs.map(s => [s.number, s]))
  const verseMap = new Map<string, QuranVerse>()

  for (const surah of dataset.surahs) {
    for (const verse of surah.verses) verseMap.set(verse.verseKey, verse)
  }

  return {
    getDataset: () => dataset,
    getSurahs: () => dataset.surahs,
    getSurah: (surahNumber: number) => surahMap.get(surahNumber),
    getAyahs: (surahNumber: number) => surahMap.get(surahNumber)?.verses ?? [],
    getAyah: (surahNumber: number, ayahNumber: number) => verseMap.get(`${surahNumber}:${ayahNumber}`),
    getVerse: (verseKey: string) => verseMap.get(verseKey),
  }
}

export function mergeTranslation(
  translation: QuranTranslation,
  verseKey: string,
): string | undefined {
  return translation.verses[verseKey]
}

export function validateQuranDataset(dataset: QuranDataset): string[] {
  const errors: string[] = []
  const keys = new Set<string>()

  if (!dataset.source) errors.push('Missing Quran source')
  if (!dataset.version) errors.push('Missing Quran dataset version')
  if (!dataset.license) errors.push('Missing Quran dataset license')

  for (const surah of dataset.surahs) {
    if (surah.number < 1 || surah.number > 114) errors.push(`Invalid surah number: ${surah.number}`)
    for (const verse of surah.verses) {
      if (!verse.text.trim()) errors.push(`Empty Quran text: ${verse.verseKey}`)
      if (keys.has(verse.verseKey)) errors.push(`Duplicate verse key: ${verse.verseKey}`)
      keys.add(verse.verseKey)
    }
  }

  return errors
}
