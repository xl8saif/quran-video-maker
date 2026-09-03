import type { ChapterAudioTiming } from './recitationTiming'

export type QuranApiCredentials = { accessToken?: string; clientId?: string }
export type Reciter = { id: number; reciter_id?: number; reciter_name?: string; name?: string; style?: string; translated_name?: { name?: string } }
export type ChapterRecitation = { id: number; reciter_id?: number; reciter_name?: string; name?: string; style?: string; chapter_number?: number }
export type ChapterAudio = ChapterAudioTiming

// The browser must not call the authenticated Quran Foundation Content API directly.
// These public chapter files provide a reliable playback fallback while preserving
// the same ChapterAudioTiming shape consumed by the player/export pipeline.
const PUBLIC_RECITERS: Array<Reciter & { path: string }> = [
  { id: 1, reciter_id: 1, reciter_name: 'Mishary Rashid Al Afasy', name: 'Mishary Rashid Al Afasy', style: 'Murattal', path: 'https://github.com/The-Quran-Project/Quran-Audio-Chapters/raw/refs/heads/main/Data/1' },
  { id: 2, reciter_id: 2, reciter_name: 'Abu Bakr Al Shatri', name: 'Abu Bakr Al Shatri', style: 'Murattal', path: 'https://github.com/The-Quran-Project/Quran-Audio-Chapters/raw/refs/heads/main/Data/2' },
  { id: 3, reciter_id: 3, reciter_name: 'Nasser Al Qatami', name: 'Nasser Al Qatami', style: 'Murattal', path: 'https://github.com/The-Quran-Project/Quran-Audio-Chapters/raw/refs/heads/main/Data/3' },
  { id: 4, reciter_id: 4, reciter_name: 'Yasser Al Dosari', name: 'Yasser Al Dosari', style: 'Murattal', path: 'https://github.com/The-Quran-Project/Quran-Audio-Chapters/raw/refs/heads/main/Data/4' },
  { id: 5, reciter_id: 5, reciter_name: 'Hani Ar Rifai', name: 'Hani Ar Rifai', style: 'Murattal', path: 'https://github.com/The-Quran-Project/Quran-Audio-Chapters/raw/refs/heads/main/Data/5' },
]

export async function fetchChapterRecitations(_credentials?: QuranApiCredentials): Promise<{ recitations: Reciter[] }> {
  return { recitations: PUBLIC_RECITERS.map(({ path: _path, ...reciter }) => reciter) }
}

export async function fetchChapterAudio(reciterId: number, chapterNumber: number, _credentials?: QuranApiCredentials, _includeSegments = true): Promise<ChapterAudio> {
  if (!Number.isInteger(reciterId) || !PUBLIC_RECITERS.some(item => item.id === reciterId)) throw new Error('Invalid reciter.')
  if (!Number.isInteger(chapterNumber) || chapterNumber < 1 || chapterNumber > 114) throw new Error('Invalid Surah number.')
  const reciter = PUBLIC_RECITERS.find(item => item.id === reciterId)!
  const audioUrl = `${reciter.path}/${chapterNumber}.mp3`
  return { audioUrl, timestamps: [] }
}

export { findActiveTiming, timingDuration } from './recitationTiming'
