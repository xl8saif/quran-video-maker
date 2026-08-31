import type { QuranPage, WordCoordinate } from './quranCoordinates'
import { getFingerPoint, type FingerPoint } from './fingerEngine'
import { getActiveWord } from './highlightRenderer'

export interface SyncedFocus {
  word: WordCoordinate | undefined
  finger: FingerPoint | null
  line: number | undefined
}

export function getSyncedFocus(page: QuranPage | undefined, time: number): SyncedFocus {
  const words = page?.lines.flatMap(line => line.words) ?? []
  const index = getActiveWord(time, words.map(word => ({ start: word.start ?? -Infinity, end: word.end ?? Infinity, x: word.x, y: word.y, width: word.width, height: word.height })))
  const word = index >= 0 ? words[index] : undefined
  return {
    word,
    finger: getFingerPoint(word),
    line: word?.line,
  }
}
