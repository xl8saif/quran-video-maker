import React from 'react'
import { IntroOutroConfig } from './introOutro'
import { getSequenceSegment, getSegmentLocalTime, SequenceConfig } from './sequenceTimeline'

type Props = {
  time: number
  quranDuration: number
  intro: IntroOutroConfig
  outro: IntroOutroConfig
  logoUrl?: string | null
  children: React.ReactNode
}

const effectClass: Record<IntroOutroConfig['effect'], string> = {
  fade: 'sequence-fade',
  'slide-up': 'sequence-slide-up',
  'slide-down': 'sequence-slide-down',
  zoom: 'sequence-zoom',
  none: '',
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
  if (segment === 'intro') return <SequenceCard config={intro} logoUrl={logoUrl} localTime={localTime} />
  if (segment === 'outro') return <SequenceCard config={outro} logoUrl={logoUrl} localTime={localTime - quranDuration} />
  return <>{children}</>
}

function SequenceCard({ config, logoUrl, localTime }: { config: IntroOutroConfig; logoUrl?: string | null; localTime: number }) {
  const progress = Math.max(0, Math.min(1, localTime / Math.max(config.duration, 0.001)))
  return <div className={`sequence-card ${effectClass[config.effect]}`} style={{ '--sequence-progress': progress } as React.CSSProperties}>
    {config.background && <img className="sequence-background" src={config.background} alt="" />}
    <div className="sequence-content">
      {config.showLogo && logoUrl && <img className="sequence-logo" src={logoUrl} alt="Channel logo" />}
      <div className="sequence-text">{config.text}</div>
    </div>
  </div>
}
