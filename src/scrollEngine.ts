export interface ScrollConfig {
  viewportHeight: number
  contentHeight: number
  focusY: number
  focusRatio?: number
  smoothing?: number
  maxSpeed?: number
}

export function getTargetScroll(config: ScrollConfig): number {
  const ratio = config.focusRatio ?? 0.45
  const target = config.focusY - config.viewportHeight * ratio
  return Math.max(0, Math.min(config.contentHeight - config.viewportHeight, target))
}

export function stepScroll(current: number, config: ScrollConfig, deltaSeconds: number): number {
  const target = getTargetScroll(config)
  const smoothing = Math.min(1, Math.max(0, config.smoothing ?? 0.12))
  const distance = target - current
  const maxStep = Math.max(0, config.maxSpeed ?? 900) * Math.max(0, deltaSeconds)
  const step = Math.min(Math.abs(distance) * smoothing, maxStep)
  if (Math.abs(distance) < 0.5) return target
  return current + Math.sign(distance) * step
}

export function getScrollProgress(scrollTop: number, contentHeight: number, viewportHeight: number): number {
  const range = Math.max(1, contentHeight - viewportHeight)
  return Math.max(0, Math.min(1, scrollTop / range))
}
