import React from 'react'
import type { MushafStyleId } from './mushafStyles'
import { fetchPage, type ApiVerse } from './mushafApi'

type Props = { styleId: MushafStyleId; page: number; accessToken: string; clientId: string; activeVerse?: string; activeWordIndex?: number; highlight: string; onStatus?: (message: string) => void }

export function LiveMushafPreview({ styleId, page, accessToken, clientId, activeVerse, activeWordIndex = 0, highlight, onStatus }: Props) {
  const [verses, setVerses] = React.useState<ApiVerse[]>([])
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  React.useEffect(() => {
    let cancelled = false
    setLoading(true); setError('')
    fetchPage(page, styleId, { accessToken, clientId }).then(data => {
      if (!cancelled) { setVerses(data.verses || []); onStatus?.(`Live Mushaf page ${page} loaded`) }
    }).catch(e => { if (!cancelled) { setVerses([]); setError(e instanceof Error ? e.message : 'Unable to load Mushaf page'); onStatus?.('Live Mushaf unavailable') } }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [styleId, page, accessToken, clientId, onStatus])

  const lines = React.useMemo(() => {
    const map = new Map<number, { verseKey: string; text: string }[]>()
    verses.flatMap(v => v.words || []).forEach(w => {
      const text = styleId === 'indo-pak-muhammadi' ? (w.text_indopak || '') : (w.text_qpc_hafs || w.text_uthmani || '')
      if (!text) return
      const line = map.get(w.line_number) || []
      line.push({ verseKey: w.verse_key, text })
      map.set(w.line_number, line)
    })
    return [...map.entries()].sort((a,b) => a[0]-b[0])
  }, [verses, styleId])

  if (loading) return <div className="live-mushaf-state">Loading verified Mushaf page {page}…</div>
  if (error) return <div className="live-mushaf-state error"><strong>Live Mushaf not loaded</strong><span>{error}</span><small>Enter your Quran Foundation credentials in Settings. They are kept in this browser and are not committed to GitHub.</small></div>
  if (!lines.length) return <div className="live-mushaf-state">No page data returned.</div>

  return <div className="quran-live-page" dir="rtl">
    <div className="live-page-number">{page}</div>
    {lines.map(([lineNumber, words]) => {
      const active = activeVerse ? words.some(w => w.verseKey === activeVerse) : false
      return <div key={lineNumber} className={`live-quran-line ${active ? 'active-line' : ''}`} style={active ? ({ '--highlight': highlight } as React.CSSProperties) : undefined}>
        {words.map((w, i) => <span key={`${w.verseKey}-${i}`} className={w.verseKey === activeVerse && i === activeWordIndex ? 'active-live-word' : w.verseKey === activeVerse ? 'active-live-word-soft' : ''}>{w.text} </span>)}
      </div>
    })}
  </div>
}
