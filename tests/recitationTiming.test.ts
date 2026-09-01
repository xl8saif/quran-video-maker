import { describe, expect, it } from 'vitest'
import { findActiveTiming, normalizeChapterTiming, timingDuration } from '../src/recitationTiming'

describe('recitation timing', () => {
  it('normalizes chapter timing payloads', () => {
    const result = normalizeChapterTiming({
      audio_file: {
        audio_url: 'https://example.test/audio.mp3',
        timestamps: [
          { verse_key: '1:1', timestamp_from: 0, timestamp_to: 2500, segments: [[1, 0, 900], [2, 900, 2500]] },
          { verse_key: '1:2', timestamp_from: 2500, timestamp_to: 5000 },
        ],
      },
    })

    expect(result.audioUrl).toBe('https://example.test/audio.mp3')
    expect(result.timestamps).toHaveLength(2)
    expect(result.timestamps[0].verseKey).toBe('1:1')
    expect(result.timestamps[0].segments?.[1]).toEqual({ verseKey: '1:1', wordIndex: 2, startMs: 900, endMs: 2500 })
    expect(timingDuration(result.timestamps)).toBe(5000)
  })

  it('selects the active verse and word at boundaries', () => {
    const timestamps = normalizeChapterTiming({
      audio_file: {
        timestamps: [
          { verse_key: '1:1', timestamp_from: 0, timestamp_to: 1000, segments: [[1, 0, 500], [2, 500, 1000]] },
          { verse_key: '1:2', timestamp_from: 1000, timestamp_to: 2000 },
        ],
      },
    }).timestamps

    expect(findActiveTiming(timestamps, 0)).toMatchObject({ verseKey: '1:1', wordIndex: 1 })
    expect(findActiveTiming(timestamps, 999)).toMatchObject({ verseKey: '1:1', wordIndex: 2 })
    expect(findActiveTiming(timestamps, 1000)).toMatchObject({ verseKey: '1:2', wordIndex: 0 })
    expect(findActiveTiming(timestamps, 2000)).toMatchObject({ verseKey: '', wordIndex: 0 })
  })

  it('handles missing timing data safely', () => {
    const result = normalizeChapterTiming({})
    expect(result.audioUrl).toBe('')
    expect(result.timestamps).toEqual([])
    expect(timingDuration(result.timestamps)).toBe(0)
    expect(findActiveTiming(result.timestamps, 100)).toMatchObject({ verseKey: '', wordIndex: 0 })
  })
})
