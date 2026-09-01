import { normalizeChapterTiming, type ChapterAudioTiming } from './recitationTiming'

export const QURAN_CONTENT_API = 'https://apis.quran.foundation/content/api/v4'
export type QuranApiCredentials = { accessToken: string; clientId: string }
export type Reciter = { id: number; reciter_id?: number; reciter_name: string; style?: string; translated_name?: { name?: string } }
export type ChapterRecitation = { id: number; reciter_id: number; reciter_name?: string; style?: string; chapter_number?: number }
export type ChapterAudio = ChapterAudioTiming

async function request<T>(path: string, credentials: QuranApiCredentials): Promise<T> {
  if (!credentials.accessToken || !credentials.clientId) throw new Error('Quran Foundation API credentials are not configured.')
  const response = await fetch(`${QURAN_CONTENT_API}${path}`, { headers: { 'x-auth-token': credentials.accessToken, 'x-client-id': credentials.clientId, accept: 'application/json' } })
  if (!response.ok) throw new Error(`Quran Foundation request failed (${response.status}).`)
  return response.json() as Promise<T>
}

export async function fetchChapterRecitations(credentials: QuranApiCredentials) {
  return request<{ recitations: ChapterRecitation[] }>('/resources/chapter_reciters', credentials)
}

export async function fetchChapterAudio(reciterId: number, chapterNumber: number, credentials: QuranApiCredentials, includeSegments = true): Promise<ChapterAudio> {
  const payload = await request<unknown>(`/chapter_reciters/${reciterId}/audio_files/${chapterNumber}?segments=${includeSegments}`, credentials)
  return normalizeChapterTiming(payload)
}

export { findActiveTiming, timingDuration } from './recitationTiming'
