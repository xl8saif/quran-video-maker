import type { ChapterAudioTiming } from './recitationTiming'
import { syncAudioElement, type RecitationSyncState } from './recitationController'

export type SyncTarget = {
  verseKey: string
  wordIndex: number
  timeMs: number
  durationMs: number
}

export function connectRecitationToMushaf(
  audio: HTMLAudioElement,
  timing: ChapterAudioTiming,
  onTarget: (target: SyncTarget) => void,
) {
  return syncAudioElement(audio, timing, (state: RecitationSyncState) => {
    onTarget({
      verseKey: state.verseKey,
      wordIndex: state.wordIndex,
      timeMs: state.timeMs,
      durationMs: state.durationMs,
    })
  })
}

export function seekToWord(
  audio: HTMLAudioElement,
  timing: ChapterAudioTiming,
  verseKey: string,
  wordIndex: number,
) {
  const verse = timing.timestamps.find(item => item.verseKey === verseKey)
  const segment = verse?.segments?.find(item => item.wordIndex === wordIndex)
  if (!segment) return false
  audio.currentTime = segment.startMs / 1000
  return true
}

export function getWordTarget(
  timing: ChapterAudioTiming,
  verseKey: string,
  wordIndex: number,
) {
  const verse = timing.timestamps.find(item => item.verseKey === verseKey)
  const segment = verse?.segments?.find(item => item.wordIndex === wordIndex)
  if (!segment) return null
  return { verseKey, wordIndex, startMs: segment.startMs, endMs: segment.endMs }
}
