import { describe, expect, it } from 'vitest'
import { EXPORT_RESOLUTIONS, clampProgress, createDefaultExportOptions, normalizeFilename } from '../src/exportPanel'

describe('export panel helpers', () => {
  it('normalizes output filenames safely', () => {
    expect(normalizeFilename(' My Quran Video.webm ')).toBe('My-Quran-Video.webm')
    expect(normalizeFilename('urdu/video:1')).toBe('urdu-video-1.webm')
    expect(normalizeFilename('')).toBe('quran-video.webm')
  })

  it('clamps progress to the valid export range', () => {
    expect(clampProgress(-10)).toBe(0)
    expect(clampProgress(42.5)).toBe(42.5)
    expect(clampProgress(120)).toBe(100)
  })

  it('provides stable default export settings and dimensions', () => {
    expect(createDefaultExportOptions()).toEqual({
      resolution: '1080p',
      fps: 30,
      mushafStyle: 'hafs-arabic-naskh',
      translationLanguage: 'none',
      filename: 'quran-video.webm',
    })
    expect(EXPORT_RESOLUTIONS['720p']).toEqual({ width: 1280, height: 720 })
    expect(EXPORT_RESOLUTIONS['1080p']).toEqual({ width: 1920, height: 1080 })
    expect(EXPORT_RESOLUTIONS['1440p']).toEqual({ width: 2560, height: 1440 })
    expect(EXPORT_RESOLUTIONS['2160p']).toEqual({ width: 3840, height: 2160 })
  })
})
