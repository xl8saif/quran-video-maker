import React from 'react'
import { ChapterPageNavigator } from './ChapterPageNavigator'
import { LiveMushafPreview } from '../LiveMushafPreview'
import type { MushafStyleId } from '../mushafStyles'

type Props = {
  chapterNumber: number
  styleId: MushafStyleId
  page: number
  onPageChange: (page: number) => void
  accessToken?: string
  clientId?: string
  activeVerse?: string
  activeWordIndex?: number
  highlight: string
  showFinger?: boolean
  autoScroll?: boolean
  scrollSpeed?: number
  onStatus?: (message: string) => void
  exportCanvasRef?: React.RefObject<HTMLCanvasElement | null>
}

/**
 * Composes chapter-aware page navigation with the existing live Mushaf renderer.
 * The parent remains responsible for the selected chapter and current page state.
 */
export function MushafChapterView({
  chapterNumber,
  styleId,
  page,
  onPageChange,
  accessToken,
  clientId,
  activeVerse,
  activeWordIndex,
  highlight,
  showFinger,
  autoScroll,
  scrollSpeed,
  onStatus,
  exportCanvasRef,
}: Props) {
  return (
    <section className="mushaf-chapter-view" aria-label="Quran Mushaf chapter">
      <ChapterPageNavigator
        chapterNumber={chapterNumber}
        styleId={styleId}
        page={page}
        onPageChange={onPageChange}
      />
      <LiveMushafPreview
        styleId={styleId}
        page={page}
        accessToken={accessToken}
        clientId={clientId}
        activeVerse={activeVerse}
        activeWordIndex={activeWordIndex}
        highlight={highlight}
        showFinger={showFinger}
        autoScroll={autoScroll}
        scrollSpeed={scrollSpeed}
        onStatus={onStatus}
        exportCanvasRef={exportCanvasRef}
      />
    </section>
  )
}
