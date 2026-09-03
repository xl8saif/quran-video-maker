import type { ChapterAudioTiming } from './recitationTiming'

export type QuranApiCredentials = { accessToken?: string; clientId?: string }
export type Reciter = { id: number; reciter_id?: number; reciter_name?: string; name?: string; arabic_name?: string; style?: string; translated_name?: { name?: string } }
export type ChapterRecitation = { id: number; reciter_id?: number; reciter_name?: string; name?: string; style?: string; chapter_number?: number }
export type ChapterAudio = ChapterAudioTiming

type PublicReciter = Reciter & { path: string; fallbackPaths?: string[] }

const PUBLIC_RECITERS: PublicReciter[] = [
  { id: 1, reciter_id: 1, reciter_name: 'Mishary Rashid Al Afasy', name: 'Mishary Rashid Al Afasy', style: 'Murattal', path: 'https://server8.mp3quran.net/afs', fallbackPaths: ['https://server7.mp3quran.net/afs'] },
  { id: 2, reciter_id: 2, reciter_name: 'Abu Bakr Al Shatri', name: 'Abu Bakr Al Shatri', style: 'Murattal', path: 'https://server11.mp3quran.net/shatri', fallbackPaths: ['https://server8.mp3quran.net/shatri'] },
  { id: 3, reciter_id: 3, reciter_name: 'Nasser Al Qatami', name: 'Nasser Al Qatami', style: 'Murattal', path: 'https://server6.mp3quran.net/qtm', fallbackPaths: ['https://server7.mp3quran.net/qtm'] },
  { id: 4, reciter_id: 4, reciter_name: 'Yasser Al Dosari', name: 'Yasser Al Dosari', style: 'Murattal', path: 'https://server11.mp3quran.net/yasser', fallbackPaths: ['https://server6.mp3quran.net/yasser'] },
  { id: 5, reciter_id: 5, reciter_name: 'Hani Ar Rifai', name: 'Hani Ar Rifai', style: 'Murattal', path: 'https://server8.mp3quran.net/rifai', fallbackPaths: ['https://server7.mp3quran.net/rifai'] },
  { id: 6, reciter_id: 6, reciter_name: 'Muhammad Al-Muhaisni', name: 'Muhammad Al-Muhaisni', arabic_name: 'محمد المحيسني', style: 'Murattal · Hafs An Asim', path: 'https://server11.mp3quran.net/mhsny', fallbackPaths: ['https://server8.mp3quran.net/mhsny'] },
]

const LOCAL_TIMING_SOURCES: Record<number, string> = {
  1: 'surah/abdul-basit/abdul-basit-abd-us-samad-murattal.db.zip',
  2: 'surah/minshawy/muhammad-siddiq-al-minshawy-murattal.db.zip',
  3: 'surah/saad-ghamadi/saad-ghamadi.db.zip',
  4: 'surah/sadaqat-ali/sadaqat-ali.db.zip',
  5: 'surah/noreen-siddiq-ad-doori/noreen-siddiq-ad-doori-an-abi-amr.db.zip',
  6: 'ayah/sudais/ayah-recitation-abdul-rahman-al-sudais-murattal-hafs-951.db.zip',
}

let timingManifestPromise: Promise<Record<string, any[]>> | null = null

async function loadLocalTimingManifest(): Promise<Record<string, any[]>> {
  if (!timingManifestPromise) {
    timingManifestPromise = fetch('/data/recitations/timings.json')
      .then(response => {
        if (!response.ok) throw new Error(`Unable to load local recitation timings (${response.status}).`)
        return response.json()
      })
      .then(payload => payload?.sources ?? {})
  }
  return timingManifestPromise
}

export async function fetchChapterRecitations(_credentials?: QuranApiCredentials): Promise<{ recitations: Reciter[] }> {
  return { recitations: PUBLIC_RECITERS.map(({ path: _path, fallbackPaths: _fallback, ...reciter }) => reciter) }
}

export async function fetchChapterAudio(reciterId: number, chapterNumber: number, _credentials?: QuranApiCredentials, _includeSegments = true): Promise<ChapterAudio> {
  const reciter = PUBLIC_RECITERS.find(item => item.id === reciterId)
  if (!reciter) throw new Error('Invalid reciter.')
  if (!Number.isInteger(chapterNumber) || chapterNumber < 1 || chapterNumber > 114) throw new Error('Invalid Surah number.')

  const source = LOCAL_TIMING_SOURCES[reciterId]
  const manifest = await loadLocalTimingManifest()
  const rows = source ? (manifest[source] ?? []) : []
  const timestamps = rows
    .filter(row => String(row.verseKey).startsWith(`${chapterNumber}:`))
    .map(row => ({
      verseKey: String(row.verseKey),
      startMs: Number(row.startMs ?? 0),
      endMs: Number(row.endMs ?? 0),
      segments: Array.isArray(row.segments) ? row.segments : undefined,
    }))

  const file = `${String(chapterNumber).padStart(3, '0')}.mp3`
  return { audioUrl: `${reciter.path}/${file}`, timestamps }
}

export { findActiveTiming, timingDuration } from './recitationTiming'
