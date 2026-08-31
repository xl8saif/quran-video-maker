import type { QuranPage } from './quranCoordinates'
import { getSyncedFocus } from './fingerHighlightSync'
import { getTargetScroll } from './scrollEngine'

export interface SynchronizedFrameState {
  time: number
  wordId?: string
  line?: number
  fingerX?: number
  fingerY?: number
  scrollTop: number
}

export function getSynchronizedFrame(page: QuranPage | undefined, time: number, viewportHeight: number, contentHeight: number, currentScroll = 0): SynchronizedFrameState {
  const focus = getSyncedFocus(page, time)
  const focusY = focus.word ? focus.word.y + focus.word.height / 2 : viewportHeight * 0.45
  const targetScroll = getTargetScroll({ viewportHeight, contentHeight, focusY })
  return {
    time,
    wordId: focus.word?.id,
    line: focus.line,
    fingerX: focus.finger?.x,
    fingerY: focus.finger?.y,
    scrollTop: targetScroll,
  }
}

export function interpolateScroll(current: number, target: number, amount = 0.18): number {
  const t = Math.max(0, Math.min(1, amount))
  return current + (target - current) * t
}
