export type MushafApiConfig = { accessToken?: string; clientId?: string }

export type ApiWord = {
  id?: number
  position: number
  verse_key: string
  page_number: number
  line_number: number
  text_uthmani?: string
  text_indopak?: string
  text_qpc_hafs?: string
  code_v2?: string
  audio_url?: string
}

export type ApiTranslation = {
  resource_id?: number
  text: string
  language_name?: string
  resource_name?: string
}

export type ApiVerse = {
  verse_key: string
  verse_number: number
  page_number: number
  text_uthmani?: string
  text_indopak?: string
  words?: ApiWord[]
  translations?: ApiTranslation[]
}

export type MushafPageBoundary = {
  from: string
  to: string
  first_verse_key: string
  last_verse_key: string
}

export type PagesLookupResponse = {
  lookup_range: { from: string; to: string }
  pages: Record<string, MushafPageBoundary>
  total_page: number
}

export function getMushafId(style: 'hafs-arabic-naskh' | 'indo-pak-muhammadi') {
  return style === 'indo-pak-muhammadi' ? 6 : 4
}

async function request(path: string, _config?: MushafApiConfig) {
  const response = await fetch(`/api/quran/content${path}`, {
    headers: { accept: 'application/json' },
  })

  if (!response.ok) {
    let detail = ''
    try {
      const body = await response.json() as { error?: unknown }
      if (typeof body.error === 'string') detail = ` ${body.error}`
    } catch {
      // Keep the generic HTTP error when the proxy response is not JSON.
    }
    throw new Error(`Quran API request failed (${response.status}).${detail}`)
  }

  return response.json()
}

export async function fetchChapterPages(
  chapterNumber: number,
  style: 'hafs-arabic-naskh' | 'indo-pak-muhammadi',
  config?: MushafApiConfig,
): Promise<PagesLookupResponse> {
  const mushaf = getMushafId(style)
  const data = await request(
    `/pages/lookup?chapter_number=${encodeURIComponent(chapterNumber)}&mushaf=${mushaf}`,
    config,
  ) as PagesLookupResponse

  if (!data || typeof data.total_page !== 'number' || !data.pages || typeof data.pages !== 'object') {
    throw new Error('Quran API returned an invalid page-layout response.')
  }

  return data
}

export async function fetchPage(
  pageNumber: number,
  style: 'hafs-arabic-naskh' | 'indo-pak-muhammadi',
  config?: MushafApiConfig,
  translationIds: number[] = [],
): Promise<{ verses: ApiVerse[] }> {
  const mushaf = getMushafId(style)
  const params = new URLSearchParams({
    mushaf: String(mushaf),
    words: 'true',
    word_fields: 'text_uthmani,text_indopak,text_qpc_hafs,line_number,page_number,verse_key,position',
  })
  const ids = [...new Set(translationIds)].filter(id => Number.isInteger(id) && id > 0)
  if (ids.length) params.set('translations', ids.join(','))
  const data = await request(
    `/verses/by_page/${encodeURIComponent(pageNumber)}?${params.toString()}`,
    config,
  ) as { verses?: unknown }

  if (!data || !Array.isArray(data.verses)) {
    throw new Error('Quran API returned an invalid verse response.')
  }

  return { verses: data.verses as ApiVerse[] }
}
