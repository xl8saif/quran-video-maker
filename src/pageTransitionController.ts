import type { MushafStyleId } from './mushafStyles'
import type { MushafApiConfig } from './mushafApi'
import { PagePrefetcher } from './pagePrefetcher'

export type PageTransitionState = {
  currentPage: number
  loading: boolean
  error?: string
}

/** Coordinates page loading and adjacent-page prefetching without interrupting audio. */
export class PageTransitionController {
  readonly prefetcher = new PagePrefetcher()
  private requestId = 0

  async loadPage(page: number, style: MushafStyleId, config: MushafApiConfig, onState?: (state: PageTransitionState) => void) {
    const id = ++this.requestId
    onState?.({ currentPage: page, loading: true })
    try {
      const data = await this.prefetcher.get(page, style, config)
      if (id !== this.requestId) return undefined
      onState?.({ currentPage: page, loading: false })
      return data
    } catch (error) {
      if (id !== this.requestId) return undefined
      const message = error instanceof Error ? error.message : 'Unable to load Mushaf page.'
      onState?.({ currentPage: page, loading: false, error: message })
      throw error
    }
  }

  prepareNeighbors(page: number, style: MushafStyleId, config: MushafApiConfig, maxPage: number) {
    this.prefetcher.prefetchAdjacent(page, style, config, 1, maxPage)
  }

  cancelStaleLoads() { this.requestId++ }
  clear() { this.requestId++; this.prefetcher.clear() }
}
