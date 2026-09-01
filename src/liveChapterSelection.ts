import type { LiveChapter } from './liveChaptersApi'

export function findLiveChapter(chapters: LiveChapter[], chapterNumber: number): LiveChapter | undefined {
  return chapters.find(chapter => chapter.id === chapterNumber)
}

export function getLiveChapterName(chapter: LiveChapter | undefined, fallback = 'Surah'): string {
  return chapter?.name_simple || fallback
}

export function getLiveChapterArabicName(chapter: LiveChapter | undefined): string {
  return chapter?.name_arabic || ''
}

export function getLiveChapterAyahCount(chapter: LiveChapter | undefined): number {
  return chapter?.verses_count || 0
}
