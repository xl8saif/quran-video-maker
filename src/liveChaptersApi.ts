import { surahCatalog } from './surahCatalog'

export type LiveChapter = {
  id: number
  name_simple: string
  name_arabic: string
  verses_count: number
}

// Compatibility layer for existing chapter-selection code.
// Chapter metadata is bundled locally; no external Quran API is used.
export const localLiveChapters: LiveChapter[] = surahCatalog.map(surah => ({
  id: surah.number,
  name_simple: surah.name,
  name_arabic: surah.arabic,
  verses_count: surah.ayahs,
}))

export async function fetchLiveChapters(): Promise<LiveChapter[]> {
  return localLiveChapters
}
