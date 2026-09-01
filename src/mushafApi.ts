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
  return style === 'indo-pak-muhammadi' ? 6 : 4
}

async function request(path: string, _config?: MushafApiConfig) {
  const response = await fetch(`/api/quran/content${path}`, { headers: { accept: 'application/json' } })
  if (!response.ok) throw new Error(`Quran API request failed (${response.status}).`)
  return response.json()
}

export async function fetchChapterPages(chapterNumber: number, style: 'hafs-arabic-naskh' | 'indo-pak-muhammadi', config?: MushafApiConfig) {
  const mushaf = getMushafId(style)
  return request(`/pages/lookup?chapter_number=${chapterNumber}&mushaf=${mushaf}`, config)
}

export async function fetchPage(pageNumber: number, style: 'hafs-arabic-naskh' | 'indo-pak-muhammadi', config?: MushafApiConfig): Promise<{ verses: ApiVerse[] }> {
  const mushaf = getMushafId(style)
  return request(`/verses/by_page/${pageNumber}?mushaf=${mushaf}&words=true&word_fields=text_uthmani,text_indopak,text_qpc_hafs,line_number,page_number,verse_key,position`, config)
}
