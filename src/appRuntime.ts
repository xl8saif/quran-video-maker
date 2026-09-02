import type { ExportPanelOptions, ExportPanelState } from './exportPanel'
import { createCanvasAudioStreamController, type CanvasAudioStream } from './streamExporter'
import { defaultMushafStyle } from './mushafStyles'
import { getExportDurationMs, normalizeExportSpeed } from './exportTiming'

export interface AppRuntimeMedia { canvas: HTMLCanvasElement; audio: HTMLMediaElement | null }
export interface AppRuntime { state: ExportPanelState; options: ExportPanelOptions; setMedia:(media:AppRuntimeMedia|null)=>void; startExport:(options:ExportPanelOptions)=>void; cancelExport:()=>void; subscribe:(listener:(state:ExportPanelState,options:ExportPanelOptions)=>void)=>()=>void; destroy:()=>void }

const EXPORT_SPEED_OPTIONS=[['0.75','0.75×'],['1','1×'],['1.25','1.25×'],['1.5','1.5×'],['2','2×']] as const

function ensureExportSpeedControl(){
 const existing=document.getElementById('qvm-export-speed') as HTMLSelectElement|null
 if(existing)return existing
 const button=Array.from(document.querySelectorAll('button')).find(node=>node.textContent?.includes('Export video'))
 if(!button)return null
 const wrapper=document.createElement('label')
 wrapper.className='export-speed-control'
 wrapper.textContent='Playback speed '
 const select=document.createElement('select')
 select.id='qvm-export-speed'
 select.setAttribute('aria-label','Playback speed')
 EXPORT_SPEED_OPTIONS.forEach(([value,label])=>{const option=document.createElement('option');option.value=value;option.textContent=label;select.appendChild(option)})
 wrapper.appendChild(select)
 button.parentElement?.insertBefore(wrapper,button)
 return select
}

function findExportCanvas(media:AppRuntimeMedia|null){
 if(media?.canvas?.isConnected)return media.canvas
 return document.querySelector('canvas[aria-hidden="true"]') as HTMLCanvasElement|null
}

