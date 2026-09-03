import React from 'react'
import type { MushafStyleId } from './mushafStyles'
import { fetchPage, type ApiVerse } from './mushafApi'
import { createExportCompositor } from './exportCompositor'
import { useTranslationResources } from './useTranslationResources'
import type { TranslationLanguage } from './translationUiModel'
import { LiveRecitationControls } from './LiveRecitationControls'
import { cacheQuranPage, getCachedQuranPage, quranPageCacheKey } from './quranLocalCache'

type ExportMedia = { url?: string; kind?: 'image' | 'video' | 'upload'; opacity?: number; fit?: 'cover' | 'contain' | 'fill'; x?: number; y?: number }
type ExportLogo = { url?: string; opacity?: number; size?: number; x?: number; y?: number }
type ExportTranslation = { language: string; text: string }
type ExternalTranslation = { key: string; language: TranslationLanguage; title: string; author: string; version: string; entries: Record<string, string> }
type Props = { styleId: MushafStyleId; page: number; accessToken?: string; clientId?: string; chapterNumber?: number; activeVerse?: string; activeWordIndex?: number; highlight: string; showFinger?: boolean; autoScroll?: boolean; scrollSpeed?: number; onStatus?: (message: string) => void; exportCanvasRef?: React.RefObject<HTMLCanvasElement | null>; exportBackground?: ExportMedia; exportLogo?: ExportLogo; exportTranslations?: ExportTranslation[]; translationLanguages?: TranslationLanguage[]; externalTranslations?: ExternalTranslation[]; searchQuery?: string }

function languageLabel(language: TranslationLanguage) { return language === 'en' ? 'English' : language === 'ur' ? 'Urdu' : 'Arabic' }
const quranFont = (styleId: MushafStyleId) => styleId === 'indo-pak-muhammadi' ? 'Muhammadi Quran' : 'Amiri Quran'

