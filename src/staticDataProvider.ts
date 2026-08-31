import type { MushafStyleId } from './mushafStyles'

export type StaticQuranWord = {
  id: string
  verseKey: string
  text: string
  position: number
  pageNumber: number
  lineNumber: number
  startMs?: number
  endMs?: number
}

export type StaticQuranPage = {
  pageNumber: number
  style: MushafStyleId
  words: StaticQuranWord[]
}

/**
 * GitHub Pages-safe data provider.
 *
 * Production Quran/Mushaf assets should be placed under public/data only after
 * their redistribution terms have been verified. This provider deliberately
 * returns null when no licensed static dataset is bundled, instead of falling
 * back to invented Quran content.
 */
export class StaticDataProvider {
  private cache = new Map<string, StaticQuranPage | null>()

  async getPage(style: MushafStyleId, pageNumber: number): Promise<StaticQuranPage | null> {
    const key = `${style}:${pageNumber}`
    if (this.cache.has(key)) return this.cache.get(key)!

    const url = `/data/mushaf/${style}/pages/${pageNumber}.json`
    try {
      const response = await fetch(url, { headers: { Accept: 'application/json' } })
      if (!response.ok) {
        this.cache.set(key, null)
        return null
      }
      const data = await response.json() as StaticQuranPage
      if (!data || data.pageNumber !== pageNumber || data.style !== style || !Array.isArray(data.words)) {
        this.cache.set(key, null)
        return null
      }
      this.cache.set(key, data)
      return data
    } catch {
      this.cache.set(key, null)
      return null
    }
  }

  async prefetch(style: MushafStyleId, pageNumbers: number[]) {
    await Promise.all(pageNumbers.filter(p => p > 0).map(p => this.getPage(style, p)))
  }

  clear() { this.cache.clear() }
}

export const staticDataProvider = new StaticDataProvider()
