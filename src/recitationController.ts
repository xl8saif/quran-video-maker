import type { ChapterAudioTiming } from './recitationTiming'
import { findActiveTiming, timingDuration } from './recitationTiming'
import { fetchChapterAudio, type QuranApiCredentials, type ChapterAudio } from './recitationApi'

export type RecitationSyncState = { timeMs:number; durationMs:number; verseKey:string; wordIndex:number }
export type RecitationState = { loading:boolean; error:string; audio:ChapterAudio|null; activeVerse?:string; activeWordIndex:number }

export function syncAudioElement(audio:HTMLAudioElement,timing:ChapterAudioTiming,onSync:(state:RecitationSyncState)=>void){
 const handleTime=()=>{const timeMs=audio.currentTime*1000;const active=findActiveTiming(timing.timestamps,timeMs);onSync({timeMs,durationMs:Math.max(audio.duration*1000||0,timingDuration(timing.timestamps)),verseKey:active.verseKey,wordIndex:active.wordIndex})}
 audio.addEventListener('timeupdate',handleTime);audio.addEventListener('loadedmetadata',handleTime);audio.addEventListener('seeked',handleTime)
 return()=>{audio.removeEventListener('timeupdate',handleTime);audio.removeEventListener('loadedmetadata',handleTime);audio.removeEventListener('seeked',handleTime)}
}

export async function fetchChapterTiming(endpoint:string,chapterNumber:number,reciterId:number,accessToken:string,clientId:string):Promise<ChapterAudioTiming>{
 const url=new URL(endpoint.replace(/\/$/,'')+`/${reciterId}/${chapterNumber}`);url.searchParams.set('segments','true')
 const response=await fetch(url,{headers:{'x-auth-token':accessToken,'x-client-id':clientId}});if(!response.ok)throw new Error(`Recitation request failed: ${response.status}`)
 const payload=await response.json();const {normalizeChapterTiming}=await import('./recitationTiming');return normalizeChapterTiming(payload)
}

export function createRecitationController(credentials:QuranApiCredentials){
 let state:RecitationState={loading:false,error:'',audio:null,activeWordIndex:0};const listeners=new Set<(state:RecitationState)=>void>();const emit=()=>listeners.forEach(listener=>listener({...state}))
 return {
  subscribe(listener:(state:RecitationState)=>void){listeners.add(listener);listener({...state});return()=>listeners.delete(listener)},
  async loadChapter(reciterId:number,chapterNumber:number){
   state={...state,loading:true,error:'',audio:null,activeVerse:undefined,activeWordIndex:0};emit()
   try{const audio=await fetchChapterAudio(reciterId,chapterNumber,credentials,true);if(!audio.audioUrl)throw new Error('No audio URL was returned for this recitation.');state={...state,loading:false,audio}}
   catch(error){state={...state,loading:false,error:error instanceof Error?error.message:'Unable to load recitation.'}}
   emit();return {...state}
  },
  updateTime(timeMs:number){if(!state.audio)return;const active=findActiveTiming(state.audio.timestamps,timeMs);state={...state,activeVerse:active?.verseKey,activeWordIndex:active?.wordIndex??0};emit()},
  getState:()=>({...state}),destroy(){listeners.clear()}
 }
}
