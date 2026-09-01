export const QURAN_CONTENT_API = 'https://apis.quran.foundation/content/api/v4'

export type QuranApiCredentials = {
  accessToken: string
  clientId: string
}

export type Reciter = {
  id: number
  reciter_id?: number
  reciter_name: string
  style?: string
  translated_name?: { name?: string }
}

export type ChapterRecitation = {
  id: number
  reciter_id: number
  reciter_name?: string
  style?: string
  chapter_number?: number
}

export type AudioSegment = [wordIndex: number, startMs: number, endMs: number]

export type VerseTiming = {
  verseKey: string
  startMs: number
  endMs: number
  segments: AudioSegment[]
}

async function request<T>(path: string, credentials: QuranApiCredentials): Promise<T> {
  if (!credentials.accessToken || !credentials.clientId) {
    throw new Error('Quran Foundation API credentials are not configured.')
  }

  const response = await fetch(`${QURAN_CONTENT_API}${path}`, {
    headers: {
      'x-auth-token': credentials.accessToken,
      'x-client-id': credentials.clientId,
      accept: 'application/json',
    },
  })

  if (!response.ok) throw new Error(`Quran Foundation request failed (${response.status}).`)
  return response.json() as Promise<T>
}

export async function fetchChapterRecitations(credentials: QuranApiCredentials) {
  return request<{ recitations: ChapterRecitation[] }>('/resources/chapter_reciters', credentials)
}

export async function fetchChapterAudio(
  reciterId: number,
  chapterNumber: number,
  credentials: QuranApiCredentials,
  includeSegments = true,
) {
  return request<{ audio_url: string; timestamps?: VerseTiming[] }>(
    `/chapter_reciters/${reciterId}/audio_files/${chapterNumber}?segments=${includeSegments}`,
    credentials,
  )
}

export async function fetchTimestampRange(
  reciterId: number,
  chapterNumber: number,
  credentials: QuranApiCredentials,
) {
  return request<{ timestamps: VerseTiming[] }>(
    `/audio/reciter/${reciterId}/timestamp?chapter_number=${chapterNumber}`,
    credentials,
  )
}

export function findActiveTiming(timings: VerseTiming[], timeMs: number) {
  const verse = timings.find(t => timeMs >= t.startMs && timeMs < t.endMs)
  if (!verse) return null
  const segmentIndex = verse.segments.findIndex(([, start, end]) => timeMs >= start && timeMs < end)
  return { verseKey: verse.verseKey, segmentIndex: segmentIndex < 0 ? 0 : segmentIndex }
}
