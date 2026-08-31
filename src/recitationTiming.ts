export type WordSegment = {
  verseKey: string
  wordIndex: number
  startMs: number
  endMs: number
}

export type VerseTimestamp = {
  verseKey: string
  startMs: number
  endMs: number
  segments?: WordSegment[]
}

export type ChapterAudioTiming = {
  audioUrl: string
  timestamps: VerseTimestamp[]
}

export function normalizeChapterTiming(payload: any): ChapterAudioTiming {
  const audio = payload?.audio_file ?? payload?.audioFile
  const timestamps = Array.isArray(audio?.timestamps) ? audio.timestamps : []
  return {
    audioUrl: audio?.audio_url ?? audio?.audioUrl ?? '',
    timestamps: timestamps.map((item: any) => ({
      verseKey: String(item.verse_key),
      startMs: Number(item.timestamp_from ?? 0),
      endMs: Number(item.timestamp_to ?? 0),
      segments: Array.isArray(item.segments)
        ? item.segments.map((segment: any[]) => ({
            verseKey: String(item.verse_key),
            wordIndex: Number(segment[0]),
            startMs: Number(segment[1]),
            endMs: Number(segment[2]),
          }))
        : undefined,
    })),
  }
}

export function findActiveTiming(timestamps: VerseTimestamp[], timeMs: number) {
  const verse = timestamps.find((item) => timeMs >= item.startMs && timeMs < item.endMs)
  if (!verse) return { verseKey: '', wordIndex: 0, verse }
  const segment = verse.segments?.find((item) => timeMs >= item.startMs && timeMs < item.endMs)
  return { verseKey: verse.verseKey, wordIndex: segment?.wordIndex ?? 0, verse }
}

export function timingDuration(timestamps: VerseTimestamp[]) {
  return timestamps.reduce((max, item) => Math.max(max, item.endMs), 0)
}
