import React from 'react'
import { surahCatalog } from './surahCatalog'

export type LiveChapter = {
  id: number
  name_simple: string
  name_arabic?: string
  verses_count: number
  revelation_place?: string
  revelation_order?: number
  pages?: number[]
}

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
