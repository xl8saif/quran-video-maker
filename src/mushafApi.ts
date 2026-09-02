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
  text_qpc_hafs?: string
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

const QURAN_FILES = {
  uthmani: '/data/quran-uthmani-min.txt',
  simple: '/data/quran-simple-clean.txt',
} as const

let uthmaniPromise: Promise<Map<number, string[]>> | null = null
let simplePromise: Promise<Map<number, string[]>> | null = null

async function loadQuran(path: string) {
  const response = await fetch(path, { headers:{ accept:'text/plain' } })
  if (!response.ok) throw new Error(`Bundled Quran text unavailable (${response.status})`)
  const text = await response.text()
  const result = new Map<number, string[]>()
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    const match = line.match(/^(\d+)\|(\d+)\|(.*)$/)
    if (!match) continue
    const surah = Number(match[1]); const ayah = Number(match[2])
    const values = result.get(surah) || []
    values[ayah] = match[3]
    result.set(surah, values)
  }
  return result
}

function getQuran(style: 'hafs-arabic-naskh' | 'indo-pak-muhammadi') {
  if (style === 'indo-pak-muhammadi') {
    simplePromise ||= loadQuran(QURAN_FILES.simple)
    return simplePromise
  }
  uthmaniPromise ||= loadQuran(QURAN_FILES.uthmani)
  return uthmaniPromise
}

function makeWords(text: string, verseKey: string, pageNumber: number, lineNumber: number, indopak = false): ApiWord[] {
  const words = text.split(/\s+/).filter(Boolean)
  return words.map((word, index) => ({ id:index + 1, position:index + 1, verse_key:verseKey, page_number:pageNumber, line_number:lineNumber, text_uthmani:indopak ? undefined : word, text_qpc_hafs:indopak ? undefined : word, text_indopak:indopak ? word : undefined }))
}

export async function fetchChapterPages(
  chapterNumber: number,
  style: 'hafs-arabic-naskh' | 'indo-pak-muhammadi',
  _config?: MushafApiConfig,
): Promise<PagesLookupResponse> {
  const quran = await getQuran(style)
  const verses = quran.get(chapterNumber) || []
  const ayahs = verses.slice(1).filter(Boolean).length
  const pageCount = Math.max(1, Math.ceil(ayahs / 7))
  const pages: Record<string, MushafPageBoundary> = {}
  for (let index = 0; index < pageCount; index++) {
    const first = index * 7 + 1
    const last = Math.min(ayahs, first + 6)
    pages[String(index + 1)] = { from:`${chapterNumber}:${first}`, to:`${chapterNumber}:${last}`, first_verse_key:`${chapterNumber}:${first}`, last_verse_key:`${chapterNumber}:${last}` }
  }
  return { lookup_range:{from:`${chapterNumber}:1`,to:`${chapterNumber}:${ayahs}`}, pages, total_page:pageCount }
}

export async function fetchPage(
  pageNumber: number,
  style: 'hafs-arabic-naskh' | 'indo-pak-muhammadi',
  _config?: MushafApiConfig,
  _translationIds: number[] = [],
): Promise<{ verses: ApiVerse[] }> {
  const quran = await getQuran(style)
  const all: ApiVerse[] = []
  let globalVerse = 0
  const start = Math.max(1, pageNumber)
  const end = start * 7
  outer: for (const [surah, verses] of quran.entries()) {
    for (let ayah = 1; ayah < verses.length; ayah++) {
      if (!verses[ayah]) continue
      globalVerse++
      if (globalVerse <= (start - 1) * 7) continue
      if (globalVerse > end) break outer
      const verseKey = `${surah}:${ayah}`
      const lineNumber = ((globalVerse - 1) % 7) + 1
      const words = makeWords(verses[ayah], verseKey, pageNumber, lineNumber, style === 'indo-pak-muhammadi')
      all.push({ verse_key:verseKey, verse_number:ayah, page_number:pageNumber, text_uthmani:style === 'indo-pak-muhammadi' ? undefined : verses[ayah], text_indopak:style === 'indo-pak-muhammadi' ? verses[ayah] : undefined, text_qpc_hafs:style === 'indo-pak-muhammadi' ? undefined : verses[ayah], words })
    }
  }
  return { verses:all }
}
