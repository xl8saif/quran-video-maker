import React from 'react'
import type { MushafStyleId } from './mushafStyles'
import { fetchPage, type ApiVerse } from './mushafApi'
import { createExportCompositor } from './exportCompositor'
import { useTranslationResources } from './useTranslationResources'
import type { TranslationLanguage } from './translationUiModel'
import { LiveRecitationControls } from './LiveRecitationControls'

type ExportMedia = { url?: string; kind?: 'image' | 'video' | 'upload'; opacity?: number; fit?: 'cover' | 'contain' | 'fill'; x?: number; y?: number }
type ExportLogo = { url?: string; opacity?: number; size?: number; x?: number; y?: number }
type ExportTranslation = { language: string; text: string }
type Props = { styleId: MushafStyleId; page: number; accessToken?: string; clientId?: string; chapterNumber?: number; activeVerse?: string; activeWordIndex?: number; highlight: string; showFinger?: boolean; autoScroll?: boolean; scrollSpeed?: number; onStatus?: (message: string) => void; exportCanvasRef?: React.RefObject<HTMLCanvasElement | null>; exportBackground?: ExportMedia; exportLogo?: ExportLogo; exportTranslations?: ExportTranslation[]; translationLanguages?: TranslationLanguage[] }

function languageLabel(language: TranslationLanguage) { return language === 'en' ? 'English' : language === 'ur' ? 'Urdu' : 'Arabic' }

