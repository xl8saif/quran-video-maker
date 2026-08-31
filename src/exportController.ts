export type ExportStatus = 'idle'|'preparing'|'recording'|'finalizing'|'complete'|'cancelled'|'error'
export interface ExportProgress { status:ExportStatus; elapsed:number; duration:number; percent:number; blob?:Blob; error?:string }

export interface ExportControllerOptions { recorder:MediaRecorder; duration:number; onProgress?:(progress:ExportProgress)=>void; timeslice?:number }

export function createExportController(options:ExportControllerOptions){
  let startedAt=0
  let timer:number|undefined
  let cancelled=false
  const chunks:Blob[]=[]
  const emit=(status:ExportStatus,elapsed:number,extra:Partial<ExportProgress>={})=>options.onProgress?.({status,elapsed,duration:options.duration,percent:Math.min(100,options.duration?elapsed/options.duration*100:0),...extra})

  const cleanup=()=>{if(timer!==undefined)window.clearInterval(timer);timer=undefined}

  const start=()=>{
    cancelled=false;chunks.length=0;startedAt=performance.now();emit('recording',0)
    options.recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)}
    options.recorder.onerror=()=>{cleanup();emit('error',(performance.now()-startedAt)/1000,{error:'Video recording failed.'})}
    options.recorder.onstop=()=>{
      cleanup()
      const elapsed=(performance.now()-startedAt)/1000
      if(cancelled){emit('cancelled',elapsed);return}
      const blob=new Blob(chunks,{type:options.recorder.mimeType||'video/webm'})
      emit('complete',elapsed,{percent:100,blob})
    }
    options.recorder.start(options.timeslice??1000)
    timer=window.setInterval(()=>{
      const elapsed=(performance.now()-startedAt)/1000
      emit('recording',elapsed)
      if(elapsed>=options.duration) stop()
    },100)
  }

  const stop=()=>{if(options.recorder.state!=='inactive'){emit('finalizing',(performance.now()-startedAt)/1000);options.recorder.stop()}}
  const cancel=()=>{cancelled=true;stop()}
  return {start,stop,cancel}
}

export function downloadExport(blob:Blob,filename='quran-video.webm'){
  const url=URL.createObjectURL(blob)
  const anchor=document.createElement('a');anchor.href=url;anchor.download=filename;anchor.click()
  setTimeout(()=>URL.revokeObjectURL(url),1000)
}
