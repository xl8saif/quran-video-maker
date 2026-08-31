import type { QuranAyah } from './quranData'
import type { MushafPagePayload } from './mushafDataAdapter'

const PREFIX = 'qvm:mushaf-page:v1:'
const makeKey = (styleId: string, page: number) => `${PREFIX}${styleId}:${page}`

type CachedPage = { savedAt: number; payload: MushafPagePayload }

export function getCachedMushafPage(styleId: string, page: number): MushafPagePayload | null {
  try {
    const raw = localStorage.getItem(makeKey(styleId, page))
    if (!raw) return null
    const cached = JSON.parse(raw) as CachedPage
    return cached?.payload ?? null
  } catch {
    return null
  }
}

export function cacheMushafPage(styleId: string, page: number, payload: MushafPagePayload): void {
  try {
    const value: CachedPage = { savedAt: Date.now(), payload }
    localStorage.setItem(makeKey(styleId, page), JSON.stringify(value))
  } catch {
    // Storage may be unavailable or full; the app can continue without caching.
  }
}

export function clearMushafPageCache(): void {
  try {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i)
      if (key?.startsWith(PREFIX)) keys.push(key)
    }
    keys.forEach((key) => localStorage.removeItem(key))
  } catch {
    // Ignore storage errors.
  }
}

export function prefetchAdjacentPages(
  styleId: string,
  page: number,
  totalPages: number,
  loader: (page: number) => Promise<MushafPagePayload>,
): void {
  for (const adjacent of [page - 1, page + 1]) {
    if (adjacent < 1 || adjacent > totalPages || getCachedMushafPage(styleId, adjacent)) continue
    void loader(adjacent).then((payload) => cacheMushafPage(styleId, adjacent, payload)).catch(() => undefined)
  }
}

export function cachedPayloadToAyahs(payload: MushafPagePayload): QuranAyah[] {
  // Kept as a small compatibility helper for future offline project files.
  return payload.verses.map((verse) => ({
    verseKey: verse.verse_key,
    arabic: verse.text_uthmani ?? verse.text_indopak ?? '',
    translations: { en: '', ur: '', ar: '' },
    words: (verse.words ?? []).map((word) => ({
      text: word.text_uthmani ?? word.text_indopak ?? '',
      start: 0,
      end: 0,
      line: word.line_number,
      index: word.position,
      page: word.page_number,
    })),
  }))
}
