import type { QuranAyah, QuranWord } from './quranData'
import { MUSHAF_ENGINE_CONFIG } from './mushafPageEngine'

export type MushafApiWord = { id:number; position:number; verse_key:string; page_number:number; line_number:number; text_uthmani?:string; text_indopak?:string; text_qpc_hafs?:string; audio_url?:string }
export type MushafApiVerse = { verse_key:string; text_uthmani?:string; text_indopak?:string; words?:MushafApiWord[] }
export type MushafPagePayload = { verses:MushafApiVerse[] }
export type MushafAdapterOptions = { endpoint:string; mushafId:number; accessToken?:string; clientId?:string; translationByVerse?:Record<string,{en?:string;ur?:string;ar?:string}> }
export function getMushafId(styleId:keyof typeof MUSHAF_ENGINE_CONFIG){ return MUSHAF_ENGINE_CONFIG[styleId].mushafId }
export function normalizeMushafPage(payload:MushafPagePayload,styleId:keyof typeof MUSHAF_ENGINE_CONFIG,translations:MushafAdapterOptions['translationByVerse']={ }):QuranAyah[]{
 const useIndoPak=styleId==='indo-pak-muhammadi'
 return payload.verses.map(verse=>({verseKey:verse.verse_key,arabic:useIndoPak?(verse.text_indopak??''):(verse.text_uthmani??''),translations:{en:translations[verse.verse_key]?.en??'',ur:translations[verse.verse_key]?.ur??'',ar:translations[verse.verse_key]?.ar??''},words:(verse.words??[]).map((word):QuranWord=>({text:useIndoPak?(word.text_indopak??''):(word.text_qpc_hafs??word.text_uthmani??''),start:0,end:0,line:word.line_number,index:word.position,page:word.page_number,verseKey:verse.verse_key}))}))
}
export async function fetchMushafPage(page:number,options:MushafAdapterOptions):Promise<MushafPagePayload>{
 const endpoint=options.endpoint.includes('{page}')?options.endpoint.replace('{page}',String(page)):`${options.endpoint.replace(/\/$/,'')}/${page}`
 const url=new URL(endpoint);url.searchParams.set('mushaf',String(options.mushafId));url.searchParams.set('words','true')
 const headers:HeadersInit={};if(options.accessToken)headers['x-auth-token']=options.accessToken;if(options.clientId)headers['x-client-id']=options.clientId
 const response=await fetch(url,{headers});if(!response.ok)throw new Error(`Mushaf request failed: ${response.status}`);return response.json() as Promise<MushafPagePayload>
}
