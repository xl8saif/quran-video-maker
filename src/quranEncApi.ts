export type QuranEncTranslation = {
  key: string
  language_iso_code: string
  version: string
  last_update: string
  title: string
  description: string
}

const BASE = 'https://quranenc.com/api/v1'
let preferredLanguagePromise: Promise<'ar' | 'ur' | 'en'> | null = null
let allTranslationsPromise: Promise<QuranEncTranslation[]> | null = null
let callIndex = 0

const MENA = new Set([
  'DZ','BH','EG','IQ','JO','KW','LB','LY','MR','MA','OM','PS','QA','SA','SD','SY','TN','AE','YE',
])
const SOUTH_ASIA = new Set([
  'AF','BD','BT','IN','MV','NP','PK','LK',
])

async function getPreferredLanguage(): Promise<'ar' | 'ur' | 'en'> {
  if (!preferredLanguagePromise) {
    preferredLanguagePromise = fetch('/api/locale', { headers: { accept: 'application/json' } })
      .then(async response => {
        if (!response.ok) throw new Error('locale lookup failed')
        const data = await response.json() as { country?: string; language?: string }
        const country = String(data.country || '').toUpperCase()
        if (MENA.has(country)) return 'ar'
        if (SOUTH_ASIA.has(country)) return 'ur'
        return 'en'
      })
      .catch(() => {
        const locale = typeof navigator !== 'undefined' ? navigator.language.toLowerCase() : 'en'
        if (locale.startsWith('ar')) return 'ar'
        if (locale.startsWith('ur') || locale.startsWith('hi') || locale.startsWith('bn')) return 'ur'
        return 'en'
      })
  }
  return preferredLanguagePromise
}

async function getAllTranslations() {
  if (!allTranslationsPromise) {
    allTranslationsPromise = fetch(`${BASE}/translations/list?localization=en`, { headers: { accept: 'application/json' } })
      .then(async response => {
        if (!response.ok) throw new Error(`QuranEnc translation list failed (${response.status})`)
        const data = await response.json() as unknown
        return (Array.isArray(data) ? data : []) as QuranEncTranslation[]
      })
  }
  return allTranslationsPromise
}

export async function fetchQuranEncTranslations(_language?: string) {
  const [all, preferred] = await Promise.all([getAllTranslations(), getPreferredLanguage()])
  const preferredOrder = [preferred, 'en', 'ur', 'ar']
  const uniqueLanguages = preferredOrder.filter((language, index) => preferredOrder.indexOf(language) === index)
  const sorted = [...all].sort((a, b) => {
    const ai = uniqueLanguages.indexOf(a.language_iso_code)
    const bi = uniqueLanguages.indexOf(b.language_iso_code)
    return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi) || a.title.localeCompare(b.title)
  })

  // The existing UI requests en/ur/ar in that order. Use those three calls to
  // seed three distinct defaults while every call still exposes the complete
  // QuranEnc catalogue to the library.
  const slot = callIndex++ % 3
  const firstLanguage = uniqueLanguages[slot] || preferred
  const first = sorted.find(item => item.language_iso_code === firstLanguage)
  return first ? [first, ...sorted.filter(item => item.key !== first.key)] : sorted
}

export type QuranEncVerse = { sura: number; aya: number; translation: string; footnotes?: string }

export async function fetchQuranEncSurah(key: string, surah: number) {
  const response = await fetch(`${BASE}/translation/sura/${encodeURIComponent(key)}/${surah}`, { headers: { accept: 'application/json' } })
  if (!response.ok) throw new Error(`QuranEnc translation request failed (${response.status})`)
  const data = await response.json() as unknown
  return (Array.isArray(data) ? data : []) as QuranEncVerse[]
}
