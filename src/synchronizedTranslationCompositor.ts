import type { QuranPage } from './quranCoordinates'
import { getSyncedFocus } from './fingerHighlightSync'
import { drawTranslation, type TranslationRenderOptions } from './translationRenderer'
import type { TranslationRecord } from './translationLoader'

export interface SynchronizedTranslationOptions extends TranslationRenderOptions { enabled?:boolean; y?:number }
export function renderSynchronizedTranslation(ctx:CanvasRenderingContext2D,page:QuranPage|undefined,time:number,translations:TranslationRecord[],options:SynchronizedTranslationOptions={language:'en'}){
 if(options.enabled===false)return
 const focus=getSyncedFocus(page,time),ayah=focus.word?.ayah
 if(!ayah)return
 const entry=translations.find(item=>item.surah===1&&item.ayah===ayah)
 if(!entry)return
 drawTranslation(ctx,entry.text,{...options,y:options.y??ctx.canvas.height*.78})
}
