import React from 'react'
import { useChapterPages } from '../useChapterPages'
import type { MushafStyleId } from '../mushafStyles'

type Props = {
  chapterNumber: number
  styleId: MushafStyleId
  page: number
  onPageChange: (page: number) => void
}

export function ChapterPageNavigator({ chapterNumber, styleId, page, onPageChange }: Props) {
  const { pageNumbers, firstPage, loading, error } = useChapterPages(chapterNumber, styleId)
  const currentIndex = pageNumbers.indexOf(page)

  React.useEffect(() => {
    if (firstPage !== null && !pageNumbers.includes(page)) onPageChange(firstPage)
  }, [firstPage, page, pageNumbers, onPageChange])

  const previousPage = currentIndex > 0 ? pageNumbers[currentIndex - 1] : null
  const nextPage = currentIndex >= 0 && currentIndex < pageNumbers.length - 1
    ? pageNumbers[currentIndex + 1]
    : null

  return (
    <div className="chapter-page-navigator" aria-label="Mushaf page navigation">
      <button type="button" className="ghost" disabled={loading || previousPage === null} onClick={() => previousPage !== null && onPageChange(previousPage)}>
        Previous page
      </button>
      <span>
        {loading ? 'Loading pages…' : error ? 'Page mapping unavailable' : pageNumbers.length ? `Page ${page} · ${currentIndex + 1}/${pageNumbers.length}` : 'No pages'}
      </span>
      <button type="button" className="ghost" disabled={loading || nextPage === null} onClick={() => nextPage !== null && onPageChange(nextPage)}>
        Next page
      </button>
    </div>
  )
}
