import React from 'react'
import { Clapperboard } from 'lucide-react'
import { type IntroOutroConfig, type IntroOutroEffect, clampDuration } from './introOutro'

type Props={title:string;config:IntroOutroConfig;onChange:(next:IntroOutroConfig)=>void}

export function IntroOutroPanel({title,config,onChange}:Props){
 const patch=(p:Partial<IntroOutroConfig>)=>onChange({...config,...p})
 return <section className="panel-section intro-outro-panel">
  <div className="section-title"><Clapperboard size={16}/>{title}</div>
  <div className="switch-row"><span>Enable</span><input type="checkbox" checked={config.enabled} onChange={e=>patch({enabled:e.target.checked})}/></div>
  <label>Text</label><input className="text-input" value={config.text} onChange={e=>patch({text:e.target.value})}/>
  <label>Duration <strong>{config.duration}s</strong></label><input type="range" min="1" max="15" step="0.5" value={config.duration} onChange={e=>patch({duration:clampDuration(Number(e.target.value))})}/>
  <label>Effect</label><select value={config.effect} onChange={e=>patch({effect:e.target.value as IntroOutroEffect})}><option value="fade">Fade</option><option value="slide-up">Slide up</option><option value="slide-down">Slide down</option><option value="zoom">Zoom</option><option value="none">None</option></select>
  <div className="switch-row"><span>Show channel logo</span><input type="checkbox" checked={config.showLogo} onChange={e=>patch({showLogo:e.target.checked})}/></div>
 </section>
}