export function createAppRuntime():AppRuntime{
 let options:ExportPanelOptions={resolution:'1080p',fps:30,mushafStyle:defaultMushafStyle,translationLanguage:'none',playbackSpeed:1,filename:'quran-video.webm'}
 let state:ExportPanelState={status:'idle',progress:0,elapsed:0,duration:0};const listeners=new Set<(state:ExportPanelState,options:ExportPanelOptions)=>void>();let timer:number|undefined,stopTimeout:number|undefined,recorder:MediaRecorder|undefined,stream:MediaStream|undefined,streamController:CanvasAudioStream|undefined,media:AppRuntimeMedia|null=null,chunks:BlobPart[]=[],runId=0
 const emit=()=>listeners.forEach(listener=>listener(state,options));const stopTimer=()=>{if(timer!==undefined)window.clearInterval(timer);timer=undefined};const stopTimeoutTimer=()=>{if(stopTimeout!==undefined)window.clearTimeout(stopTimeout);stopTimeout=undefined};const cleanupStream=()=>{streamController?.dispose();streamController=undefined;stream=undefined}
 const resolveAudio=()=>document.getElementById('qvm-export-audio') as HTMLMediaElement|null || media?.audio || null
 const setMedia=(next:AppRuntimeMedia|null)=>{media=next;if(next)ensureExportSpeedControl()}
 const failExport=(thisRun:number,duration:number,error:string)=>{if(thisRun!==runId)return;stopTimer();stopTimeoutTimer();const currentRecorder=recorder;recorder=undefined;if(currentRecorder&&currentRecorder.state!=='inactive'){currentRecorder.onstop=null;currentRecorder.onerror=null;try{currentRecorder.stop()}catch{}}resolveAudio()?.pause();cleanupStream();state={status:'error',progress:0,elapsed:0,duration,error};emit()}
 const startExport=(nextOptions:ExportPanelOptions)=>{stopTimer();stopTimeoutTimer();cleanupStream();const thisRun=++runId;if(recorder&&recorder.state!=='inactive'){recorder.onstop=null;recorder.stop()}recorder=undefined;const speedControl=ensureExportSpeedControl();const selectedSpeed=Number(speedControl?.value);options={...nextOptions,playbackSpeed:(Number.isFinite(selectedSpeed)&&selectedSpeed>0?selectedSpeed:nextOptions.playbackSpeed??1) as ExportPanelOptions['playbackSpeed']};const speed=normalizeExportSpeed(options.playbackSpeed);const canvas=findExportCanvas(media);if(canvas&&media)media={...media,canvas};if(!canvas){state={status:'error',progress:0,elapsed:0,duration:0,error:'Export canvas is not available.'};emit();return}const audio=resolveAudio();if(!audio){state={status:'error',progress:0,elapsed:0,duration:0,error:'Audio source is not available for export.'};emit();return}const sizes:Record<ExportPanelOptions['resolution'],[number,number]>={'720p':[1280,720],'1080p':[1920,1080],'1440p':[2560,1440],'2160p':[3840,2160]};const [width,height]=sizes[options.resolution];canvas.width=width;canvas.height=height;streamController=createCanvasAudioStreamController(canvas,audio,options.fps);stream=streamController.stream;const mimeType=MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')?'video/webm;codecs=vp9,opus':'video/webm';try{recorder=new MediaRecorder(stream,{mimeType})}catch(error){cleanupStream();state={status:'error',progress:0,elapsed:0,duration:0,error:error instanceof Error?error.message:'MediaRecorder is unavailable.'};emit();return}chunks=[];const mediaDuration=audio.duration&&Number.isFinite(audio.duration)&&audio.duration>0?audio.duration*1000:0;const duration=getExportDurationMs(mediaDuration,speed);const started=performance.now();let ended=false;const stopRecording=()=>{if(ended||thisRun!==runId||recorder?.state==='inactive')return;ended=true;audio.pause();recorder?.requestData();recorder?.stop()};const handleEnded=()=>stopRecording();audio.addEventListener('ended',handleEnded,{once:true});const removeEndedListener=()=>audio.removeEventListener('ended',handleEnded);recorder.ondataavailable=event=>{if(thisRun===runId&&event.data.size)chunks.push(event.data)};recorder.onerror=event=>{if(thisRun!==runId)return;removeEndedListener();stopTimer();stopTimeoutTimer();state={...state,status:'error',error:event.error?.message??'MediaRecorder failed.'};cleanupStream();recorder=undefined;emit()};recorder.onstop=()=>{const current=thisRun===runId;removeEndedListener();stopTimer();stopTimeoutTimer();audio.pause();cleanupStream();if(!current){if(recorder?.state==='inactive')recorder=undefined;return}if(!chunks.length){failExport(thisRun,duration,'Export produced no video data.');return}const actualElapsed=Math.max(0,performance.now()-started);const finalDuration=duration||actualElapsed;const blob=new Blob(chunks,{type:mimeType});if(blob.size<1024){failExport(thisRun,finalDuration,'Export produced an invalid or empty video.');return}const blobUrl=URL.createObjectURL(blob);state={...state,status:'ready',progress:100,elapsed:finalDuration,duration:finalDuration,blobUrl};recorder=undefined;emit()};state={status:'recording',progress:0,elapsed:0,duration};emit();try{recorder.start(250)}catch(error){removeEndedListener();state={status:'error',progress:0,elapsed:0,duration,error:error instanceof Error?error.message:'Unable to start recording.'};cleanupStream();recorder=undefined;emit();return}audio.currentTime=0;audio.playbackRate=speed;void audio.play().catch(error=>{failExport(thisRun,duration,error instanceof Error?`Unable to play audio for export: ${error.message}`:'Unable to play audio for export.')});timer=window.setInterval(()=>{if(thisRun!==runId)return;const elapsed=duration?Math.min(duration,performance.now()-started):Math.max(0,performance.now()-started);state={...state,elapsed,progress:duration?elapsed/duration*100:0};emit()},100);const safetyDuration=duration>0?duration+2000:10000;stopTimeout=window.setTimeout(stopRecording,safetyDuration)}
 const cancelExport=()=>{const wasActive=recorder?.state!=='inactive';++runId;stopTimer();stopTimeoutTimer();const audio=resolveAudio();audio?.pause();state={...state,status:'cancelled'};emit();if(wasActive)recorder?.stop();else cleanupStream()}
 return{get state(){return state},get options(){return options},setMedia,startExport,cancelExport,subscribe(listener){listeners.add(listener);listener(state,options);return()=>listeners.delete(listener)},destroy(){++runId;stopTimer();stopTimeoutTimer();const audio=resolveAudio();audio?.pause();if(recorder&&recorder.state!=='inactive')recorder.stop();cleanupStream();recorder=undefined;listeners.clear();media=null;document.getElementById('qvm-export-speed')?.closest('.export-speed-control')?.remove()}}
}
