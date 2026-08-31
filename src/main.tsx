import React from 'react'
import { createRoot } from 'react-dom/client'
import { Play, Pause, Upload, Settings2, Image, Music2, Type, Hand, Languages, Search, RotateCcw } from 'lucide-react'
import './styles.css'

type Word = { text: string; start: number; end: number }
type Ayah = { arabic: string; english: string; urdu: string; words: Word[] }

const demoAyahs: Ayah[] = [
  { arabic: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ', english: 'In the name of Allah, the Most Compassionate, the Most Merciful.', urdu: 'اللہ کے نام سے جو نہایت مہربان، بار بار رحم کرنے والا ہے۔', words: [
    { text: 'بِسْمِ', start: 0, end: 0.55 }, { text: 'اللَّهِ', start: 0.55, end: 1.15 }, { text: 'الرَّحْمَنِ', start: 1.15, end: 1.85 }, { text: 'الرَّحِيمِ', start: 1.85, end: 2.55 }
  ]},
  { arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', english: 'All praise is for Allah—Lord of the worlds.', urdu: 'سب تعریف اللہ ہی کے لیے ہے جو تمام جہانوں کا رب ہے۔', words: [
    { text: 'الْحَمْدُ', start: 2.55, end: 3.15 }, { text: 'لِلَّهِ', start: 3.15, end: 3.7 }, { text: 'رَبِّ', start: 3.7, end: 4.1 }, { text: 'الْعَالَمِينَ', start: 4.1, end: 4.9 }
  ]},
  { arabic: 'الرَّحْمَنِ الرَّحِيمِ', english: 'The Most Compassionate, Most Merciful.', urdu: 'نہایت مہربان، بار بار رحم کرنے والا۔', words: [
    { text: 'الرَّحْمَنِ', start: 4.9, end: 5.65 }, { text: 'الرَّحِيمِ', start: 5.65, end: 6.4 }
  ]},
  { arabic: 'مَالِكِ يَوْمِ الدِّينِ', english: 'Master of the Day of Judgment.', urdu: 'روزِ جزا کا مالک ہے۔', words: [
    { text: 'مَالِكِ', start: 6.4, end: 7.0 }, { text: 'يَوْمِ', start: 7.0, end: 7.5 }, { text: 'الدِّينِ', start: 7.5, end: 8.2 }
  ]},
  { arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', english: 'You alone we worship, and You alone we ask for help.', urdu: 'ہم صرف تیری ہی عبادت کرتے ہیں اور صرف تجھ ہی سے مدد مانگتے ہیں۔', words: [
    { text: 'إِيَّاكَ', start: 8.2, end: 8.8 }, { text: 'نَعْبُدُ', start: 8.8, end: 9.4 }, { text: 'وَإِيَّاكَ', start: 9.4, end: 10.05 }, { text: 'نَسْتَعِينُ', start: 10.05, end: 10.9 }
  ]},
  { arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', english: 'Guide us to the Straight Path.', urdu: 'ہمیں سیدھے راستے کی ہدایت دے۔', words: [
    { text: 'اهْدِنَا', start: 10.9, end: 11.55 }, { text: 'الصِّرَاطَ', start: 11.55, end: 12.2 }, { text: 'الْمُسْتَقِيمَ', start: 12.2, end: 13.05 }
  ]},
  { arabic: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ', english: 'The path of those You have blessed.', urdu: 'ان لوگوں کا راستہ جن پر تو نے انعام فرمایا۔', words: [
    { text: 'صِرَاطَ', start: 13.05, end: 13.6 }, { text: 'الَّذِينَ', start: 13.6, end: 14.25 }, { text: 'أَنْعَمْتَ', start: 14.25, end: 14.95 }, { text: 'عَلَيْهِمْ', start: 14.95, end: 15.7 }
  ]}
]

const surahs = ['Al-Fatiha', 'Al-Baqarah', 'Yasin', 'Al-Mulk', 'Al-Ikhlas', 'Al-Falaq', 'An-Nas']
const highlightColors = { gold: '#d9bd63', green: '#9bcf8a', yellow: '#f0dc55', amber: '#e5a84b' }

