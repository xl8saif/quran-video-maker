import React from 'react'
import type { IntroOutroConfig } from './introOutro'

type Props = { config: IntroOutroConfig; logoUrl?: string | null; visible: boolean }

export function IntroOutroPreview({ config, logoUrl, visible }: Props) {
  if (!visible || !config.enabled) return null
  const effectClass = `intro-outro-${config.effect}`
  return (
    <div className={`intro-outro-preview ${effectClass}`}>
      {config.showLogo && logoUrl ? <img src={logoUrl} alt="Channel logo" /> : null}
      {config.text ? <div className="intro-outro-text">{config.text}</div> : null}
    </div>
  )
}
