import React from 'react'
import {
  fetchChapterPagesLookup,
  getChapterPageNumbers,
  getFirstChapterPage,
  type ChapterPagesLookup,
} from './chapterPagesApi'
import type { MushafStyleId } from './mushafStyles'

const SUPPORTED_STYLES = new Set<MushafStyleId>([
  'hafs-arabic-naskh',
  'indo-pak-muhammadi',
])

export function useChapterPages(chapterNumber: number, style: MushafStyleId) {
  const [lookup, setLookup] = React.useState<ChapterPagesLookup | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    let cancelled = false

    if (!SUPPORTED_STYLES.has(style)) {
      setLookup(null)
      setError('This Mushaf style does not have a page-layout mapping yet.')
      return () => { cancelled = true }
    }

    setLoading(true)
    setError('')

    fetchChapterPagesLookup(chapterNumber, style)
      .then(result => {
        if (cancelled) return
        setLookup(result)
      })
      .catch(error => {
        if (cancelled) return
        setLookup(null)
        setError(error instanceof Error ? error.message : 'Unable to load Surah page mapping.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [chapterNumber, style])

  const pageNumbers = React.useMemo(
    () => lookup ? getChapterPageNumbers(lookup) : [],
    [lookup],
  )

  const firstPage = React.useMemo(
    () => lookup ? getFirstChapterPage(lookup) : null,
    [lookup],
  )

  return { lookup, pageNumbers, firstPage, loading, error }
}
