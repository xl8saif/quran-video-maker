import type { MushafStyleId } from './mushafStyles'
import { fetchPage, type MushafApiConfig } from './mushafApi'

/** Small in-memory page cache for seamless Mushaf page transitions. */
export class PagePrefetcher {
  private cache = new Map<string, unknown>()
  private pending = new Map<string, Promise<unknown>>()

  private key(style: MushafStyleId, page: number) { return `${style}:${page}` }

  async get(page: number, style: MushafStyleId, config: MushafApiConfig) {
    const key = this.key(style, page)
    const cached = this.cache.get(key)
    if (cached) return cached
    const existing = this.pending.get(key)
    if (existing) return existing

    const request = fetchPage(page, style, config).then(data => {
      this.cache.set(key, data)
      this.pending.delete(key)
      return data
    }).catch(error => {
      this.pending.delete(key)
      throw error
    })
    this.pending.set(key, request)
    return request
  }

  prefetch(page: number | undefined, style: MushafStyleId, config: MushafApiConfig) {
    if (!page || page < 1 || !config.accessToken || !config.clientId) return
    void this.get(page, style, config).catch(() => undefined)
  }

  prefetchAdjacent(currentPage: number, style: MushafStyleId, config: MushafApiConfig, minPage = 1, maxPage = Infinity) {
    if (currentPage > minPage) this.prefetch(currentPage - 1, style, config)
    if (currentPage < maxPage) this.prefetch(currentPage + 1, style, config)
  }

  clear() { this.cache.clear(); this.pending.clear() }
}
