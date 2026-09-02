export const MIN_EXPORT_SPEED = 0.25
export const MAX_EXPORT_SPEED = 4

export function normalizeExportSpeed(value: number | string | null | undefined) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) return 1
  return Math.min(MAX_EXPORT_SPEED, Math.max(MIN_EXPORT_SPEED, parsed))
}

export function getExportDurationMs(mediaDurationMs: number, speed: number) {
  const duration = Number(mediaDurationMs)
  if (!Number.isFinite(duration) || duration <= 0) return 0
  return duration / normalizeExportSpeed(speed)
}
