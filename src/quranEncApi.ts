export type QuranEncTranslation = {
  key: string
  language_iso_code: string
  version: string
  last_update: string
  title: string
  description: string
}

const BASE = 'https://quranenc.com/api/v1'

export async function fetchQuranEncTranslations(language: string) {
  const response = await fetch(`${BASE}/translations/list/${language}?localization=en`, { headers: { accept: 'application/json' } })
  if (!response.ok) throw new Error(`QuranEnc translation list failed (${response.status})`)
  const data = await response.json() as unknown
  return (Array.isArray(data) ? data : []) as QuranEncTranslation[]
}

export type QuranEncVerse = { sura: number; aya: number; translation: string; footnotes?: string }

export async function fetchQuranEncSurah(key: string, surah: number) {
  const response = await fetch(`${BASE}/translation/sura/${encodeURIComponent(key)}/${surah}`, { headers: { accept: 'application/json' } })
  if (!response.ok) throw new Error(`QuranEnc translation request failed (${response.status})`)
  const data = await response.json() as unknown
  return (Array.isArray(data) ? data : []) as QuranEncVerse[]
}
