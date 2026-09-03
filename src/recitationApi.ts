import type { ChapterAudioTiming } from './recitationTiming'

export type QuranApiCredentials = { accessToken?: string; clientId?: string }
export type Reciter = { id: number; reciter_id?: number; reciter_name?: string; name?: string; arabic_name?: string; style?: string; translated_name?: { name?: string } }
export type ChapterRecitation = { id: number; reciter_id?: number; reciter_name?: string; name?: string; style?: string; chapter_number?: number }
export type ChapterAudio = ChapterAudioTiming

type PublicReciter = Reciter & { path: string; fallbackPaths?: string[] }

// Use public chapter CDNs rather than GitHub raw files. The latter can return
// redirects/range responses that are unreliable as an HTMLAudio source.
const PUBLIC_RECITERS: PublicReciter[] = [
  { id: 1, reciter_id: 1, reciter_name: 'Mishary Rashid Al Afasy', name: 'Mishary Rashid Al Afasy', style: 'Murattal', path: 'https://server8.mp3quran.net/afs', fallbackPaths: ['https://server7.mp3quran.net/afs'] },
  { id: 2, reciter_id: 2, reciter_name: 'Abu Bakr Al Shatri', name: 'Abu Bakr Al Shatri', style: 'Murattal', path: 'https://server11.mp3quran.net/shatri', fallbackPaths: ['https://server8.mp3quran.net/shatri'] },
  { id: 3, reciter_id: 3, reciter_name: 'Nasser Al Qatami', name: 'Nasser Al Qatami', style: 'Murattal', path: 'https://server6.mp3quran.net/qtm', fallbackPaths: ['https://server7.mp3quran.net/qtm'] },
  { id: 4, reciter_id: 4, reciter_name: 'Yasser Al Dosari', name: 'Yasser Al Dosari', style: 'Murattal', path: 'https://server11.mp3quran.net/yasser', fallbackPaths: ['https://server6.mp3quran.net/yasser'] },
  { id: 5, reciter_id: 5, reciter_name: 'Hani Ar Rifai', name: 'Hani Ar Rifai', style: 'Murattal', path: 'https://server8.mp3quran.net/rifai', fallbackPaths: ['https://server7.mp3quran.net/rifai'] },
  { id: 6, reciter_id: 6, reciter_name: 'Muhammad Al-Muhaisni', name: 'Muhammad Al-Muhaisni', arabic_name: 'محمد المحيسني', style: 'Murattal · Hafs An Asim', path: 'https://server11.mp3quran.net/mhsny', fallbackPaths: ['https://server8.mp3quran.net/mhsny'] },
]

export async function fetchChapterRecitations(_credentials?: QuranApiCredentials): Promise<{ recitations: Reciter[] }> {
  return { recitations: PUBLIC_RECITERS.map(({ path: _path, fallbackPaths: _fallback, ...reciter }) => reciter) }
}

export async function fetchChapterAudio(reciterId: number, chapterNumber: number, _credentials?: QuranApiCredentials, _includeSegments = true): Promise<ChapterAudio> {
  const reciter = PUBLIC_RECITERS.find(item => item.id === reciterId)
  if (!reciter) throw new Error('Invalid reciter.')
  if (!Number.isInteger(chapterNumber) || chapterNumber < 1 || chapterNumber > 114) throw new Error('Invalid Surah number.')
  const file = `${String(chapterNumber).padStart(3, '0')}.mp3`
  return { audioUrl: `${reciter.path}/${file}`, timestamps: [] }
}

export { findActiveTiming, timingDuration } from './recitationTiming'
