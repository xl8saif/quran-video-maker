import type { AppRuntime } from './appRuntime'
import type { MushafStyleId } from './mushafStyles'
import { PLATFORM_PRESETS } from './platformPresets'

export type ExportPlaybackSpeed = 0.75 | 1 | 1.25 | 1.5 | 2
export type ExportResolution = '720p' | '1080p' | '1440p' | '2160p' | 'youtube-landscape' | 'youtube-shorts' | 'square'

export interface ExportPanelOptions {
  resolution: ExportResolution
  fps: 24 | 30 | 60
  mushafStyle: MushafStyleId
  translationLanguage: 'ar' | 'en' | 'ur' | 'none'
  playbackSpeed?: ExportPlaybackSpeed
  filename: string
  seoTitle?: string
  seoDescription?: string
  seoTags?: string
}
export interface ExportPanelState { status: 'idle'|'preparing'|'recording'|'finalizing'|'ready'|'cancelled'|'error'; progress:number; elapsed:number; duration:number; blobUrl?:string; error?:string }
export const EXPORT_RESOLUTIONS: Record<ExportResolution,{width:number;height:number}> = {
 '720p':{width:1280,height:720},
 '1080p':{width:1920,height:1080},
 '1440p':{width:2560,height:1440},
 '2160p':{width:3840,height:2160},
 'youtube-landscape':{width:1920,height:1080},
 'youtube-shorts':{width:1080,height:1920},
 'square':{width:1080,height:1080},
}
export function normalizeFilename(name:string){const clean=name.trim().replace(/\.webm$/i,'').replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/^-+|-+$/g,'');return `${clean||'quran-video'}.webm`}
export function createDefaultExportOptions():ExportPanelOptions{return {resolution:'1080p',fps:30,mushafStyle:'hafs-arabic-naskh',translationLanguage:'none',playbackSpeed:1,filename:'quran-video.webm'}}
export function clampProgress(value:number){return Math.max(0,Math.min(100,value))}
export interface ExportPanelBindings { options:ExportPanelOptions; state:ExportPanelState; onOptionsChange?:(options:ExportPanelOptions)=>void; onExport?:()=>void; onCancel?:()=>void }
export interface ExportPanelController { element:HTMLElement; destroy:()=>void; refresh:(options:ExportPanelOptions,state:ExportPanelState)=>void }

function field(labelText:string,value:string,placeholder:string,onChange:(value:string)=>void,textarea=false){
 const label=document.createElement('label'); label.className='export-seo-field'; label.textContent=labelText
 const input=textarea?document.createElement('textarea'):document.createElement('input'); input.value=value; input.placeholder=placeholder; input.addEventListener('input',()=>onChange(input.value)); label.appendChild(input); return label
}

