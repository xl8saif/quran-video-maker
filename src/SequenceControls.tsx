import React from 'react'
import type { IntroOutroConfig, IntroOutroEffect } from './introOutro'

type Props={label:string;value:IntroOutroConfig;onChange:(next:IntroOutroConfig)=>void}
const effects:IntroOutroEffect[]=['fade','slide-up','slide-down','zoom','none']
export function SequenceControls({label,value,onChange}:Props){
 const patch=(p:Partial<IntroOutroConfig>)=>onChange({...value,...p})
 return <section className="panel-section sequence-controls">
  <div className="section-title">{label}</div>
  <div className="switch-row"><span>Enabled</span><input type="checkbox" checked={value.enabled} onChange={e=>patch({enabled:e.target.checked})}/></div>
  <label>Text</label><input className="text-input" value={value.text} onChange={e=>patch({text:e.target.value})}/>
  <label>Duration <strong>{value.duration}s</strong></label><input type="range" min="1" max="15" step="1" value={value.duration} onChange={e=>patch({duration:Number(e.target.value)})}/>
  <label>Effect</label><select value={value.effect} onChange={e=>patch({effect:e.target.value as IntroOutroEffect})}>{effects.map(effect=><option key={effect} value={effect}>{effect}</option>)}</select>
  <div className="switch-row"><span>Show channel logo</span><input type="checkbox" checked={value.showLogo} onChange={e=>patch({showLogo:e.target.checked})}/></div>
 </section>
}
