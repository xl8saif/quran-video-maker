import { describe, expect, it } from 'vitest'
import { getExportDurationMs, normalizeExportSpeed } from '../src/exportTiming'

describe('export timing', () => {
  it('normalizes valid and invalid playback speeds', () => {
    expect(normalizeExportSpeed(0.75)).toBe(0.75)
    expect(normalizeExportSpeed(1)).toBe(1)
    expect(normalizeExportSpeed(1.25)).toBe(1.25)
    expect(normalizeExportSpeed(1.5)).toBe(1.5)
    expect(normalizeExportSpeed(2)).toBe(2)
    expect(normalizeExportSpeed('1.5')).toBe(1.5)
    expect(normalizeExportSpeed(0)).toBe(1)
    expect(normalizeExportSpeed(Number.NaN)).toBe(1)
    expect(normalizeExportSpeed(10)).toBe(4)
    expect(normalizeExportSpeed(0.1)).toBe(0.25)
  })

  it('converts media duration to wall-clock export duration', () => {
    expect(getExportDurationMs(120000, 0.75)).toBe(160000)
    expect(getExportDurationMs(120000, 1)).toBe(120000)
    expect(getExportDurationMs(120000, 1.25)).toBe(96000)
    expect(getExportDurationMs(120000, 1.5)).toBe(80000)
    expect(getExportDurationMs(120000, 2)).toBe(60000)
  })

  it('returns zero for unavailable media duration', () => {
    expect(getExportDurationMs(0, 1)).toBe(0)
    expect(getExportDurationMs(Number.NaN, 1)).toBe(0)
  })
})