function App() {
  const [surah, setSurah] = React.useState('Al-Fatiha')
  const [highlight, setHighlight] = React.useState<keyof typeof highlightColors>('gold')
  const [speed, setSpeed] = React.useState(50)
  const [translation, setTranslation] = React.useState('English')
  const [playing, setPlaying] = React.useState(false)
  const [time, setTime] = React.useState(0)
  const [pageUrl, setPageUrl] = React.useState<string | null>(null)
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null)
  const [audioName, setAudioName] = React.useState('Demo timing')
  const [translationName, setTranslationName] = React.useState('Built-in demo translation')
  const audioRef = React.useRef<HTMLAudioElement>(null)

  const duration = 15.7
  const activeIndex = demoAyahs.findIndex(a => time >= a.words[0].start && time < a.words[a.words.length - 1].end)
  const activeAyah = activeIndex >= 0 ? demoAyahs[activeIndex] : demoAyahs[Math.max(0, demoAyahs.length - 1)]
  const activeWordIndex = activeAyah.words.findIndex(w => time >= w.start && time < w.end)

  React.useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => setTime(t => {
      const next = t + 0.03
      if (next >= duration) { setPlaying(false); return duration }
      return next
    }), 30)
    return () => window.clearInterval(id)
  }, [playing])

  React.useEffect(() => {
    if (audioRef.current) audioRef.current.currentTime = time
  }, [time])

  const handleAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setAudioUrl(url); setAudioName(file.name); setPlaying(false); setTime(0)
  }

  const handlePage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPageUrl(URL.createObjectURL(file))
  }

  const handleTranslation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setTranslationName(file.name)
  }

  const togglePlay = () => {
    if (audioRef.current) {
      if (playing) audioRef.current.pause()
      else audioRef.current.play().catch(() => undefined)
    }
    setPlaying(v => !v)
  }

  const reset = () => { setPlaying(false); setTime(0); if (audioRef.current) audioRef.current.pause() }

  return (
    <div className="app-shell">
      {audioUrl && <audio ref={audioRef} src={audioUrl} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />}
      <header className="topbar">
        <div><div className="brand">Quran Video Maker</div><div className="subtitle">Quran recitation video studio · synchronization prototype</div></div>
        <div className="top-actions"><button className="ghost"><Settings2 size={16}/> Settings</button><button className="primary" onClick={togglePlay}>{playing ? <Pause size={16}/> : <Play size={16}/>} {playing ? 'Pause' : 'Preview'}</button></div>
      </header>

      <main className="workspace">
        <aside className="sidebar left-panel">
          <section className="panel-section"><div className="section-title">Quran</div>
            <label>Surah</label><select value={surah} onChange={e => setSurah(e.target.value)}>{surahs.map(s => <option key={s}>{s}</option>)}</select>
            <div className="two-col"><div><label>From ayah</label><input defaultValue="1" type="number" min="1"/></div><div><label>To ayah</label><input defaultValue="7" type="number" min="1"/></div></div>
            <label>Page source</label><label className="upload-box"><Upload size={18}/><span>{pageUrl ? 'Quran page loaded' : 'Upload Quran page'}</span><small>PNG, JPG, WEBP</small><input hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePage}/></label>
          </section>
          <section className="panel-section"><div className="section-title"><Music2 size={16}/> Recitation</div>
            <select><option>Select reciter</option><option>Online source</option><option>Use uploaded audio</option></select>
            <label className="upload-inline"><Upload size={15}/> {audioName}<input hidden type="file" accept="audio/*" onChange={handleAudio}/></label>
            <small className="hint">Uploaded audio is synchronized to the preview timeline. Verified online audio sources will be added separately.</small>
          </section>
          <section className="panel-section"><div className="section-title"><Languages size={16}/> Translation</div>
            <select value={translation} onChange={e => setTranslation(e.target.value)}><option>None</option><option>English</option><option>Urdu</option><option>Arabic</option><option>English + Urdu</option><option>English + Urdu + Arabic</option></select>
            <label className="upload-inline"><Upload size={15}/> Upload translation<input hidden type="file" accept=".csv,.json,.txt,.srt,.vtt" onChange={handleTranslation}/></label>
            <small className="hint">{translationName} · CSV, JSON, TXT, SRT, VTT</small>
          </section>
        </aside>

        <section className="preview-area">
          <div className="preview-toolbar"><span>LIVE PREVIEW</span><span className="status">{playing ? 'Reciting' : 'Paused'} · {surah}</span></div>
          <div className="stage-wrap"><div className="stage">
            <div className="bg-glow" />
            <div className="quran-page" style={{ transform: `translateY(-${time * speed * 0.16}px)` }}>
              <div className="page-header">سُورَةُ الْفَاتِحَةِ</div>
              {demoAyahs.map((ayah, ai) => <div key={ai} className={`ayah ${ai === activeIndex ? 'active-line' : ''}`} style={ai === activeIndex ? { '--highlight': highlightColors[highlight] } as React.CSSProperties : undefined}>
                <div className="arabic" dir="rtl">{ayah.words.map((w, wi) => <span key={wi} className={ai === activeIndex && wi === activeWordIndex ? 'active-word' : ''}>{w.text} </span>)}</div>
                {((translation === 'English' || translation.includes('English')) && ai === activeIndex) && <div className="translation">{ayah.english}</div>}
                {((translation === 'Urdu' || translation.includes('Urdu')) && ai === activeIndex) && <div className="translation urdu" dir="rtl">{ayah.urdu}</div>}
                {((translation === 'Arabic' || translation.includes('Arabic')) && ai === activeIndex) && <div className="translation arabic-translation" dir="rtl">{ayah.arabic}</div>}
              </div>)}
            </div>
            {pageUrl && <img className="uploaded-page" src={pageUrl} alt="Uploaded Quran page" />}
            <div className="finger" style={{ left: `${58 + activeWordIndex * 4}%`, top: `${34 + activeIndex * 6}%`, transitionDuration: `${Math.max(80, 500 - speed * 3)}ms` }}>☝</div>
            <div className="logo-placeholder">CHANNEL LOGO</div>
            <div className="preview-caption">{activeIndex >= 0 ? `Ayah ${activeIndex + 1} · word ${Math.max(1, activeWordIndex + 1)}` : 'Ready'}</div>
          </div></div>
          <div className="transport"><button className="play-circle" onClick={togglePlay}>{playing ? <Pause size={18}/> : <Play size={18}/>}</button><span>{formatTime(time)}</span><input className="scrub" type="range" min="0" max={duration} step="0.01" value={time} onChange={e => { setPlaying(false); setTime(Number(e.target.value)) }}/><span>{formatTime(duration)}</span><button className="reset" onClick={reset} title="Reset"><RotateCcw size={16}/></button></div>
          <div className="timeline"><div><b>RECITATION</b><span style={{ width: `${(time / duration) * 100}%` }}/></div><div><b>QURAN PAGE</b><span style={{ width: `${(time / duration) * 100}%` }}/></div><div><b>TRANSLATION</b><span style={{ width: `${(time / duration) * 100}%` }}/></div><div><b>HAND + LINE</b><span style={{ width: `${(time / duration) * 100}%` }}/></div></div>
        </section>

        <aside className="sidebar right-panel">
          <section className="panel-section"><div className="section-title"><Hand size={16}/> Focus & Hand</div>
            <label>Scroll speed <strong>{speed}%</strong></label><input type="range" min="0" max="100" value={speed} onChange={e => setSpeed(Number(e.target.value))}/>
            <div className="switch-row"><span>Moving finger</span><input type="checkbox" defaultChecked/></div><div className="switch-row"><span>Active line highlight</span><input type="checkbox" defaultChecked/></div>
            <label>Highlight</label><div className="color-grid">{Object.keys(highlightColors).map(c => <button key={c} className={`color ${c} ${highlight === c ? 'selected' : ''}`} onClick={() => setHighlight(c)} aria-label={c}/>)}</div>
            <label>Opacity</label><input type="range" defaultValue="25"/>
          </section>
          <section className="panel-section"><div className="section-title"><Image size={16}/> Background</div><button className="wide-button"><Search size={15}/> Search free media</button><label className="wide-button"><Upload size={15}/> Upload image / video<input hidden type="file" accept="image/*,video/*"/></label></section>
          <section className="panel-section"><div className="section-title"><Type size={16}/> Branding & Text</div><button className="wide-button">Upload channel logo</button><button className="wide-button">Edit intro</button><button className="wide-button">Edit outro</button></section>
        </aside>
      </main>
    </div>
  )
}

function formatTime(seconds: number) { const m = Math.floor(seconds / 60).toString().padStart(2, '0'); const s = Math.floor(seconds % 60).toString().padStart(2, '0'); return `${m}:${s}` }

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>)
