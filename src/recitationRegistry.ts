import type { RecitationTrack } from './recitationEngine'

export interface RecitationProvider { id:string; name:string; website:string; tracks:RecitationTrack[]; license?:string; attribution?:string }

export const recitationProviders:RecitationProvider[] = []

export function registerRecitationProvider(provider:RecitationProvider){
  const index=recitationProviders.findIndex(item=>item.id===provider.id)
  if(index>=0) recitationProviders[index]=provider
  else recitationProviders.push(provider)
}

export function getRecitationTracks(providerId?:string){
  if(providerId) return recitationProviders.find(p=>p.id===providerId)?.tracks ?? []
  return recitationProviders.flatMap(p=>p.tracks)
}

export function findRecitationTrack(id:string){ return getRecitationTracks().find(track=>track.id===id) }
