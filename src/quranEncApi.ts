export type QuranEncTranslation = {
  key: string
  language_iso_code: string
  version: string
  last_update: string
  title: string
  description: string
  localPath?: string
}

const LOCAL_TRANSLATIONS: QuranEncTranslation[] = [
  { key:'local_ur_jalandhry', language_iso_code:'ur', version:'bundled', last_update:'', title:'Fateh Muhammad Jalandhry', description:'Urdu translation bundled with Waraq', localPath:'/data/quran/translations/ur.jalandhry.txt' },
  { key:'local_ur_junagarhi', language_iso_code:'ur', version:'bundled', last_update:'', title:'Muhammad Junagarhi', description:'Urdu translation bundled with Waraq', localPath:'/data/quran/translations/ur.junagarhi.txt' },
  { key:'local_en_daryabadi', language_iso_code:'en', version:'bundled', last_update:'', title:'Abdul Majid Daryabadi', description:'English translation bundled with Waraq', localPath:'/data/quran/translations/en.daryabadi.txt' },
  { key:'local_ar_muyassar', language_iso_code:'ar', version:'bundled', last_update:'', title:'At-Tafsir Al-Muyassar', description:'Arabic translation bundled with Waraq', localPath:'/data/quran/translations/ar.muyassar.txt' },
  { key:'local_hi_farooq', language_iso_code:'hi', version:'bundled', last_update:'', title:'Muhammad Farooq Khan', description:'Hindi translation bundled with Waraq', localPath:'/data/quran/translations/hi.farooq.txt' },
  { key:'local_ko_korean', language_iso_code:'ko', version:'bundled', last_update:'', title:'Korean translation', description:'Korean translation bundled with Waraq', localPath:'/data/quran/translations/ko.korean.txt' },
  { key:'local_ta_tamil', language_iso_code:'ta', version:'bundled', last_update:'', title:'Tamil translation', description:'Tamil translation bundled with Waraq', localPath:'/data/quran/translations/ta.tamil.txt' },
  { key:'local_zh_jian', language_iso_code:'zh', version:'bundled', last_update:'', title:'Jian Chinese translation', description:'Chinese translation bundled with Waraq', localPath:'/data/quran/translations/zh.jian.txt' },
]

async function getPreferredLanguage(): Promise<'ar' | 'ur' | 'en'> {
  const locale = typeof navigator !== 'undefined' ? navigator.language.toLowerCase() : 'en'
  if (locale.startsWith('ar')) return 'ar'
  if (locale.startsWith('ur') || locale.startsWith('hi') || locale.startsWith('bn')) return 'ur'
  return 'en'
}

export async function fetchQuranEncTranslations(language?: string) {
  const preferred = await getPreferredLanguage()
  const requestedOrder = language === 'ur' ? ['ur','en','ar'] : language === 'ar' ? ['ar','en','ur'] : ['en','ur','ar']
  const preferredOrder = [preferred, ...requestedOrder, 'en', 'ur', 'ar'].filter((value, index, values) => values.indexOf(value) === index)
  const sorted = [...LOCAL_TRANSLATIONS].sort((a,b) => {
    const ai = preferredOrder.indexOf(a.language_iso_code)
    const bi = preferredOrder.indexOf(b.language_iso_code)
    return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi) || a.title.localeCompare(b.title)
  })
  const first = sorted.find(item => item.language_iso_code === (language || preferred)) || sorted[0]
  return first ? [first, ...sorted.filter(item => item.key !== first.key)] : sorted
}

export type QuranEncVerse = { sura:number; aya:number; translation:string; footnotes?:string }

function parseTranslationLine(line: string, surah: number): QuranEncVerse | null {
  if (!line || line.startsWith('#')) return null

  const match = line.match(/^(\d+)\|(\d+)\|(.*)$/)
  if (match) {
    const s = Number(match[1])
    const a = Number(match[2])
    return s === surah ? { sura:s, aya:a, translation:match[3] } : null
  }

  const bracket = line.match(/^\[(\d+):(\d+)\]\s*(.*)$/)
  if (bracket) {
    const s = Number(bracket[1])
    if (s === surah) return { sura:s, aya:Number(bracket[2]), translation:bracket[3] }
  }

  return null
}

async function fetchLocalTranslation(source: QuranEncTranslation, surah: number): Promise<QuranEncVerse[]> {
  if (!source.localPath) return []
  const response = await fetch(source.localPath, { headers:{ accept:'text/plain' } })
  if (!response.ok) throw new Error(`Bundled translation unavailable (${response.status})`)

  const result: QuranEncVerse[] = []
  const reader = response.body?.getReader()

  if (reader) {
    const decoder = new TextDecoder()
    let buffer = ''
    let reachedTarget = false

    try {
      while (!reachedTarget) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream:true })
        const lines = buffer.split(/\r?\n/)
        buffer = lines.pop() || ''

        for (const raw of lines) {
          const line = raw.trim()
          if (!line || line.startsWith('#')) continue
          const match = line.match(/^(\d+)\|(\d+)\|(.*)$/)
          if (match && Number(match[1]) > surah) {
            reachedTarget = true
            break
          }
          const entry = parseTranslationLine(line, surah)
          if (entry) result.push(entry)
        }
      }
    } finally {
      await reader.cancel()
    }

    if (!reachedTarget && buffer) {
      const entry = parseTranslationLine(buffer.trim(), surah)
      if (entry) result.push(entry)
    }
    return result
  }

  const text = await response.text()
  for (const raw of text.split(/\r?\n/)) {
    const entry = parseTranslationLine(raw.trim(), surah)
    if (entry) result.push(entry)
  }
  return result
}

export async function fetchQuranEncSurah(key: string, surah: number) {
  const local = LOCAL_TRANSLATIONS.find(item => item.key === key)
  if (!local) return []
  return fetchLocalTranslation(local, surah)
}
