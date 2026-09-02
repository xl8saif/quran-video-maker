import React from 'react'
import { surahCatalog } from './surahCatalog'
import type { LiveChapter } from './liveChaptersApi'

export function useLiveChapters(_language = 'en') {
  const chapters = React.useMemo<LiveChapter[]>(
    () => surahCatalog.map(surah => ({
      id: surah.number,
      name_simple: surah.name,
      name_arabic: surah.arabic,
      verses_count: surah.ayahs,
    })),
    [],
  )

  return { chapters, loading: false, error: '' }
}
