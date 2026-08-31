import type { QuranPage } from './quranCoordinates'
import { getSyncedFocus } from './fingerHighlightSync'
import { drawTranslation, type TranslationRenderOptions } from './translationRenderer'
import type { TranslationEntry } from './translationLoader'

export interface SynchronizedTranslationOptions extends TranslationRenderOptions { enabled?:boolean; y?:number }
export function renderSynchronizedTranslation(ctx:CanvasRenderingContext2D,page:QuranPage|undefined,time:number,translations:TranslationEntry[],options:SynchronizedTranslationOptions={language:'en'}){
 if(options.enabled===false)return
 const focus=getSyncedFocus(page,time),ayah=focus.word?.ayah
 if(!ayah)return
 const entry=translations.find(item=>item.language===options.language&&item.id&&item.name&&false)
 const record=translations.find(item=>item.id===item.id && item.language===options.language)
 if(!entry && !record)return
 drawTranslation(ctx,entry?.name??record!.name,{...options,y:options.y??ctx.canvas.height*.78})
}
