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

export type ChapterAudio = {
  audioUrl: string
  timestamps: VerseTiming[]
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

  if (!response.ok) {
    throw new Error(`Quran Foundation request failed (${response.status}).`)
  }

  return response.json() as Promise<T>
}

export async function fetchChapterRecitations(credentials: QuranApiCredentials) {
  return request<{ recitations: ChapterRecitation[] }>(
    '/resources/chapter_reciters',
    credentials,
  )
}

export async function fetchChapterAudio(
  reciterId: number,
  chapterNumber: number,
  credentials: QuranApiCredentials,
  includeSegments = true,
): Promise<ChapterAudio> {
  const data = await request<{
    audio_file?: {
      audio_url?: string
      timestamps?: Array<{
        verse_key: string
        timestamp_from: number
        timestamp_to: number
        duration?: number
        segments?: AudioSegment[]
      }>
    }
    audio_url?: string
    timestamps?: Array<{
      verse_key: string
      timestamp_from: number
      timestamp_to: number
      duration?: number
      segments?: AudioSegment[]
    }>
  }>(
    `/chapter_reciters/${reciterId}/audio_files/${chapterNumber}?segments=${includeSegments}`,
    credentials,
  )

  const source = data.audio_file ?? data
  const timestamps = source.timestamps ?? []

  return {
    audioUrl: source.audio_url ?? '',
    timestamps: timestamps.map(t => ({
      verseKey: t.verse_key,
      startMs: t.timestamp_from,
      endMs: t.timestamp_to,
      segments: t.segments ?? [],
    })),
  }
}

export function findActiveTiming(timings: VerseTiming[], timeMs: number) {
  const verse = timings.find(t => timeMs >= t.startMs && timeMs < t.endMs)
  if (!verse) return null

  const segmentIndex = verse.segments.findIndex(
    ([, start, end]) => timeMs >= start && timeMs < end,
  )

  return {
    verseKey: verse.verseKey,
    segmentIndex,
    wordIndex: segmentIndex < 0 ? null : verse.segments[segmentIndex][0],
  }
}
