export type QuranEncTranslation = {
  key: string
  language_iso_code: string
  version: string
  last_update: string
  title: string
  description: string
  localPath?: string
}

const BASE = 'https://quranenc.com/api/v1'
let preferredLanguagePromise: Promise<'ar' | 'ur' | 'en'> | null = null
let allTranslationsPromise: Promise<QuranEncTranslation[]> | null = null

const MENA = new Set(['DZ','BH','EG','IQ','JO','KW','LB','LY','MR','MA','OM','PS','QA','SA','SD','SY','TN','AE','YE'])
const SOUTH_ASIA = new Set(['AF','BD','BT','IN','MV','NP','PK','LK'])

const LOCAL_TRANSLATIONS: QuranEncTranslation[] = [
  { key:'local_ur_jalandhry', language_iso_code:'ur', version:'bundled', last_update:'', title:'Fateh Muhammad Jalandhry', description:'Urdu translation bundled with Waraq', localPath:'/data/ur.jalandhry.txt' },
  { key:'local_ur_junagarhi', language_iso_code:'ur', version:'bundled', last_update:'', title:'Muhammad Junagarhi', description:'Urdu translation bundled with Waraq', localPath:'/data/ur.junagarhi.txt' },
  { key:'local_en_daryabadi', language_iso_code:'en', version:'bundled', last_update:'', title:'Abdul Majid Daryabadi', description:'English translation bundled with Waraq', localPath:'/data/en.daryabadi.txt' },
  { key:'local_ar_muyassar', language_iso_code:'ar', version:'bundled', last_update:'', title:'At-Tafsir Al-Muyassar', description:'Arabic translation bundled with Waraq', localPath:'/data/ar.muyassar.txt' },
  { key:'local_hi_farooq', language_iso_code:'hi', version:'bundled', last_update:'', title:'Muhammad Farooq Khan', description:'Hindi translation bundled with Waraq', localPath:'/data/hi.farooq.txt' },
  { key:'local_ko_korean', language_iso_code:'ko', version:'bundled', last_update:'', title:'Korean translation', description:'Korean translation bundled with Waraq', localPath:'/data/ko.korean.txt' },
  { key:'local_ta_tamil', language_iso_code:'ta', version:'bundled', last_update:'', title:'Tamil translation', description:'Tamil translation bundled with Waraq', localPath:'/data/ta.tamil.txt' },
]

async function getPreferredLanguage(): Promise<'ar' | 'ur' | 'en'> {
  if (!preferredLanguagePromise) {
    preferredLanguagePromise = fetch('/api/locale', { headers:{ accept:'application/json' } }).then(async response => {
      if (!response.ok) throw new Error('locale lookup failed')
      const data = await response.json() as { country?: string }
      const country = String(data.country || '').toUpperCase()
      if (MENA.has(country)) return 'ar'
      if (SOUTH_ASIA.has(country)) return 'ur'
      return 'en'
    }).catch(() => {
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
    allTranslationsPromise = fetch('/api/quranenc/translations?localization=en', { headers:{ accept:'application/json' } }).then(async response => {
      if (!response.ok) throw new Error(`QuranEnc translation list failed (${response.status})`)
      const data = await response.json() as unknown
      return (Array.isArray(data) ? data : []) as QuranEncTranslation[]
    }).catch(() => LOCAL_TRANSLATIONS)
  }
  return allTranslationsPromise
}

export async function fetchQuranEncTranslations(language?: string) {
  const [all, preferred] = await Promise.all([getAllTranslations(), getPreferredLanguage()])
  const requestedOrder = language === 'ur' ? ['ur','en','ar'] : language === 'ar' ? ['ar','en','ur'] : ['en','ur','ar']
  const preferredOrder = [preferred, ...requestedOrder, 'en', 'ur', 'ar'].filter((value, index, values) => values.indexOf(value) === index)
  const sorted = [...all].sort((a,b) => {
    const ai = preferredOrder.indexOf(a.language_iso_code)
    const bi = preferredOrder.indexOf(b.language_iso_code)
    return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi) || a.title.localeCompare(b.title)
  })
  const first = sorted.find(item => item.language_iso_code === (language || preferred)) || sorted.find(item => item.language_iso_code === requestedOrder[0])
  return first ? [first, ...sorted.filter(item => item.key !== first.key)] : sorted
}

export type QuranEncVerse = { sura:number; aya:number; translation:string; footnotes?:string }

async function fetchLocalTranslation(source: QuranEncTranslation, surah: number): Promise<QuranEncVerse[]> {
  const response = await fetch(source.localPath!, { headers:{ accept:'text/plain' } })
  if (!response.ok) throw new Error(`Local translation unavailable (${response.status})`)
  const text = await response.text()
  const result: QuranEncVerse[] = []
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const match = line.match(/^(\d+)\|(\d+)\|(.*)$/)
    if (match) {
      const s = Number(match[1]); const a = Number(match[2])
      if (s === surah) result.push({ sura:s, aya:a, translation:match[3] })
      continue
    }
    const bracket = line.match(/^\[(\d+):(\d+)\]\s*(.*)$/)
    if (bracket && Number(bracket[1]) === surah) result.push({ sura:Number(bracket[1]), aya:Number(bracket[2]), translation:bracket[3] })
  }
  return result
}

export async function fetchQuranEncSurah(key: string, surah: number) {
  const local = LOCAL_TRANSLATIONS.find(item => item.key === key)
  if (local) return fetchLocalTranslation(local, surah)
  const response = await fetch(`/api/quranenc/sura/${encodeURIComponent(key)}/${surah}`, { headers:{ accept:'application/json' } })
  if (!response.ok) throw new Error(`QuranEnc translation request failed (${response.status})`)
  const data = await response.json() as unknown
  return (Array.isArray(data) ? data : []) as QuranEncVerse[]
}
