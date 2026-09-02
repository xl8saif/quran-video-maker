import { describe, expect, it } from 'vitest'
import { isRtlLanguage } from '../src/exportCompositor'

describe('export translation direction', () => {
  it('recognizes supported RTL language codes', () => {
    for (const language of ['ar', 'ar-SA', 'ur', 'ur-PK', 'fa', 'ps', 'ku']) {
      expect(isRtlLanguage(language)).toBe(true)
    }
  })

  it('keeps Latin translation codes LTR', () => {
    for (const language of ['en', 'en-US', 'fr', 'de']) {
      expect(isRtlLanguage(language)).toBe(false)
    }
  })
})
