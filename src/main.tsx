import React from 'react'
import { BookOpen, Download, ExternalLink, Image as ImageIcon, Languages, Search, Upload, Video, X } from 'lucide-react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import './mobile.css'
import { mushafStyles, defaultMushafStyle, type MushafStyleId } from './mushafStyles'
import { surahCatalog } from './surahCatalog'
import { LiveMushafPreview } from './LiveMushafPreview'
import { createUploadedBackground, type BackgroundMedia } from './backgroundMedia'
import { BUILTIN_BACKGROUND_SOURCES, FREE_MEDIA_DIRECTORIES } from './builtinBackgrounds'
import { createAppRuntime } from './appRuntime'
import { useLiveChapters } from './useLiveChapters'
import { useChapterPages } from './useChapterPages'
import { findLiveChapter, getLiveChapterName, getLiveChapterArabicName, getLiveChapterAyahCount } from './liveChapterSelection'
import { fetchQuranEncSurah, fetchQuranEncTranslations, type QuranEncTranslation } from './quranEncApi'
import type { ExportPanelOptions } from './exportPanel'
import type { TranslationLanguage } from './translationUiModel'

type UILanguage = 'en' | 'ur' | 'ar'
type ExternalSource = { key:string; language:TranslationLanguage; title:string; author:string; version:string; entries:Record<string,string> }

const ui = {
  en: { quran:'Quran', surah:'Surah', mushaf:'Mushaf style', page:'Page', search:'Search Quran', searchPage:'Search this page', translations:'Translations', library:'Open translation library', add:'Add', remove:'Remove', language:'Language', preview:'Preview', reset:'Reset', play:'Play', pause:'Pause', export:'Export video', download:'Download WebM', background:'Background', logo:'Logo', resolution:'Resolution', frameRate:'Frame rate', source:'Source', noSources:'No open translation sources found.', loading:'Loading verified Quran data…', sourceNote:'Quran text: Tanzil / Quran Foundation. Translations: QuranEnc.', attribution:'Quran data provided by Quran Foundation. Translation content © QuranEnc and its named publishers.', external:'Open translation sources', searchTranslations:'Search translations', close:'Close', builtIn:'Built-in media', freeSources:'Free media sources', choose:'Use', upload:'Upload', defaultLogo:'Waraq logo', customLogo:'Custom logo', cloudLogo:'CloudTrans logo' },
  ur: { quran:'قرآن', surah:'سورۃ', mushaf:'مصحف کا انداز', page:'صفحہ', search:'قرآن تلاش کریں', searchPage:'اس صفحے پر تلاش کریں', translations:'تراجم', library:'اوپن ترجمہ لائبریری', add:'شامل کریں', remove:'ہٹائیں', language:'زبان', preview:'پیش منظر', reset:'ری سیٹ', play:'چلائیں', pause:'روکیں', export:'ویڈیو ایکسپورٹ کریں', download:'WebM ڈاؤن لوڈ', background:'پس منظر', logo:'لوگو', resolution:'ریزولوشن', frameRate:'فریم ریٹ', source:'ماخذ', noSources:'کوئی اوپن ترجمہ ماخذ نہیں ملا۔', loading:'مصدقہ قرآن ڈیٹا لوڈ ہو رہا ہے…', sourceNote:'قرآن متن: Tanzil / Quran Foundation۔ تراجم: QuranEnc۔', attribution:'قرآن ڈیٹا Quran Foundation فراہم کرتا ہے۔ ترجمہ مواد QuranEnc اور متعلقہ ناشرین کا ہے۔', external:'اوپن ترجمہ ماخذ', searchTranslations:'تراجم تلاش کریں', close:'بند کریں', builtIn:'ایپ میں موجود میڈیا', freeSources:'مفت میڈیا ذرائع', choose:'استعمال کریں', upload:'اپ لوڈ', defaultLogo:'Waraq لوگو', customLogo:'اپنا لوگو', cloudLogo:'CloudTrans لوگو' },
  ar: { quran:'القرآن', surah:'السورة', mushaf:'نمط المصحف', page:'الصفحة', search:'البحث في القرآن', searchPage:'البحث في هذه الصفحة', translations:'الترجمات', library:'مكتبة الترجمات المفتوحة', add:'إضافة', remove:'إزالة', language:'اللغة', preview:'المعاينة', reset:'إعادة ضبط', play:'تشغيل', pause:'إيقاف', export:'تصدير الفيديو', download:'تنزيل WebM', background:'الخلفية', logo:'الشعار', resolution:'الدقة', frameRate:'معدل الإطارات', source:'المصدر', noSources:'لم يتم العثور على مصادر ترجمة مفتوحة.', loading:'جارٍ تحميل بيانات القرآن الموثقة…', sourceNote:'نص القرآن: Tanzil / Quran Foundation. الترجمات: QuranEnc.', attribution:'بيانات القرآن من Quran Foundation. محتوى الترجمة من QuranEnc وناشريها المذكورين.', external:'مصادر الترجمات المفتوحة', searchTranslations:'البحث في الترجمات', close:'إغلاق', builtIn:'وسائط مدمجة', freeSources:'مصادر وسائط مجانية', choose:'استخدام', upload:'رفع', defaultLogo:'شعار Waraq', customLogo:'شعار مخصص', cloudLogo:'شعار CloudTrans' },
} as const

