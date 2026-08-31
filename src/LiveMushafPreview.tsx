import React from 'react'
import type { MushafStyleId } from './mushafStyles'
import { fetchPage, type ApiVerse } from './mushafApi'

type Props = { styleId: MushafStyleId; page: number; accessToken: string; clientId: string; activeVerse?: string; activeWordIndex?: number; highlight: string; showFinger?: boolean; autoScroll?: boolean; scrollSpeed?: number; onStatus?: (message: string) => void }

export function LiveMushafPreview({ styleId, page, accessToken, clientId, activeVerse, activeWordIndex = 0, highlight, showFinger = true, autoScroll = true, scrollSpeed = 50, onStatus }: Props) {
  const [verses, setVerses] = React.useState<ApiVerse[]>([])
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const pageRef = React.useRef<HTMLDivElement>(null)
  const activeWordRef = React.useRef<HTMLSpanElement>(null)
  const [fingerStyle, setFingerStyle] = React.useState<React.CSSProperties>({ opacity: 0 })

  React.useEffect(() => {
    let cancelled = false
    setLoading(true); setError('')
    fetchPage(page, styleId, { accessToken, clientId }).then(data => {
      if (!cancelled) { setVerses(data.verses || []); onStatus?.(`Live Mushaf page ${page} loaded`) }
    }).catch(e => { if (!cancelled) { setVerses([]); setError(e instanceof Error ? e.message : 'Unable to load Mushaf page'); onStatus?.('Live Mushaf unavailable') } }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [styleId, page, accessToken, clientId, onStatus])

  const lines = React.useMemo(() => {
    const map = new Map<number, { verseKey: string; position: number; text: string }[]>()
    verses.flatMap(v => v.words || []).forEach(w => {
      const text = styleId === 'indo-pak-muhammadi' ? (w.text_indopak || '') : (w.text_qpc_hafs || w.text_uthmani || '')
      if (!text) return
      const line = map.get(w.line_number) || []
      line.push({ verseKey: w.verse_key, position: w.position, text })
      map.set(w.line_number, line)
    })
    return [...map.entries()].sort((a,b) => a[0]-b[0]).map(([line, words]) => [line, words.sort((a,b) => a.position-b.position)] as const)
  }, [verses, styleId])

  React.useEffect(() => {
    if (!autoScroll || !activeWordRef.current) return
    const word = activeWordRef.current
    const pageEl = pageRef.current
    if (!pageEl) return
    const pageRect = pageEl.getBoundingClientRect()
    const wordRect = word.getBoundingClientRect()
    const targetTop = pageRect.top + pageRect.height * 0.48
    const delta = wordRect.top - targetTop
    if (Math.abs(delta) > pageRect.height * 0.08) {
      pageEl.scrollBy({ top: delta * (0.45 + scrollSpeed / 200), behavior: 'smooth' })
    }
  }, [activeVerse, activeWordIndex, autoScroll, scrollSpeed])

  React.useLayoutEffect(() => {
    const word = activeWordRef.current
    const pageEl = pageRef.current
    if (!showFinger || !word || !pageEl) { setFingerStyle({ opacity: 0 }); return }
    const update = () => {
      const wr = word.getBoundingClientRect(); const pr = pageEl.getBoundingClientRect()
      setFingerStyle({ opacity: 1, left: `${wr.left - pr.left + wr.width / 2}px`, top: `${wr.bottom - pr.top + 6}px`, transitionDuration: `${Math.max(100, 500 - scrollSpeed * 4)}ms` })
    }
    update()
    const onResize = () => update()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [activeVerse, activeWordIndex, showFinger, scrollSpeed, lines])

  if (loading) return <div className="live-mushaf-state">Loading verified Mushaf page {page}…</div>
  if (error) return <div className="live-mushaf-state error"><strong>Live Mushaf not loaded</strong><span>{error}</span><small>Enter your Quran Foundation credentials in Settings. They are kept in this browser and are not committed to GitHub.</small></div>
  if (!lines.length) return <div className="live-mushaf-state">No page data returned.</div>

  return <div className="quran-live-page" dir="rtl" ref={pageRef}>
    <div className="live-page-number">{page}</div>
    {showFinger && <div className="live-finger" aria-hidden="true" style={fingerStyle}>☝</div>}
    {lines.map(([lineNumber, words]) => {
      const active = activeVerse ? words.some(w => w.verseKey === activeVerse) : false
      return <div key={lineNumber} className={`live-quran-line ${active ? 'active-line' : ''}`} style={active ? ({ '--highlight': highlight } as React.CSSProperties) : undefined}>
        {words.map((w, i) => <span ref={w.verseKey === activeVerse && i === activeWordIndex ? activeWordRef : null} key={`${w.verseKey}-${w.position}`} className={w.verseKey === activeVerse && i === activeWordIndex ? 'active-live-word' : w.verseKey === activeVerse ? 'active-live-word-soft' : ''}>{w.text} </span>)}
      </div>
    })}
  </div>
}
