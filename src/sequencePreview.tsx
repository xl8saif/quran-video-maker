import React from 'react'
import type { IntroOutroConfig } from './introOutro'
import { getSequenceSegment, getSegmentLocalTime, type SequenceConfig } from './sequenceTimeline'

interface Props {
  time: number
  quranDuration: number
  intro: IntroOutroConfig
  outro: IntroOutroConfig
  logoUrl?: string | null
  children: React.ReactNode
}

export function SequencePreview({ time, quranDuration, intro, outro, logoUrl, children }: Props) {
  const config: SequenceConfig = {
    introDuration: intro.duration,
    quranDuration,
    outroDuration: outro.duration,
    introEnabled: intro.enabled,
    outroEnabled: outro.enabled,
  }
  const segment = getSequenceSegment(time, config)
  const localTime = getSegmentLocalTime(time, config)
  const current = segment === 'intro' ? intro : segment === 'outro' ? outro : null

  if (!current) return <>{children}</>

  const progress = current.duration ? Math.min(1, Math.max(0, (segment === 'intro' ? localTime : time - (intro.enabled ? intro.duration : 0) - quranDuration) / current.duration)) : 0
  const effectClass = `intro-outro-${current.effect}`

  return <div className="intro-outro-preview-wrap" data-segment={segment} data-progress={progress}>
    <div className={`intro-outro-preview ${effectClass}`}>
      {current.showLogo && logoUrl && <img src={logoUrl} alt="Channel logo" />}
      <div className="intro-outro-text">{current.text}</div>
    </div>
  </div>
}
