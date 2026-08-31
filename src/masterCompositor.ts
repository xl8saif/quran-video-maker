import type { QuranPage } from './quranCoordinates'
import { getSynchronizedFrame } from './synchronizedRenderer'
import { drawFinger } from './fingerEngine'
import { drawActiveLine, drawActiveWord } from './highlightRenderer'
import { renderTranslation, type TranslationRenderOptions } from './translationRenderer'

export interface MasterCompositeOptions {
  viewportHeight:number
  contentHeight:number
  currentScroll?:number
  showFinger?:boolean
  fingerImage?:HTMLImageElement|null
  translation?:string
  translationOptions?:TranslationRenderOptions
}

export function renderMasterFrame(ctx:CanvasRenderingContext2D, pageImage:HTMLImageElement, page:QuranPage|undefined, time:number, options:MasterCompositeOptions){
  if(!pageImage.naturalWidth || !page)return
  const frame=getSynchronizedFrame(page,time,options.viewportHeight,options.contentHeight,options.currentScroll??0)
  const scale=Math.min(ctx.canvas.width/page.width,ctx.canvas.height/page.height)
  const offsetX=(ctx.canvas.width-page.width*scale)/2
  ctx.save();ctx.translate(offsetX,-frame.scrollTop);ctx.scale(scale,scale)
  ctx.drawImage(pageImage,0,0,page.width,page.height)
  const word=page.lines.flatMap(l=>l.words).find(w=>w.id===frame.wordId)
  const line=word&&page.lines.find(l=>l.number===word.line)
  if(line)drawActiveLine(ctx,0,line.y,page.width,line.height)
  if(word){drawActiveWord(ctx,word);if(options.showFinger!==false)drawFinger(ctx,{x:frame.fingerX!,y:frame.fingerY!,angle:-18,scale:1},options.fingerImage)}
  ctx.restore()
  if(options.translation){renderTranslation(ctx,options.translation,options.translationOptions)}
}
