import type { ChapterAudioTiming } from './recitationTiming'
import { findActiveTiming, timingDuration } from './recitationTiming'

export type RecitationSyncState = {
  timeMs: number
  durationMs: number
  verseKey: string
  wordIndex: number
}

export function syncAudioElement(
  audio: HTMLAudioElement,
  timing: ChapterAudioTiming,
  onSync: (state: RecitationSyncState) => void,
) {
  const handleTime = () => {
    const timeMs = audio.currentTime * 1000
    const active = findActiveTiming(timing.timestamps, timeMs)
    onSync({
      timeMs,
      durationMs: Math.max(audio.duration * 1000 || 0, timingDuration(timing.timestamps)),
      verseKey: active.verseKey,
      wordIndex: active.wordIndex,
    })
  }

  audio.addEventListener('timeupdate', handleTime)
  audio.addEventListener('loadedmetadata', handleTime)
  audio.addEventListener('seeked', handleTime)

  return () => {
    audio.removeEventListener('timeupdate', handleTime)
    audio.removeEventListener('loadedmetadata', handleTime)
    audio.removeEventListener('seeked', handleTime)
  }
}

export async function fetchChapterTiming(
  endpoint: string,
  chapterNumber: number,
  reciterId: number,
  accessToken: string,
  clientId: string,
): Promise<ChapterAudioTiming> {
  const url = new URL(endpoint.replace(/\/$/, '') + `/${reciterId}/${chapterNumber}`)
  url.searchParams.set('segments', 'true')
  const response = await fetch(url, {
    headers: {
      'x-auth-token': accessToken,
      'x-client-id': clientId,
    },
  })
  if (!response.ok) throw new Error(`Recitation request failed: ${response.status}`)
  const payload = await response.json()
  const { normalizeChapterTiming } = await import('./recitationTiming')
  return normalizeChapterTiming(payload)
}
