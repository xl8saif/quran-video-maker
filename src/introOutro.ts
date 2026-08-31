export type IntroOutroEffect = 'fade' | 'slide-up' | 'slide-down' | 'zoom' | 'none'

export interface IntroOutroConfig {
  enabled: boolean
  text: string
  duration: number
  effect: IntroOutroEffect
  showLogo: boolean
  background?: string
}

export const defaultIntro: IntroOutroConfig = {
  enabled: false,
  text: 'Quran Video Maker',
  duration: 3,
  effect: 'fade',
  showLogo: true,
}

export const defaultOutro: IntroOutroConfig = {
  enabled: false,
  text: 'Subscribe for more Quran recitations',
  duration: 3,
  effect: 'fade',
  showLogo: true,
}

export function clampDuration(value: number): number {
  return Math.min(15, Math.max(1, value || 1))
}
