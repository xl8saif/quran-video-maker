import type { TranslationEntry } from './translationRegistry'

export interface TranslationRecord {
  surah:number
  ayah:number
  text:string
}

export interface TranslationDataset {
  version:string
  language:'ar'|'en'|'ur'
  edition:string
  translator?:string
  source?:string
  license?:string
  attribution?:string
  records:TranslationRecord[]
}

export function validateTranslationDataset(data:unknown):data is TranslationDataset {
  if(!data||typeof data!=='object')return false
  const d=data as Record<string,unknown>
  if(typeof d.version!=='string'||!['ar','en','ur'].includes(String(d.language))||typeof d.edition!=='string'||!Array.isArray(d.records))return false
  return d.records.every(item=>item&&typeof item==='object'&&typeof (item as any).surah==='number'&&typeof (item as any).ayah==='number'&&typeof (item as any).text==='string')
}

export function parseTranslationDataset(json:string):TranslationDataset {
  const data:unknown=JSON.parse(json)
  if(!validateTranslationDataset(data))throw new Error('Invalid translation dataset.')
  return data
}

export async function loadOnlineTranslation(entry:TranslationEntry):Promise<TranslationDataset>{
  const response=await fetch(entry.url)
  if(!response.ok)throw new Error(`Unable to load translation (${response.status}).`)
  const data=parseTranslationDataset(await response.text())
  if(data.language!==entry.language)throw new Error('Translation language does not match the selected edition.')
  return data
}

export function getTranslationText(dataset:TranslationDataset,surah:number,ayah:number){
  return dataset.records.find(item=>item.surah===surah&&item.ayah===ayah)?.text ?? ''
}

export function parseUploadedTranslation(fileText:string):TranslationDataset{return parseTranslationDataset(fileText)}
