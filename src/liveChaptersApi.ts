export type LiveChapter = {
  id: number
  name_simple: string
  name_arabic?: string
  verses_count: number
  revelation_place?: string
  revelation_order?: number
  pages?: number[]
}

type ChaptersResponse = {
  chapters: LiveChapter[]
}

export async function fetchLiveChapters(language = 'en'): Promise<LiveChapter[]> {
  const params = new URLSearchParams({ language })
  const response = await fetch(`/api/quran/chapters?${params.toString()}`, {
    headers: { accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Quran chapters request failed (${response.status}).`)
  }

  const data = await response.json() as ChaptersResponse
  if (!Array.isArray(data.chapters)) {
    throw new Error('Invalid Quran chapters response.')
  }

  return data.chapters.filter(
    chapter => Number.isInteger(chapter.id) &&
      chapter.id >= 1 && chapter.id <= 114 &&
      typeof chapter.name_simple === 'string' &&
      typeof chapter.verses_count === 'number',
  )
}
