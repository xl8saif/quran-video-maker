import { getMushafId, type MushafApiConfig } from './mushafApi'

export type PageBoundary = {
  from: string
  to: string
  first_verse_key: string
  last_verse_key: string
}

export type ChapterPagesLookup = {
  lookup_range: { from: string; to: string }
  pages: Record<string, PageBoundary>
  total_page: number
}

async function request(path: string, _config?: MushafApiConfig): Promise<unknown> {
  const response = await fetch(`/api/quran/content${path}`, {
    headers: { accept: 'application/json' },
  })
  if (!response.ok) throw new Error(`Quran page lookup failed (${response.status}).`)
  return response.json()
}

function isPageBoundary(value: unknown): value is PageBoundary {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return typeof item.from === 'string' &&
    typeof item.to === 'string' &&
    typeof item.first_verse_key === 'string' &&
    typeof item.last_verse_key === 'string'
}

export async function fetchChapterPagesLookup(
  chapterNumber: number,
  style: 'hafs-arabic-naskh' | 'indo-pak-muhammadi',
  config?: MushafApiConfig,
): Promise<ChapterPagesLookup> {
  if (!Number.isInteger(chapterNumber) || chapterNumber < 1 || chapterNumber > 114) {
    throw new Error('Invalid Surah number.')
  }

  const mushaf = getMushafId(style)
  const data = await request(
    `/pages/lookup?chapter_number=${chapterNumber}&mushaf=${mushaf}`,
    config,
  ) as Record<string, unknown>

  const pages = data.pages
  if (!pages || typeof pages !== 'object') throw new Error('Invalid page lookup response.')

  const normalizedPages: Record<string, PageBoundary> = {}
  for (const [pageNumber, boundary] of Object.entries(pages)) {
    if (!/^\d+$/.test(pageNumber) || !isPageBoundary(boundary)) {
      throw new Error('Invalid page boundary response.')
    }
    normalizedPages[pageNumber] = boundary
  }

  const lookupRange = data.lookup_range
  const totalPage = data.total_page
  if (!lookupRange || typeof lookupRange !== 'object' ||
      typeof (lookupRange as Record<string, unknown>).from !== 'string' ||
      typeof (lookupRange as Record<string, unknown>).to !== 'string' ||
      typeof totalPage !== 'number' || !Number.isInteger(totalPage) || totalPage < 1 ||
      Object.keys(normalizedPages).length === 0) {
    throw new Error('Incomplete page lookup response.')
  }

  return {
    lookup_range: lookupRange as { from: string; to: string },
    pages: normalizedPages,
    total_page: totalPage,
  }
}

export function getFirstChapterPage(lookup: ChapterPagesLookup): number {
  const pages = Object.keys(lookup.pages).map(Number).sort((a, b) => a - b)
  if (!pages.length) throw new Error('Chapter has no Mushaf pages.')
  return pages[0]
}

export function getChapterPageNumbers(lookup: ChapterPagesLookup): number[] {
  return Object.keys(lookup.pages).map(Number).sort((a, b) => a - b)
}