export function LiveMushafPreview({ styleId, page, accessToken = '', clientId = '', chapterNumber, activeVerse, activeWordIndex = 0, highlight, showFinger = true, autoScroll = true, scrollSpeed = 50, onStatus, exportCanvasRef, exportBackground, exportLogo, exportTranslations = [], translationLanguages = [] }: Props) {
  const [verses, setVerses] = React.useState<ApiVerse[]>([])
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [liveActiveVerse, setLiveActiveVerse] = React.useState('')
  const [liveActiveWordIndex, setLiveActiveWordIndex] = React.useState(0)
  const pageRef = React.useRef<HTMLDivElement>(null)
  const activeWordRef = React.useRef<HTMLSpanElement>(null)
  const [fingerStyle, setFingerStyle] = React.useState<React.CSSProperties>({ opacity: 0 })
  const compositorRef = React.useRef<{ draw: () => void; destroy: () => void } | null>(null)
  const { getId, loading: translationsLoading } = useTranslationResources()
  const translationIds = React.useMemo(() => translationLanguages.map(getId).filter((id): id is number => typeof id === 'number'), [translationLanguages, getId])
  const effectiveActiveVerse = liveActiveVerse || activeVerse
  const effectiveActiveWordIndex = liveActiveVerse ? liveActiveWordIndex : activeWordIndex
  const resolvedChapterNumber = chapterNumber || Number(verses[0]?.verse_key?.split(':')[0]) || 1

  React.useEffect(() => {
    let cancelled = false
    setLoading(true); setError('')
    fetchPage(page, styleId, { accessToken, clientId }, translationIds).then(data => { if (!cancelled) { setVerses(data.verses || []); onStatus?.(`Live Mushaf page ${page} loaded`) } }).catch(e => { if (!cancelled) { setVerses([]); setError(e instanceof Error ? e.message : 'Unable to load Mushaf page'); onStatus?.('Live Mushaf unavailable') } }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [styleId, page, accessToken, clientId, translationIds, onStatus])

  React.useEffect(() => { setLiveActiveVerse(''); setLiveActiveWordIndex(0) }, [resolvedChapterNumber])

  const lines = React.useMemo(() => {
    const map = new Map<number, { verseKey: string; position: number; text: string }[]>()
    verses.flatMap(v => v.words || []).forEach(w => { const text = styleId === 'indo-pak-muhammadi' ? (w.text_indopak || '') : (w.text_qpc_hafs || w.text_uthmani || ''); if (!text) return; const line = map.get(w.line_number) || []; line.push({ verseKey: w.verse_key, position: w.position, text }); map.set(w.line_number, line) })
    return [...map.entries()].sort((a,b) => a[0]-b[0]).map(([line, words]) => [line, words.sort((a,b) => a.position-b.position)] as const)
  }, [verses, styleId])

  const activeWord = React.useMemo(() => effectiveActiveVerse ? (verses.find(v => v.verse_key === effectiveActiveVerse)?.words || [])[effectiveActiveWordIndex] || null : null, [verses, effectiveActiveVerse, effectiveActiveWordIndex])

  React.useEffect(() => {
    if (!autoScroll || !activeWordRef.current || !pageRef.current || !effectiveActiveVerse) return
    activeWordRef.current.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
  }, [autoScroll, effectiveActiveVerse, effectiveActiveWordIndex, activeWord])

  const drawMushaf = React.useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#17120c'; ctx.textAlign = 'right'; ctx.direction = 'rtl'
    const lineHeight = Math.max(34, height / Math.max(lines.length + 2, 10)); const startY = Math.max(55, (height - lineHeight * lines.length) / 2 + lineHeight)
    lines.forEach(([, words], index) => { const isActive = effectiveActiveVerse ? words.some(w => w.verseKey === effectiveActiveVerse) : false; let x = width - 70; const y = startY + index * lineHeight; ctx.font = `${Math.max(24, Math.min(52, width / 25))}px serif`; words.forEach(word => { const active = Boolean(effectiveActiveVerse && word.verseKey === effectiveActiveVerse && activeWord && word.position === activeWord.position); ctx.fillStyle = active ? highlight : isActive ? '#806b45' : '#17120c'; ctx.fillText(word.text, x, y); x -= ctx.measureText(word.text + ' ').width }) })
  }, [lines, effectiveActiveVerse, activeWord, highlight])

  React.useEffect(() => {
    const canvas = exportCanvasRef?.current
    if (!canvas || !lines.length) return
    let cancelled = false
    compositorRef.current?.destroy(); compositorRef.current = null
    void createExportCompositor({ canvas, width: canvas.width || 1280, height: canvas.height || 720, background: exportBackground, logo: exportLogo, translations: exportTranslations, drawMushaf }).then(compositor => { if (cancelled) compositor.destroy(); else compositorRef.current = compositor }).catch(errorValue => { if (!cancelled) onStatus?.(errorValue instanceof Error ? errorValue.message : 'Export compositor failed') })
    return () => { cancelled = true; compositorRef.current?.destroy(); compositorRef.current = null }
  }, [exportCanvasRef, exportBackground, exportLogo, exportTranslations, drawMushaf, lines.length, onStatus])

  React.useLayoutEffect(() => { const word = activeWordRef.current, pageEl = pageRef.current; if (!showFinger || !word || !pageEl) { setFingerStyle({ opacity: 0 }); return }; const update = () => { const wr = word.getBoundingClientRect(), pr = pageEl.getBoundingClientRect(); setFingerStyle({ opacity: 1, left: `${wr.left - pr.left + wr.width / 2}px`, top: `${wr.bottom - pr.top + 6}px`, transitionDuration: `${Math.max(100, 500 - scrollSpeed * 4)}ms` }) }; update(); window.addEventListener('resize', update); pageEl.addEventListener('scroll', update, { passive: true }); return () => { window.removeEventListener('resize', update); pageEl.removeEventListener('scroll', update) } }, [effectiveActiveVerse, effectiveActiveWordIndex, showFinger, scrollSpeed, lines, activeWord])

  const translationRows = React.useMemo(() => verses.map(verse => ({ verse, translations: (verse.translations || []).map(item => { const language = translationLanguages.find(candidate => getId(candidate) === item.resource_id); return language ? { ...item, language } : null }).filter((item): item is NonNullable<typeof item> => Boolean(item)) })).filter(row => row.translations.length), [verses, translationLanguages, getId])

  if (loading || translationsLoading && translationLanguages.length > 0 && !verses.length) return <div className="live-mushaf-state">Loading verified Mushaf page {page}…</div>
  if (error) return <div className="live-mushaf-state error"><strong>Live Mushaf not loaded</strong><span>{error}</span><small>The app could not retrieve this Mushaf page through its secure backend connection.</small></div>
  if (!lines.length) return <div className="live-mushaf-state">No page data returned.</div>
  return <div className="quran-live-page" dir="rtl" translate="no" ref={pageRef}>
    <div className="live-page-number">{page}</div>
    {showFinger && <div className="live-finger" aria-hidden="true" style={fingerStyle}>☝</div>}
    <div dir="ltr" style={{ direction: 'ltr', marginBottom: 12 }}><LiveRecitationControls chapterNumber={resolvedChapterNumber} onSync={(verseKey, wordIndex) => { setLiveActiveVerse(verseKey); setLiveActiveWordIndex(wordIndex) }} onStatus={onStatus}/></div>
    {lines.map(([lineNumber, words]) => { const active = effectiveActiveVerse ? words.some(w => w.verseKey === effectiveActiveVerse) : false; return <div key={lineNumber} className={`live-quran-line ${active ? 'active-line' : ''}`} style={active ? ({ '--highlight': highlight } as React.CSSProperties) : undefined}>{words.map(w => { const isActiveWord = Boolean(effectiveActiveVerse && w.verseKey === effectiveActiveVerse && activeWord && w.position === activeWord.position); return <span ref={isActiveWord ? activeWordRef : null} key={`${w.verseKey}-${w.position}`} className={isActiveWord ? 'active-live-word' : w.verseKey === effectiveActiveVerse ? 'active-live-word-soft' : ''}>{w.text} </span> })}</div> })}
    <div className="live-translations" translate="no">{translationRows.map(({verse, translations}) => <div key={verse.verse_key} className="live-translation-verse"><span className="live-translation-key">{verse.verse_key}</span>{translations.map(item => <div key={`${item.resource_id}-${item.language}`} className={`live-translation live-translation-${item.language}`} dir={item.language === 'en' ? 'ltr' : 'rtl'}><span className="live-translation-label">{languageLabel(item.language)}</span><span dangerouslySetInnerHTML={{ __html: item.text }} /></div>)}</div>)}</div>
    {exportCanvasRef && <canvas ref={exportCanvasRef} width={1280} height={720} aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }} />}
  </div>
}
