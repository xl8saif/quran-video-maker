import type { AppRuntime } from './appRuntime'
import type { MushafStyleId } from './mushafStyles'

export interface ExportPanelOptions {
  resolution: '720p' | '1080p' | '1440p' | '2160p'
  fps: 24 | 30 | 60
  mushafStyle: MushafStyleId
  translationLanguage: 'ar' | 'en' | 'ur' | 'none'
  filename: string
}
export interface ExportPanelState { status: 'idle'|'preparing'|'recording'|'finalizing'|'ready'|'cancelled'|'error'; progress:number; elapsed:number; duration:number; blobUrl?:string; error?:string }
export const EXPORT_RESOLUTIONS: Record<ExportPanelOptions['resolution'],{width:number;height:number}> = {'720p':{width:1280,height:720},'1080p':{width:1920,height:1080},'1440p':{width:2560,height:1440},'2160p':{width:3840,height:2160}}
export function normalizeFilename(name:string){const clean=name.trim().replace(/\.webm$/i,'').replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/^-+|-+$/g,'');return `${clean||'quran-video'}.webm`}
export function createDefaultExportOptions():ExportPanelOptions{return {resolution:'1080p',fps:30,mushafStyle:'hafs-arabic-naskh',translationLanguage:'none',filename:'quran-video.webm'}}
export function clampProgress(value:number){return Math.max(0,Math.min(100,value))}
export interface ExportPanelBindings { options:ExportPanelOptions; state:ExportPanelState; onOptionsChange?:(options:ExportPanelOptions)=>void; onExport?:()=>void; onCancel?:()=>void }
export interface ExportPanelController { element:HTMLElement; destroy:()=>void; refresh:(options:ExportPanelOptions,state:ExportPanelState)=>void }
export function createExportPanel(bindings:ExportPanelBindings):HTMLElement {
 const root=document.createElement('section'); root.className='export-panel'; root.setAttribute('aria-label','Video export')
 const title=document.createElement('h2'); title.textContent='Export Video'; root.appendChild(title); const form=document.createElement('div'); form.className='export-panel__form'; root.appendChild(form)
 const select=<T extends string>(labelText:string,value:T,opts:Array<{value:T;label:string}>,onChange:(v:T)=>void)=>{const label=document.createElement('label');label.textContent=labelText;const input=document.createElement('select');opts.forEach(o=>{const item=document.createElement('option');item.value=o.value;item.textContent=o.label;item.selected=o.value===value;input.appendChild(item)});input.addEventListener('change',()=>onChange(input.value as T));label.appendChild(input);form.appendChild(label)}
 select('Resolution',bindings.options.resolution,[{value:'720p',label:'720p'},{value:'1080p',label:'1080p'},{value:'1440p',label:'1440p'},{value:'2160p',label:'4K'}],v=>bindings.onOptionsChange?.({...bindings.options,resolution:v}))
 select('FPS',String(bindings.options.fps),[{value:'24',label:'24 FPS'},{value:'30',label:'30 FPS'},{value:'60',label:'60 FPS'}],v=>bindings.onOptionsChange?.({...bindings.options,fps:Number(v) as 24|30|60}))
 select('Mushaf',bindings.options.mushafStyle,[{value:'hafs-arabic-naskh',label:'Hafs Arabic Naskh'},{value:'indo-pak-muhammadi',label:'Indo-Pak Muhammadi'}],v=>bindings.onOptionsChange?.({...bindings.options,mushafStyle:v as MushafStyleId}))
 select('Translation',bindings.options.translationLanguage,[{value:'none',label:'None'},{value:'ar',label:'Arabic'},{value:'en',label:'English'},{value:'ur',label:'Urdu'}],v=>bindings.onOptionsChange?.({...bindings.options,translationLanguage:v}))
 const filename=document.createElement('input');filename.type='text';filename.value=bindings.options.filename;filename.setAttribute('aria-label','Output filename');filename.addEventListener('change',()=>bindings.onOptionsChange?.({...bindings.options,filename:filename.value}));form.appendChild(filename)
 const progress=document.createElement('progress');progress.max=100;progress.value=clampProgress(bindings.state.progress);root.appendChild(progress);const status=document.createElement('output');status.textContent=bindings.state.error??bindings.state.status;root.appendChild(status)
 const action=document.createElement('button');action.type='button';const busy=['recording','preparing','finalizing'].includes(bindings.state.status);action.textContent=busy?'Cancel':'Export Video';action.addEventListener('click',()=>busy?bindings.onCancel?.():bindings.onExport?.());root.appendChild(action)
 if(bindings.state.blobUrl){const preview=document.createElement('video');preview.controls=true;preview.src=bindings.state.blobUrl;preview.style.maxWidth='100%';root.appendChild(preview);const download=document.createElement('a');download.href=bindings.state.blobUrl;download.download=normalizeFilename(bindings.options.filename);download.textContent='Download video';root.appendChild(download)} return root
}
export function mountExportPanel(panelRoot:HTMLElement,config:{runtime:AppRuntime;onExport?:(options:ExportPanelOptions)=>void;onCancel?:()=>void}):ExportPanelController {
 let options=config.runtime.options; let state=config.runtime.state; let current:HTMLElement; const host=document.createElement('div'); panelRoot.appendChild(host)
 const render=()=>{host.replaceChildren();current=createExportPanel({options,state,onOptionsChange:v=>{options=v},onExport:()=>config.onExport?.(options),onCancel:config.onCancel});host.appendChild(current)}
 render(); const unsubscribe=config.runtime.subscribe((nextState,nextOptions)=>{state=nextState;options=nextOptions;render()}); return {element:host,destroy:()=>{unsubscribe();host.remove()},refresh:(nextOptions,nextState)=>{options=nextOptions;state=nextState;render()}}
}