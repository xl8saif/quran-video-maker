import type { IntroOutroConfig } from './introOutro'
import { getSequenceDuration, getSequenceSegment, getSegmentLocalTime, type SequenceConfig } from './sequenceTimeline'

export interface EditorSequenceState {
  intro: IntroOutroConfig
  outro: IntroOutroConfig
  quranDuration: number
  currentTime: number
}

export function createSequenceConfig(state: EditorSequenceState): SequenceConfig {
  return {
    introDuration: state.intro.duration,
    quranDuration: state.quranDuration,
    outroDuration: state.outro.duration,
    introEnabled: state.intro.enabled,
    outroEnabled: state.outro.enabled,
  }
}

export function getEditorTimeline(state: EditorSequenceState) {
  const config = createSequenceConfig(state)
  return {
    totalDuration: getSequenceDuration(config),
    segment: getSequenceSegment(state.currentTime, config),
    quranLocalTime: getSegmentLocalTime(state.currentTime, config),
  }
}

export function clampEditorTime(time: number, state: EditorSequenceState): number {
  const total = getSequenceDuration(createSequenceConfig(state))
  return Math.min(total, Math.max(0, Number.isFinite(time) ? time : 0))
}
