import { normalizeChapterTiming, type ChapterAudioTiming } from './recitationTiming'

export type QuranApiCredentials = { accessToken?: string; clientId?: string }
export type Reciter = { id: number; reciter_id?: number; reciter_name?: string; name?: string; style?: string; translated_name?: { name?: string } }
export type ChapterRecitation = { id: number; reciter_id?: number; reciter_name?: string; name?: string; style?: string; chapter_number?: number }
export type ChapterAudio = ChapterAudioTiming

type ReciterResponse = { reciters?: Array<Record<string, unknown>> }

async function request<T>(path: string, _credentials?: QuranApiCredentials): Promise<T> {
  const response = await fetch(`/api/quran/content${path}`, { headers: { accept: 'application/json' } })
  if (!response.ok) throw new Error(`Quran Foundation request failed (${response.status}).`)
  return response.json() as Promise<T>
}

export async function fetchChapterRecitations(credentials?: QuranApiCredentials): Promise<{ recitations: Reciter[] }> {
  const data = await request<ReciterResponse>('/resources/chapter_reciters', credentials)
  const reciters = Array.isArray(data.reciters) ? data.reciters : []
  return {
    recitations: reciters.map((item) => ({
      id: Number(item.id),
      reciter_id: Number(item.id),
      reciter_name: typeof item.name === 'string' ? item.name : undefined,
      name: typeof item.name === 'string' ? item.name : undefined,
      style: typeof (item.style as Record<string, unknown> | undefined)?.name === 'string'
        ? String((item.style as Record<string, unknown>).name)
        : undefined,
    })).filter((item) => Number.isInteger(item.id) && item.id > 0),
  }
}

export async function fetchChapterAudio(reciterId: number, chapterNumber: number, credentials?: QuranApiCredentials, includeSegments = true): Promise<ChapterAudio> {
  if (!Number.isInteger(reciterId) || reciterId < 1) throw new Error('Invalid reciter.')
  if (!Number.isInteger(chapterNumber) || chapterNumber < 1 || chapterNumber > 114) throw new Error('Invalid Surah number.')
  const payload = await request<unknown>(`/chapter_reciters/${reciterId}/audio_files/${chapterNumber}?segments=${includeSegments}`, credentials)
  return normalizeChapterTiming(payload)
}

export { findActiveTiming, timingDuration } from './recitationTiming'