const DEFAULT_LOGO = 'https://raw.githubusercontent.com/xl8saif/xl8saif.github.io/main/public/images/waraq-logo.png'
const CLOUDTRANS_LOGO = 'https://raw.githubusercontent.com/xl8saif/xl8saif.github.io/main/public/images/CloudTrans-Logo%20-%20Copy.PNG'

function App(){
 const [uiLang,setUiLang]=React.useState<UILanguage>('en')
 const [surahNumber,setSurahNumber]=React.useState(1)
 const [mushafStyle,setMushafStyle]=React.useState<MushafStyleId>(defaultMushafStyle)
 const [searchQuery,setSearchQuery]=React.useState('')
 const [translationSearch,setTranslationSearch]=React.useState('')
 const [showLibrary,setShowLibrary]=React.useState(false)
 const [selectedSources,setSelectedSources]=React.useState<string[]>([])
 const [sourceEntries,setSourceEntries]=React.useState<Record<string,Record<string,string>>>({})
 const [sourceCatalog,setSourceCatalog]=React.useState<Record<string,QuranEncTranslation>>({})
 const [libraryLoading,setLibraryLoading]=React.useState(false)
 const [sourceLoading,setSourceLoading]=React.useState(false)
 const [status,setStatus]=React.useState('')
 const [background,setBackground]=React.useState<BackgroundMedia|null>(null)
 const [backgroundOpacity,setBackgroundOpacity]=React.useState(35)
 const [logoUrl,setLogoUrl]=React.useState<string|null>(DEFAULT_LOGO)
 const [logoChoice,setLogoChoice]=React.useState('waraq')
 const [exporting,setExporting]=React.useState(false)
 const [exportProgress,setExportProgress]=React.useState(0)
 const [exportUrl,setExportUrl]=React.useState<string|null>(null)
 const [exportOptions,setExportOptions]=React.useState<ExportPanelOptions>({resolution:'1080p',fps:30,mushafStyle:defaultMushafStyle,translationLanguage:'none',filename:'waraq-quran-reel.webm'})
 const audioRef=React.useRef<HTMLAudioElement>(null)
 const exportCanvasRef=React.useRef<HTMLCanvasElement>(null)
 const runtimeRef=React.useRef(createAppRuntime())
 const t=ui[uiLang]
 const dir=uiLang==='en'?'ltr':'rtl'
 const {chapters:liveChapters,loading:chaptersLoading}=useLiveChapters(uiLang)
 const {firstPage,loading:pageLoading,error:pageError}=useChapterPages(surahNumber,mushafStyle)
 const selectedLiveChapter=findLiveChapter(liveChapters,surahNumber)
 const staticSurah=surahCatalog.find(s=>s.number===surahNumber)!
 const selectedSurah=selectedLiveChapter?{number:selectedLiveChapter.id,name:getLiveChapterName(selectedLiveChapter,staticSurah?.name||'Surah'),arabic:getLiveChapterArabicName(selectedLiveChapter)||staticSurah?.arabic||'',ayahs:getLiveChapterAyahCount(selectedLiveChapter)||staticSurah?.ayahs||0}:staticSurah
 const chapterOptions=liveChapters.length?liveChapters:surahCatalog.map(s=>({id:s.number,name_simple:s.name,name_arabic:s.arabic,verses_count:s.ayahs}))

 React.useEffect(()=>{let cancelled=false;setLibraryLoading(true);Promise.all([fetchQuranEncTranslations('en'),fetchQuranEncTranslations('ur'),fetchQuranEncTranslations('ar')]).then(groups=>{if(cancelled)return;const next:Record<string,QuranEncTranslation>={};groups.flat().forEach(item=>{if(item?.key)next[`${item.language_iso_code}:${item.key}`]=item});setSourceCatalog(next);const defaults=groups.map(group=>group[0]).filter(Boolean);setSelectedSources(previous=>previous.length?previous:defaults.map(item=>`${item.language_iso_code}:${item.key}`));}).catch(()=>setStatus('Unable to load QuranEnc translation library.')).finally(()=>{if(!cancelled)setLibraryLoading(false)});return()=>{cancelled=true}},[])
 React.useEffect(()=>{let cancelled=false;const active=selectedSources.map(id=>sourceCatalog[id]).filter(Boolean);if(!active.length)return;setSourceLoading(true);Promise.all(active.map(async source=>{const verses=await fetchQuranEncSurah(source.key,surahNumber);const entries:Record<string,string>={};verses.forEach(v=>{entries[`${v.sura}:${v.aya}`]=v.translation});return [source.language_iso_code+':'+source.key,entries] as const})).then(results=>{if(cancelled)return;setSourceEntries(previous=>{const next={...previous};results.forEach(([id,entries])=>{next[id]=entries});return next})}).catch(()=>setStatus('Unable to load the selected translation.')).finally(()=>{if(!cancelled)setSourceLoading(false)});return()=>{cancelled=true}},[selectedSources,sourceCatalog,surahNumber])
 React.useEffect(()=>()=>{runtimeRef.current.destroy();if(exportUrl)URL.revokeObjectURL(exportUrl);if(background?.url&&background.kind==='upload')URL.revokeObjectURL(background.url);if(logoUrl?.startsWith('blob:'))URL.revokeObjectURL(logoUrl)},[])
 React.useEffect(()=>runtimeRef.current.subscribe(state=>{setExporting(state.status==='recording');setExportProgress(state.progress);if(state.blobUrl)setExportUrl(previous=>{if(previous&&previous!==state.blobUrl)URL.revokeObjectURL(previous);return state.blobUrl??null});if(state.status==='error')setStatus(state.error||'Export failed')}),[])
 React.useEffect(()=>{runtimeRef.current.setMedia({canvas:exportCanvasRef.current!,audio:audioRef.current})},[])

 const externalTranslations=selectedSources.map(id=>{const source=sourceCatalog[id];if(!source)return null;return {key:id,language:source.language_iso_code as TranslationLanguage,title:source.title,author:source.title,version:source.version,entries:sourceEntries[id]||{}}}).filter(Boolean) as ExternalSource[]
 const filteredSources=Object.entries(sourceCatalog).filter(([id,source])=>{const q=translationSearch.trim().toLocaleLowerCase();return !q||`${id} ${source.title} ${source.description} ${source.version}`.toLocaleLowerCase().includes(q)})
 const selectedLanguage=externalTranslations[0]?.language
 const exportTranslations=externalTranslations.map(source=>{const text=source.entries[`${surahNumber}:1`];return text?{language:source.language,text}:null}).filter(Boolean) as {language:string;text:string}[]
 const startExport=()=>{runtimeRef.current.startExport({...exportOptions,mushafStyle});setStatus('Exporting video…')}
 const handleBackground=(file:File)=>{const uploaded=createUploadedBackground(file);setBackground(previous=>{if(previous?.url&&previous.kind==='upload')URL.revokeObjectURL(previous.url);return uploaded})}
 const handleLogo=(file:File)=>{const url=URL.createObjectURL(file);setLogoChoice('custom');setLogoUrl(previous=>{if(previous?.startsWith('blob:'))URL.revokeObjectURL(previous);return url})}
 const selectBuiltin=(media:BackgroundMedia)=>{setBackground(media);setStatus(`${media.name} selected`)}
 const chooseLogo=(choice:string)=>{setLogoChoice(choice);if(choice==='waraq')setLogoUrl(DEFAULT_LOGO);else if(choice==='cloudtrans')setLogoUrl(CLOUDTRANS_LOGO)}
 const setLanguage=(lang:UILanguage)=>setUiLang(lang)

 return <div className={`app-shell theme-${uiLang}`} data-ui-language={uiLang} dir={dir}>
  <header className="topbar">
   <div className="brand-logo glass-logo"><img src={DEFAULT_LOGO} alt="Waraq" /></div>
   <div className="title-block"><h1>Waraq Quran Reel Maker</h1><div className="subtitle">{t.sourceNote}</div><nav className="language-switcher" aria-label={t.language}>{(['en','ar','ur'] as UILanguage[]).map(lang=><button type="button" key={lang} className={uiLang===lang?'active':''} aria-pressed={uiLang===lang} onClick={()=>setLanguage(lang)}>{lang==='en'?'En':lang==='ar'?'Ar':'Ur'}</button>)}</nav></div>
   <div className="brand-logo glass-logo"><img src={CLOUDTRANS_LOGO} alt="CloudTrans" /></div>
  </header>
  <main className="workspace">
   <aside className="sidebar left-panel">
    <section className="panel-section"><div className="section-title" data-testid="quran-section-title"><BookOpen size={16}/>{t.quran}</div>
      <label>{t.surah}</label><select aria-label="Surah selector" value={surahNumber} onChange={e=>{setSurahNumber(Number(e.target.value));setSearchQuery('')}}>{chapterOptions.map(s=><option key={s.id} value={s.id}>{s.id}. {s.name_simple} — {s.name_arabic||''}</option>)}</select>
      <small className="hint">{selectedSurah.ayahs} ayahs · {selectedSurah.arabic}{chaptersLoading?' · …':''}</small>
      <label>{t.mushaf}</label><select value={mushafStyle} onChange={e=>setMushafStyle(e.target.value as MushafStyleId)}>{mushafStyles.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select>
      <label>{t.page}</label><input type="number" min="1" value={firstPage||1} readOnly />
      <small className="hint">{pageLoading?t.loading:pageError||'Live page mapping ready'}</small>
      <label className="search-box"><Search size={16}/><input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder={t.searchPage}/>{searchQuery&&<button type="button" onClick={()=>setSearchQuery('')} aria-label={t.close}><X size={14}/></button>}</label>
    </section>
    <section className="panel-section"><div className="section-title"><Languages size={16}/>{t.translations}</div>
      <button type="button" className="wide-button" onClick={()=>setShowLibrary(true)}>{t.library}</button>
      <div className="selected-source-list">{externalTranslations.map(source=><div className="source-chip" key={source.key}><span>{source.language.toUpperCase()} · {source.title}</span><button type="button" onClick={()=>setSelectedSources(list=>list.filter(id=>id!==source.key))} aria-label={t.remove}><X size={13}/></button></div>)}</div>
      <small className="hint">{sourceLoading?'Loading selected translations…':t.attribution}</small>
    </section>
    <section className="panel-section background-section"><div className="section-title">{t.background}</div>
      <div className="media-grid">{BUILTIN_BACKGROUND_SOURCES.map(media=><button type="button" className={`media-card ${background?.id===media.id?'selected':''}`} key={media.id} onClick={()=>selectBuiltin(media)} aria-label={`Use ${media.name}`}>
        <span className="media-thumb" aria-hidden="true">{media.kind==='video'?<video src={media.thumbnailUrl||media.url} muted playsInline preload="metadata" />:<img src={media.thumbnailUrl||media.url} alt="" loading="lazy"/>}<span className="media-type">{media.kind==='video'?<Video size={12}/>:<ImageIcon size={12}/>}</span></span>
        <span className="media-card-text"><strong>{media.name}</strong><small>{media.license}</small></span>
      </button>)}</div>
      <div className="media-source-row">{FREE_MEDIA_DIRECTORIES.map(source=><a key={source.id} href={source.url} target="_blank" rel="noreferrer" className="source-button"><ExternalLink size={13}/>{source.name}</a>)}</div>
      <label className="upload-box"><Upload size={18}/><span>{background?.name||t.upload}</span><small>Image or video</small><input hidden type="file" accept="image/*,video/*" onChange={e=>{const f=e.target.files?.[0];if(f)handleBackground(f)}}/></label>
      <label>Opacity</label><input type="range" min="0" max="100" value={backgroundOpacity} onChange={e=>setBackgroundOpacity(Number(e.target.value))}/>
    </section>
    <section className="panel-section"><div className="section-title">{t.logo}</div>
      <div className="logo-choice-row"><button type="button" className={logoChoice==='waraq'?'selected':''} onClick={()=>chooseLogo('waraq')}>{t.defaultLogo}</button><button type="button" className={logoChoice==='cloudtrans'?'selected':''} onClick={()=>chooseLogo('cloudtrans')}>{t.cloudLogo}</button></div>
      <label className="upload-box"><span>{logoChoice==='custom'?t.customLogo:t.logo}</span><small>PNG / JPG / WEBP</small><input hidden type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(f)handleLogo(f)}}/></label>
    </section>
   </aside>
   <section className="preview-area">
    <div className="preview-toolbar"><div><strong>{t.preview}</strong><span>{selectedSurah.name} · {selectedSurah.arabic}</span></div></div>
    <div className="stage"><LiveMushafPreview styleId={mushafStyle} page={firstPage||1} chapterNumber={surahNumber} highlight="#d9bd63" showFinger autoScroll scrollSpeed={50} onStatus={setStatus} exportCanvasRef={exportCanvasRef} exportBackground={background?{url:background.url,kind:background.kind,opacity:backgroundOpacity/100,fit:'cover'}:undefined} exportLogo={logoUrl?{url:logoUrl,opacity:1,size:12,x:88,y:90}:undefined} exportTranslations={exportTranslations} externalTranslations={externalTranslations} searchQuery={searchQuery} /></div>
    <div className="preview-footer"><span>{selectedSurah.name} · {selectedSurah.ayahs} ayahs</span><span>{t.sourceNote}</span></div>
   </section>
   <section className="panel-section export-controls"><div className="section-title">{t.export}</div><label>{t.resolution}<select value={exportOptions.resolution} onChange={e=>setExportOptions(o=>({...o,resolution:e.target.value as ExportPanelOptions['resolution']}))}><option value="720p">720p</option><option value="1080p">1080p</option><option value="1440p">1440p</option><option value="2160p">4K</option></select></label><label>{t.frameRate}<select value={exportOptions.fps} onChange={e=>setExportOptions(o=>({...o,fps:Number(e.target.value) as ExportPanelOptions['fps']}))}><option value={24}>24 FPS</option><option value={30}>30 FPS</option><option value={60}>60 FPS</option></select></label><label>{t.language}<select value={selectedLanguage||'en'} onChange={e=>{const lang=e.target.value as TranslationLanguage;const source=externalTranslations.find(item=>item.language===lang);if(source)setSelectedSources([source.key])}}><option value="en">English</option><option value="ur">Urdu</option><option value="ar">Arabic</option></select></label><button type="button" className="primary wide-button" disabled={exporting} onClick={startExport}>{exporting?`Exporting ${Math.round(exportProgress)}%`:t.export}</button>{exportUrl&&<a className="download-link" href={exportUrl} download={exportOptions.filename}><Download size={15}/>{t.download}</a>}</section>
  </main>
  <footer className="statusbar"><span>{status||t.attribution}</span><span>{t.sourceNote}</span></footer>
  {showLibrary&&<div className="modal-backdrop" onClick={()=>setShowLibrary(false)}><section className="translation-library" onClick={e=>e.stopPropagation()} dir={dir}><header><div><strong>{t.external}</strong><small>{libraryLoading?'Loading…':`${filteredSources.length} sources`}</small></div><button type="button" onClick={()=>setShowLibrary(false)} aria-label={t.close}><X/></button></header><label className="search-box"><Search size={16}/><input value={translationSearch} onChange={e=>setTranslationSearch(e.target.value)} placeholder={t.searchTranslations}/></label><div className="translation-list">{filteredSources.map(([id,source])=>{const selected=selectedSources.includes(id);return <div className={`translation-item ${selected?'selected':''}`} key={id}><div><strong>{source.title}</strong><small>{source.language_iso_code.toUpperCase()} · v{source.version}</small><p>{source.description}</p></div><button type="button" className={selected?'ghost':'primary'} onClick={()=>setSelectedSources(list=>selected?list.filter(x=>x!==id):[...list,id])}>{selected?t.remove:t.add}</button></div>})}{!filteredSources.length&&<div className="empty-data"><h3>{t.noSources}</h3></div>}</div><footer>{t.attribution}</footer></section></div>}
 </div>
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>)
