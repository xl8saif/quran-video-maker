export const QURAN_API_BASE = 'https://apis.quran.foundation/content/api/v4'

export type MushafApiConfig = { accessToken: string; clientId: string }
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
export type ApiVerse = {
  verse_key: string
  verse_number: number
  page_number: number
  text_uthmani?: string
  text_indopak?: string
  words?: ApiWord[]
  translations?: { text: string; language_name?: string; resource_name?: string }[]
}

export function getMushafId(style: 'hafs-arabic-naskh' | 'indo-pak-muhammadi') {
  // Quran Foundation documents Uthmani/Hafs as 4 and IndoPak 15-line as 6.
  return style === 'indo-pak-muhammadi' ? 6 : 4
}

async function request(path: string, config: MushafApiConfig) {
  if (!config.accessToken || !config.clientId) throw new Error('Quran Foundation API credentials are not configured.')
  const response = await fetch(`${QURAN_API_BASE}${path}`, {
    headers: { 'x-auth-token': config.accessToken, 'x-client-id': config.clientId },
  })
  if (!response.ok) throw new Error(`Quran API request failed (${response.status}).`)
  return response.json()
}

export async function fetchChapterPages(chapterNumber: number, style: 'hafs-arabic-naskh' | 'indo-pak-muhammadi', config: MushafApiConfig) {
  const mushaf = getMushafId(style)
  return request(`/pages/lookup?chapter_number=${chapterNumber}&mushaf=${mushaf}`, config)
}

export async function fetchPage(pageNumber: number, style: 'hafs-arabic-naskh' | 'indo-pak-muhammadi', config: MushafApiConfig): Promise<{ verses: ApiVerse[] }> {
  const mushaf = getMushafId(style)
  return request(`/verses/by_page/${pageNumber}?mushaf=${mushaf}&words=true&word_fields=text_uthmani,text_indopak,text_qpc_hafs,line_number,page_number,verse_key,position`, config)
}