function LiveMushafPreviewInner({ styleId, page, accessToken = '', clientId = '', chapterNumber, activeVerse, activeWordIndex = 0, highlight, showFinger = true, autoScroll = true, scrollSpeed = 50, onStatus, exportCanvasRef, exportBackground, exportLogo, exportTranslations = [], translationLanguages = [], externalTranslations = [], searchQuery = '' }: Props) {
  const [verses, setVerses] = React.useState<ApiVerse[]>([])
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [liveActiveVerse, setLiveActiveVerse] = React.useState('')
  const [liveActiveWordIndex, setLiveActiveWordIndex] = React.useState(0)
  const pageRef = React.useRef<HTMLDivElement>(null)
  const activeWordRef = React.useRef<HTMLSpanElement>(null)
  const [fingerStyle, setFingerStyle] = React.useState<React.CSSProperties>({ opacity: 0 })
  const compositorRef = React.useRef<{ draw: () => void; destroy: () => void } | null>(null)
  const { getId } = useTranslationResources()
  const translationLanguageKey = translationLanguages.join('|')
  const translationIds = React.useMemo(() => translationLanguages.map(getId).filter((id): id is number => typeof id === 'number'), [translationLanguageKey, getId])
  const effectiveActiveVerse = liveActiveVerse || activeVerse
  const effectiveActiveWordIndex = liveActiveVerse ? liveActiveWordIndex : activeWordIndex
  const resolvedChapterNumber = chapterNumber || Number(verses[0]?.verse_key?.split(':')[0]) || 1

  React.useEffect(() => {
    let cancelled = false
    const key = quranPageCacheKey(page, styleId)
    setError('')
    setLoading(true)
    void getCachedQuranPage(key).then(cached => {
      if (cancelled || !cached?.length) return
      setVerses(cached); setLoading(false); onStatus?.(`Cached Mushaf page ${page} loaded`)
    })
    fetchPage(page, styleId, { accessToken, clientId }, translationIds).then(data => {
      if (cancelled) return
      const nextVerses = data.verses || []
      setVerses(nextVerses); setError(''); setLoading(false); void cacheQuranPage(key, nextVerses); onStatus?.(`Mushaf page ${page} loaded`)
    }).catch(e => {
      if (cancelled) return
      setLoading(false)
      setVerses(current => { if (current.length) return current; setError(e instanceof Error ? e.message : 'Unable to load Mushaf page'); return [] })
      onStatus?.('Mushaf data unavailable; retrying from local cache')
    })
    return () => { cancelled = true }
  }, [styleId, page, accessToken, clientId, translationIds, onStatus])

  React.useEffect(() => { setLiveActiveVerse(''); setLiveActiveWordIndex(0) }, [resolvedChapterNumber])

  const filteredVerses = React.useMemo(() => {
    const q = searchQuery.trim().toLocaleLowerCase()
    if (!q) return verses
    return verses.filter(verse => {
      const arabic = (verse.words || []).map(word => styleId === 'indo-pak-muhammadi' ? (word.text_indopak || '') : (word.text_qpc_hafs || word.text_uthmani || '')).join(' ')
      const qfText = (verse.translations || []).map(item => item.text || '').join(' ')
      const externalText = externalTranslations.map(source => source.entries[verse.verse_key] || '').join(' ')
      return `${verse.verse_key} ${arabic} ${qfText} ${externalText}`.toLocaleLowerCase().includes(q)
    })
  }, [verses, searchQuery, styleId, externalTranslations])

  const lines = React.useMemo(() => {
    const map = new Map<number, { verseKey: string; position: number; text: string }[]>()
    filteredVerses.flatMap(v => v.words || []).forEach(w => { const text = styleId === 'indo-pak-muhammadi' ? (w.text_indopak || '') : (w.text_qpc_hafs || w.text_uthmani || ''); if (!text) return; const line = map.get(w.line_number) || []; line.push({ verseKey: w.verse_key, position: w.position, text }); map.set(w.line_number, line) })
    return [...map.entries()].sort((a,b) => a[0]-b[0]).map(([line, words]) => [line, words.sort((a,b) => a.position-b.position)] as const)
  }, [filteredVerses, styleId])

  const activeWord = React.useMemo(() => effectiveActiveVerse ? (verses.find(v => v.verse_key === effectiveActiveVerse)?.words || [])[effectiveActiveWordIndex] || null : null, [verses, effectiveActiveVerse, effectiveActiveWordIndex])

  React.useEffect(() => {
    if (!autoScroll || !activeWordRef.current || !pageRef.current || !effectiveActiveVerse) return
    activeWordRef.current.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
  }, [autoScroll, effectiveActiveVerse, effectiveActiveWordIndex, activeWord])

  const drawMushaf = React.useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#17120c'; ctx.textAlign = 'right'; ctx.direction = 'rtl'
    const lineHeight = Math.max(34, height / Math.max(lines.length + 2, 10)); const startY = Math.max(55, (height - lineHeight * lines.length) / 2 + lineHeight)
    lines.forEach(([, words], index) => {
      const isActive = effectiveActiveVerse ? words.some(w => w.verseKey === effectiveActiveVerse) : false
      let x = width - 70
      const y = startY + index * lineHeight
      ctx.font = `${Math.max(24, Math.min(52, width / 25))}px '${quranFont(styleId)}'`
      words.forEach(word => {
        const active = Boolean(effectiveActiveVerse && word.verseKey === effectiveActiveVerse && activeWord && word.position === activeWord.position)
        ctx.fillStyle = active ? highlight : isActive ? '#806b45' : '#17120c'
        ctx.fillText(word.text, x, y)
        x -= ctx.measureText(word.text + ' ').width
      })
    })
  }, [lines, effectiveActiveVerse, activeWord, highlight, styleId])

  React.useEffect(() => {
    const canvas = exportCanvasRef?.current
    if (!canvas || !lines.length) return
    let cancelled = false
    compositorRef.current?.destroy(); compositorRef.current = null
    const prepare = async () => {
      try { await document.fonts.load(`40px '${quranFont(styleId)}'`) } catch {}
      if (cancelled) return
      const compositor = await createExportCompositor({ canvas, width: canvas.width || 1280, height: canvas.height || 720, background: exportBackground, logo: exportLogo, translations: exportTranslations, drawMushaf })
      if (cancelled) compositor.destroy(); else compositorRef.current = compositor
    }
    void prepare().catch(errorValue => { if (!cancelled) onStatus?.(errorValue instanceof Error ? errorValue.message : 'Export compositor failed') })
    return () => { cancelled = true; compositorRef.current?.destroy(); compositorRef.current = null }
  }, [exportCanvasRef, exportBackground, exportLogo, exportTranslations, drawMushaf, lines.length, onStatus, styleId])

  React.useLayoutEffect(() => { const word = activeWordRef.current, pageEl = pageRef.current; if (!showFinger || !word || !pageEl) { setFingerStyle({ opacity: 0 }); return }; const update = () => { const wr = word.getBoundingClientRect(), pr = pageEl.getBoundingClientRect(); setFingerStyle({ opacity: 1, left: `${wr.left - pr.left + wr.width / 2}px`, top: `${wr.bottom - pr.top + 6}px`, transitionDuration: `${Math.max(100, 500 - scrollSpeed * 4)}ms` }) }; update(); window.addEventListener('resize', update); pageEl.addEventListener('scroll', update, { passive: true }); return () => { window.removeEventListener('resize', update); pageEl.removeEventListener('scroll', update) } }, [effectiveActiveVerse, effectiveActiveWordIndex, showFinger, scrollSpeed, lines, activeWord])

  const translationRows = React.useMemo(() => verses.map(verse => ({ verse, translations: (verse.translations || []).map(item => { const language = translationLanguages.find(candidate => getId(candidate) === item.resource_id); return language ? { ...item, language } : null }).filter((item): item is NonNullable<typeof item> => Boolean(item)) })).filter(row => row.translations.length), [verses, translationLanguages, getId])
  const exportCanvas = exportCanvasRef && <canvas ref={exportCanvasRef} width={1280} height={720} aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }} />
  const liveBackground = exportBackground?.url ? (exportBackground.kind === 'video' ? <video className="live-player-background" src={exportBackground.url} autoPlay muted loop playsInline preload="auto" aria-hidden="true" /> : <img className="live-player-background" src={exportBackground.url} alt="" aria-hidden="true" />) : null

  if (loading && !verses.length) return <div className="live-mushaf-state"><strong>Loading bundled Mushaf page {page}</strong><small>Preparing local Quran text and page data…</small>{exportCanvas}</div>
  if (error && !verses.length) return <div className="live-mushaf-state error"><strong>Mushaf page unavailable</strong><span>{error}</span><small>The app will use locally cached Quran pages when available.</small>{exportCanvas}</div>
  if (!lines.length) return <div className="live-mushaf-state">{searchQuery ? 'No matching verses on this page.' : 'No page data returned.'}{exportCanvas}</div>
  return <div className="quran-live-page" dir="rtl" translate="no" ref={pageRef}>
    {liveBackground}
    <div className="live-page-number">{page}</div>
    {showFinger && <div className="live-finger" aria-hidden="true" style={fingerStyle}>☝</div>}
    <div dir="ltr" style={{ direction: 'ltr', marginBottom: 12 }}><LiveRecitationControls chapterNumber={resolvedChapterNumber} onSync={(verseKey, wordIndex) => { setLiveActiveVerse(verseKey); setLiveActiveWordIndex(wordIndex) }} onStatus={onStatus}/></div>
    {lines.map(([lineNumber, words]) => { const active = effectiveActiveVerse ? words.some(w => w.verseKey === effectiveActiveVerse) : false; return <div key={lineNumber} className={`live-quran-line ${active ? 'active-line' : ''}`} style={{ fontFamily: `'${quranFont(styleId)}', serif`, ...(active ? ({ '--highlight': highlight } as React.CSSProperties) : {}) }}>{words.map(w => { const isActiveWord = Boolean(effectiveActiveVerse && w.verseKey === effectiveActiveVerse && activeWord && w.position === activeWord.position); return <span ref={isActiveWord ? activeWordRef : null} key={`${w.verseKey}-${w.position}`} className={isActiveWord ? 'active-live-word' : w.verseKey === effectiveActiveVerse ? 'active-live-word-soft' : ''}>{w.text} </span> })}</div> })}
    <div className="live-translations" translate="no">
      {translationRows.map(({verse, translations}) => <div key={verse.verse_key} className="live-translation-verse"><span className="live-translation-key">{verse.verse_key}</span>{translations.map(item => <div key={`${item.resource_id}-${item.language}`} className={`live-translation live-translation-${item.language}`} dir={item.language === 'en' ? 'ltr' : 'rtl'}><span className="live-translation-label">{languageLabel(item.language)}</span><span dangerouslySetInnerHTML={{ __html: item.text }} /></div>)}</div>)}
      {externalTranslations.map(source => filteredVerses.filter(verse => source.entries[verse.verse_key]).map(verse => <div key={`${source.key}-${verse.verse_key}`} className="live-translation-verse"><span className="live-translation-key">{verse.verse_key}</span><div className={`live-translation live-translation-${source.language}`} dir={source.language === 'en' ? 'ltr' : 'rtl'}><span className="live-translation-label">{languageLabel(source.language)} · {source.title}</span><span>{source.entries[verse.verse_key]}</span></div></div>))}
    </div>
    {exportCanvas}
  </div>
}

