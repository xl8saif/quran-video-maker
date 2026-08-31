import React from 'react'
import type { MushafStyleId } from './mushafStyles'
import { fetchChapterPages } from './mushafApi'

type PageBoundary = { from: string; to: string; first_verse_key?: string; last_verse_key?: string }
type LookupResponse = { pages?: Record<string, PageBoundary>; total_page?: number }

type Config = { accessToken: string; clientId: string }

export class PageSyncController {
  private lookup = new Map<string, LookupResponse>()
  private loading = new Map<string, Promise<LookupResponse>>()

  async getChapterPages(chapter: number, style: MushafStyleId, config: Config): Promise<LookupResponse> {
    const key = `${style}:${chapter}`
    const cached = this.lookup.get(key)
    if (cached) return cached
    const pending = this.loading.get(key)
    if (pending) return pending
    const request = fetchChapterPages(chapter, style, config).then((data) => {
      this.lookup.set(key, data)
      this.loading.delete(key)
      return data
    }).catch((error) => {
      this.loading.delete(key)
      throw error
    })
    this.loading.set(key, request)
    return request
  }

  async getPageForVerse(chapter: number, verse: number, style: MushafStyleId, config: Config) {
    const data = await this.getChapterPages(chapter, style, config)
    const key = `${chapter}:${verse}`
    const entry = Object.entries(data.pages || {}).find(([, page]) => {
      const from = page.from || page.first_verse_key || ''
      const to = page.to || page.last_verse_key || ''
      return compareVerseKeys(from, key) <= 0 && compareVerseKeys(key, to) <= 0
    })
    return entry ? Number(entry[0]) : undefined
  }

  clear() { this.lookup.clear() }
}

function compareVerseKeys(a: string, b: string) {
  const [ac, av] = a.split(':').map(Number)
  const [bc, bv] = b.split(':').map(Number)
  return (ac - bc) || (av - bv)
}

export type AutoPageSyncProps = {
  chapter: number
  activeVerse?: string
  style: MushafStyleId
  accessToken: string
  clientId: string
  currentPage: number
  onPageChange: (page: number) => void
  enabled?: boolean
}

/** Keeps the rendered Mushaf page aligned with the currently recited verse. */
export function useAutoPageSync({ chapter, activeVerse, style, accessToken, clientId, currentPage, onPageChange, enabled = true }: AutoPageSyncProps) {
  const controller = React.useMemo(() => new PageSyncController(), [])
  React.useEffect(() => {
    if (!enabled || !activeVerse || !accessToken || !clientId) return
    const [activeChapter, activeAyah] = activeVerse.split(':').map(Number)
    if (activeChapter !== chapter || !activeAyah) return
    let cancelled = false
    controller.getPageForVerse(chapter, activeAyah, style, { accessToken, clientId }).then(page => {
      if (!cancelled && page && page !== currentPage) onPageChange(page)
    }).catch(() => undefined)
    return () => { cancelled = true }
  }, [chapter, activeVerse, style, accessToken, clientId, currentPage, onPageChange, enabled, controller])
  return controller
}
