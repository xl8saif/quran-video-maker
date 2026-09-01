import { normalizeChapterTiming, type ChapterAudioTiming } from './recitationTiming'

export type QuranApiCredentials = { accessToken?: string; clientId?: string }
export type Reciter = { id: number; reciter_id?: number; reciter_name: string; style?: string; translated_name?: { name?: string } }
export type ChapterRecitation = { id: number; reciter_id: number; reciter_name?: string; style?: string; chapter_number?: number }
export type ChapterAudio = ChapterAudioTiming

async function request<T>(path: string, _credentials?: QuranApiCredentials): Promise<T> {
  const response = await fetch(`/api/quran/content${path}`, {
    headers: { accept: 'application/json' },
  })
  if (!response.ok) throw new Error(`Quran Foundation request failed (${response.status}).`)
  return response.json() as Promise<T>
}

export async function fetchChapterRecitations(credentials?: QuranApiCredentials) {
  return request<{ recitations: ChapterRecitation[] }>('/resources/chapter_reciters', credentials)
}

export async function fetchChapterAudio(reciterId: number, chapterNumber: number, credentials?: QuranApiCredentials, includeSegments = true): Promise<ChapterAudio> {
  const payload = await request<unknown>(`/chapter_reciters/${reciterId}/audio_files/${chapterNumber}?segments=${includeSegments}`, credentials)
  return normalizeChapterTiming(payload)
}

export { findActiveTiming, timingDuration } from './recitationTiming'
