export type SequenceSegment = 'intro' | 'quran' | 'outro'

export interface SequenceConfig {
  introDuration: number
  quranDuration: number
  outroDuration: number
  introEnabled: boolean
  outroEnabled: boolean
}

export function getSequenceSegment(time: number, config: SequenceConfig): SequenceSegment {
  const intro = config.introEnabled ? Math.max(0, config.introDuration) : 0
  const quranEnd = intro + Math.max(0, config.quranDuration)
  if (intro > 0 && time < intro) return 'intro'
  if (config.outroEnabled && time >= quranEnd) return 'outro'
  return 'quran'
}

export function getSequenceDuration(config: SequenceConfig): number {
  return (config.introEnabled ? config.introDuration : 0) + config.quranDuration + (config.outroEnabled ? config.outroDuration : 0)
}

export function getSegmentLocalTime(time: number, config: SequenceConfig): number {
  const intro = config.introEnabled ? config.introDuration : 0
  return Math.max(0, time - intro)
}