function sameValue<T>(a: T | undefined, b: T | undefined) {
  return Object.is(a, b) || JSON.stringify(a) === JSON.stringify(b)
}

const liveMushafPropsEqual = (previous: Props, next: Props) =>
  previous.styleId === next.styleId &&
  previous.page === next.page &&
  previous.accessToken === next.accessToken &&
  previous.clientId === next.clientId &&
  previous.chapterNumber === next.chapterNumber &&
  previous.activeVerse === next.activeVerse &&
  previous.activeWordIndex === next.activeWordIndex &&
  previous.highlight === next.highlight &&
  previous.showFinger === next.showFinger &&
  previous.autoScroll === next.autoScroll &&
  previous.scrollSpeed === next.scrollSpeed &&
  previous.exportCanvasRef === next.exportCanvasRef &&
  previous.onStatus === next.onStatus &&
  sameValue(previous.exportBackground, next.exportBackground) &&
  sameValue(previous.exportLogo, next.exportLogo) &&
  sameValue(previous.exportTranslations, next.exportTranslations) &&
  sameValue(previous.translationLanguages, next.translationLanguages) &&
  sameValue(previous.externalTranslations, next.externalTranslations) &&
  previous.searchQuery === next.searchQuery

export const LiveMushafPreview = React.memo(LiveMushafPreviewInner, liveMushafPropsEqual)
