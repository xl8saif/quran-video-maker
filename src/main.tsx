import React from 'react'
import { createRoot } from 'react-dom/client'
import { Play, Upload, Settings2, Image, Music2, Type, Hand, Languages } from 'lucide-react'
import './styles.css'

const surahs = ['Al-Fatiha', 'Al-Baqarah', 'Yasin', 'Al-Mulk', 'Al-Ikhlas', 'Al-Falaq', 'An-Nas']

function App() {
  const [surah, setSurah] = React.useState('Al-Fatiha')
  const [highlight, setHighlight] = React.useState('gold')
  const [speed, setSpeed] = React.useState(50)
  const [translation, setTranslation] = React.useState('English')

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <div className="brand">Quran Video Maker</div>
          <div className="subtitle">Browser-based Quran recitation video studio</div>
        </div>
        <div className="top-actions">
          <button className="ghost"><Settings2 size={16}/> Settings</button>
          <button className="primary"><Play size={16}/> Preview</button>
        </div>
      </header>

      <main className="workspace">
        <aside className="sidebar left-panel">
          <section className="panel-section">
            <div className="section-title">Quran</div>
            <label>Surah</label>
            <select value={surah} onChange={e => setSurah(e.target.value)}>
              {surahs.map(s => <option key={s}>{s}</option>)}
            </select>
            <div className="two-col">
              <div><label>From ayah</label><input defaultValue="1" type="number" min="1"/></div>
              <div><label>To ayah</label><input defaultValue="7" type="number" min="1"/></div>
            </div>
            <label>Page source</label>
            <div className="upload-box"><Upload size={18}/><span>Upload Quran page</span><small>PNG, JPG, WEBP</small></div>
          </section>

          <section className="panel-section">
            <div className="section-title"><Music2 size={16}/> Recitation</div>
            <select><option>Select reciter</option><option>Use uploaded audio</option></select>
            <div className="upload-inline"><Upload size={15}/> Upload audio</div>
          </section>

          <section className="panel-section">
            <div className="section-title"><Languages size={16}/> Translation</div>
            <select value={translation} onChange={e => setTranslation(e.target.value)}>
              <option>None</option><option>English</option><option>Urdu</option><option>Arabic</option><option>English + Urdu</option><option>English + Urdu + Arabic</option>
            </select>
            <div className="upload-inline"><Upload size={15}/> Upload translation</div>
            <small className="hint">CSV, JSON, TXT, SRT, VTT</small>
          </section>
        </aside>

        <section className="preview-area">
          <div className="preview-toolbar">
            <span>LIVE PREVIEW</span>
            <span className="status">Draft · {surah}</span>
          </div>
          <div className="stage-wrap">
            <div className="stage">
              <div className="bg-glow" />
              <div className="quran-page">
                <div className="page-header">سُورَةُ الْفَاتِحَةِ</div>
                <div className="ayah active-line">
                  <span>بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</span>
                  <i className="finger">☝</i>
                </div>
                <div className="ayah">الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ</div>
                <div className="ayah">الرَّحْمَنِ الرَّحِيمِ</div>
                <div className="ayah">مَالِكِ يَوْمِ الدِّينِ</div>
                <div className="ayah">إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ</div>
                <div className="ayah">اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ</div>
                <div className="ayah">صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ</div>
                <div className="translation">In the name of Allah, the Most Compassionate, the Most Merciful.</div>
              </div>
              <div className="logo-placeholder">CHANNEL LOGO</div>
            </div>
          </div>
          <div className="transport"><button className="play-circle"><Play size={18}/></button><span>00:00</span><div className="scrub"><div/></div><span>00:00</span></div>
          <div className="timeline">
            <div><b>RECITATION</b><span/></div>
            <div><b>QURAN PAGE</b><span/></div>
            <div><b>TRANSLATION</b><span/></div>
            <div><b>HAND</b><span/></div>
          </div>
        </section>

        <aside className="sidebar right-panel">
          <section className="panel-section">
            <div className="section-title"><Hand size={16}/> Focus & Hand</div>
            <label>Scroll speed <strong>{speed}%</strong></label>
            <input type="range" min="0" max="100" value={speed} onChange={e => setSpeed(Number(e.target.value))}/>
            <div className="switch-row"><span>Moving finger</span><input type="checkbox" defaultChecked/></div>
            <div className="switch-row"><span>Active line highlight</span><input type="checkbox" defaultChecked/></div>
            <label>Highlight</label>
            <div className="color-grid">{['gold','green','yellow','amber'].map(c => <button key={c} className={`color ${c} ${highlight===c?'selected':''}`} onClick={() => setHighlight(c)} aria-label={c}/>)}</div>
            <label>Opacity</label><input type="range" defaultValue="25"/>
          </section>
          <section className="panel-section">
            <div className="section-title"><Image size={16}/> Background</div>
            <button className="wide-button">Search free media</button>
            <button className="wide-button"><Upload size={15}/> Upload image / video</button>
          </section>
          <section className="panel-section">
            <div className="section-title"><Type size={16}/> Branding & Text</div>
            <button className="wide-button">Upload channel logo</button>
            <button className="wide-button">Edit intro</button>
            <button className="wide-button">Edit outro</button>
          </section>
        </aside>
      </main>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>)
