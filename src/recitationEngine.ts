export interface RecitationTrack { id:string; name:string; url:string; license?:string; attribution?:string; duration?:number }
export interface RecitationState { audio:HTMLAudioElement|null; track:RecitationTrack|null; playing:boolean; currentTime:number; error?:string }

export function createRecitationAudio(track:RecitationTrack):HTMLAudioElement {
  const audio=new Audio(track.url)
  audio.preload='auto'
  audio.crossOrigin='anonymous'
  return audio
}

export function bindRecitationAudio(audio:HTMLAudioElement, onTime:(time:number)=>void, onState?:(playing:boolean)=>void, onError?:(message:string)=>void){
  const time=()=>onTime(audio.currentTime)
  const play=()=>onState?.(true)
  const pause=()=>onState?.(false)
  const error=()=>onError?.('Unable to load the Quran recitation.')
  audio.addEventListener('timeupdate',time)
  audio.addEventListener('play',play)
  audio.addEventListener('pause',pause)
  audio.addEventListener('error',error)
  return ()=>{audio.removeEventListener('timeupdate',time);audio.removeEventListener('play',play);audio.removeEventListener('pause',pause);audio.removeEventListener('error',error)}
}

export function setRecitationTime(audio:HTMLAudioElement,time:number){
  if(Number.isFinite(time)) audio.currentTime=Math.max(0,time)
}

export async function playRecitation(audio:HTMLAudioElement){await audio.play()}
export function pauseRecitation(audio:HTMLAudioElement){audio.pause()}
