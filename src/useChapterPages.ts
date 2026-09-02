import React from 'react'
import { fetchChapterPages, type PagesLookupResponse } from './mushafApi'
import type { MushafStyleId } from './mushafStyles'

export function useChapterPages(chapterNumber:number, style:MushafStyleId){
 const [lookup,setLookup]=React.useState<PagesLookupResponse|null>(null)
 const [loading,setLoading]=React.useState(false)
 const [error,setError]=React.useState('')
 React.useEffect(()=>{let cancelled=false;setLoading(true);setError('');fetchChapterPages(chapterNumber,style).then(result=>{if(!cancelled)setLookup(result)}).catch(error=>{if(!cancelled){setLookup(null);setError(error instanceof Error?error.message:'Unable to load bundled Quran page mapping.')}}).finally(()=>{if(!cancelled)setLoading(false)});return()=>{cancelled=true}},[chapterNumber,style])
 const pageNumbers=React.useMemo(()=>lookup?Object.keys(lookup.pages).map(Number).sort((a,b)=>a-b):[],[lookup])
 const firstPage=pageNumbers[0]||null
 return {lookup,pageNumbers,firstPage,loading,error}
}
