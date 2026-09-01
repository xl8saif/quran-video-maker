export const QURAN_CONTENT_API = 'https://apis.quran.foundation/content/api/v4'

export type QuranApiCredentials = {
  accessToken: string
  clientId: string
}

export type ChapterReciter = {
  id: number
  name: string
  style?: { name?: string; language_name?: string }
  qirat?: { name?: string; language_name?: string }
  translated_name?: { name?: string; language_name?: string }
}

export type AudioSegment = [wordIndex: number, startMs: number, endMs: number]

export type VerseTiming = {
  verseKey: string
  timestampFrom: number
  timestampTo: number
  duration?: number
  segments: AudioSegment[]
}

export type ChapterAudio = {
  id: number
  chapterId: number
  fileSize: number
  format: string
  audioUrl: string
  timestamps?: VerseTiming[]
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

export async function fetchChapterReciters(credentials: QuranApiCredentials, language = 'en') {
  return request<{ reciters: ChapterReciter[] }>(`/resources/chapter_reciters?language=${encodeURIComponent(language)}`, credentials)
}

export async function fetchChapterAudio(
  reciterId: number,
  chapterNumber: number,
  credentials: QuranApiCredentials,
  includeSegments = true,
): Promise<ChapterAudio> {
  const data = await request<{ audio_file: {
    id: number
    chapter_id: number
    file_size: number
    format: string
    audio_url: string
    timestamps?: Array<{
      verse_key: string
      timestamp_from: number
      timestamp_to: number
      duration?: number
      segments?: AudioSegment[]
    }>
  } }>(`/chapter_recitations/${reciterId}/${chapterNumber}?segments=${includeSegments}`, credentials)

  return {
    id: data.audio_file.id,
    chapterId: data.audio_file.chapter_id,
    fileSize: data.audio_file.file_size,
    format: data.audio_file.format,
    audioUrl: data.audio_file.audio_url,
    timestamps: data.audio_file.timestamps?.map(t => ({
      verseKey: t.verse_key,
      timestampFrom: t.timestamp_from,
      timestampTo: t.timestamp_to,
      duration: t.duration,
      segments: t.segments ?? [],
    })),
  }
}

export async function fetchTimestampRange(
  reciterId: number,
  chapterNumber: number,
  credentials: QuranApiCredentials,
) {
  return request<{ result: { timestamp_from: number; timestamp_to: number } }>(
    `/audio/reciters/${reciterId}/timestamp?chapter_number=${chapterNumber}`,
    credentials,
  )
}

export function findActiveTiming(timings: VerseTiming[], timeMs: number) {
  const verse = timings.find(t => timeMs >= t.timestampFrom && timeMs < t.timestampTo)
  if (!verse) return null
  const segmentIndex = verse.segments.findIndex(([, start, end]) => timeMs >= start && timeMs < end)
  return {
    verseKey: verse.verseKey,
    wordIndex: segmentIndex < 0 ? null : verse.segments[segmentIndex][0],
    segmentIndex,
  }
}