export function createExportPanel(bindings:ExportPanelBindings):HTMLElement {
 const root=document.createElement('section'); root.className='export-panel'; root.setAttribute('aria-label','Video export')
 const title=document.createElement('h2'); title.textContent='Export Video'; root.appendChild(title)
 const form=document.createElement('div'); form.className='export-panel__form'; root.appendChild(form)
 const presetTitle=document.createElement('h3'); presetTitle.textContent='Platform presets'; form.appendChild(presetTitle)
 const presetGrid=document.createElement('div'); presetGrid.className='social-upload-grid export-platform-presets';
 PLATFORM_PRESETS.forEach(preset=>{
   const button=document.createElement('button'); button.type='button'; button.className=`social-upload-button social-${preset.id}`; button.setAttribute('aria-label',`Use ${preset.label} preset`); button.title=`Use ${preset.label} ${preset.aspectRatio} preset`
   const icon=document.createElement('span'); icon.className='social-upload-icon'; icon.textContent=preset.id==='youtube'||preset.id==='youtube-shorts'?'▶':preset.id==='tiktok'?'♪':preset.id==='facebook'?'f':preset.id==='instagram'?'◎':'B'
   const text=document.createElement('span'); text.textContent=preset.label; button.append(icon,text)
   button.addEventListener('click',()=>bindings.onOptionsChange?.({...bindings.options,resolution:preset.resolution,fps:preset.fps,filename:`quran-${preset.id}.webm` }))
   presetGrid.appendChild(button)
 });
 form.appendChild(presetGrid)
 const select=<T extends string>(labelText:string,value:T,opts:Array<{value:T;label:string}>,onChange:(v:T)=>void)=>{const label=document.createElement('label');label.textContent=labelText;const input=document.createElement('select');opts.forEach(o=>{const item=document.createElement('option');item.value=o.value;item.textContent=o.label;item.selected=o.value===value;input.appendChild(item)});input.addEventListener('change',()=>onChange(input.value as T));label.appendChild(input);form.appendChild(label)}
 select('Video dimensions',bindings.options.resolution,[{value:'youtube-landscape',label:'YouTube 16:9 — 1920×1080'},{value:'youtube-shorts',label:'Vertical 9:16 — 1080×1920'},{value:'square',label:'Square 1:1 — 1080×1080'},{value:'720p',label:'1280×720'},{value:'1080p',label:'1920×1080'},{value:'1440p',label:'2560×1440'},{value:'2160p',label:'4K — 3840×2160'}],v=>bindings.onOptionsChange?.({...bindings.options,resolution:v as ExportResolution}))
 select('FPS',String(bindings.options.fps),[{value:'24',label:'24 FPS'},{value:'30',label:'30 FPS'},{value:'60',label:'60 FPS'}],v=>bindings.onOptionsChange?.({...bindings.options,fps:Number(v) as 24|30|60}))
 select('Playback speed',String(bindings.options.playbackSpeed??1),[{value:'0.75',label:'0.75×'},{value:'1',label:'1×'},{value:'1.25',label:'1.25×'},{value:'1.5',label:'1.5×'},{value:'2',label:'2×'}],v=>bindings.onOptionsChange?.({...bindings.options,playbackSpeed:Number(v) as ExportPlaybackSpeed}))
 select('Mushaf',bindings.options.mushafStyle,[{value:'hafs-arabic-naskh',label:'Hafs Arabic Naskh'},{value:'indo-pak-muhammadi',label:'Indo-Pak Muhammadi'},{value:'king-fahd-uthmanic-hafs',label:'King Fahd — Uthmanic Hafs'}],v=>bindings.onOptionsChange?.({...bindings.options,mushafStyle:v as MushafStyleId}))
 select('Translation',bindings.options.translationLanguage,[{value:'none',label:'None'},{value:'ar',label:'Arabic'},{value:'en',label:'English'},{value:'ur',label:'Urdu'}],v=>bindings.onOptionsChange?.({...bindings.options,translationLanguage:v}))
 const filename=document.createElement('input');filename.type='text';filename.value=bindings.options.filename;filename.placeholder='quran-video.webm';filename.setAttribute('aria-label','Output filename');filename.addEventListener('input',()=>bindings.onOptionsChange?.({...bindings.options,filename:filename.value}));form.appendChild(filename)
 const seo=document.createElement('fieldset'); seo.className='export-seo'; const legend=document.createElement('legend'); legend.textContent='SEO / upload metadata'; seo.appendChild(legend)
 seo.appendChild(field('Title',bindings.options.seoTitle??'','Quran Reel — Surah title',value=>bindings.onOptionsChange?.({...bindings.options,seoTitle:value})))
 seo.appendChild(field('Description',bindings.options.seoDescription??'','Quran recitation and translation',value=>bindings.onOptionsChange?.({...bindings.options,seoDescription:value}),true))
 seo.appendChild(field('Tags',bindings.options.seoTags??'','quran, quran recitation, islam, surah, القرآن',value=>bindings.onOptionsChange?.({...bindings.options,seoTags:value})))
 form.appendChild(seo)
 const social=document.createElement('div'); social.className='social-upload-panel'; const socialTitle=document.createElement('h3'); socialTitle.textContent='Publish / upload'; social.appendChild(socialTitle)
 const socialGrid=document.createElement('div'); socialGrid.className='social-upload-grid';
 PLATFORM_PRESETS.forEach(target=>{const button=document.createElement('button');button.type='button';button.className=`social-upload-button social-${target.id}`;button.title=`Open ${target.label} upload`;button.setAttribute('aria-label',`Open ${target.label} upload`);const icon=document.createElement('span');icon.className='social-upload-icon';icon.textContent=target.id==='youtube'||target.id==='youtube-shorts'?'▶':target.id==='tiktok'?'♪':target.id==='facebook'?'f':target.id==='instagram'?'◎':'B';const text=document.createElement('span');text.textContent=target.label;button.append(icon,text);button.addEventListener('click',async()=>{const tags=(bindings.options.seoTags??'').trim();if(tags&&navigator.clipboard?.writeText)await navigator.clipboard.writeText(tags);window.open(target.uploadUrl,'_blank','noopener,noreferrer')});socialGrid.appendChild(button)}); social.appendChild(socialGrid)
 const seoHint=document.createElement('small');seoHint.className='export-seo-hint';seoHint.textContent='Preset selects the target format. Upload buttons open the platform and copy your tags when clipboard access is available.';social.appendChild(seoHint); form.appendChild(social)
 const progress=document.createElement('progress');progress.max=100;progress.value=clampProgress(bindings.state.progress);root.appendChild(progress);const status=document.createElement('output');status.textContent=bindings.state.error??bindings.state.status;root.appendChild(status)
 const action=document.createElement('button');action.type='button';const busy=['recording','preparing','finalizing'].includes(bindings.state.status);action.textContent=busy?'Cancel':'Export Video';action.addEventListener('click',()=>busy?bindings.onCancel?.():bindings.onExport?.());root.appendChild(action)
 if(bindings.state.blobUrl){const preview=document.createElement('video');preview.controls=true;preview.src=bindings.state.blobUrl;preview.style.maxWidth='100%';root.appendChild(preview);const download=document.createElement('a');download.href=bindings.state.blobUrl;download.download=normalizeFilename(bindings.options.filename);download.textContent='Download video';root.appendChild(download)} return root
}
export function mountExportPanel(panelRoot:HTMLElement,config:{runtime:AppRuntime;onExport?:(options:ExportPanelOptions)=>void;onCancel?:()=>void}):ExportPanelController {
 let options=config.runtime.options; let state=config.runtime.state; let current:HTMLElement; const host=document.createElement('div'); panelRoot.appendChild(host)
 const render=()=>{host.replaceChildren();current=createExportPanel({options,state,onOptionsChange:v=>{options=v},onExport:()=>config.onExport?.(options),onCancel:config.onCancel});host.appendChild(current)}
 render(); const unsubscribe=config.runtime.subscribe((nextState,nextOptions)=>{state=nextState;options=nextOptions;render()}); return {element:host,destroy:()=>{unsubscribe();host.remove()},refresh:(nextOptions,nextState)=>{options=nextOptions;state=nextState;render()}}
}