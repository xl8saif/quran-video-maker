import type { QuranPage } from './quranCoordinates'
import { getSyncedFocus } from './fingerHighlightSync'
import { drawFinger } from './fingerEngine'
import { drawActiveLine, drawActiveWord } from './highlightRenderer'
export interface ScrolledRenderOptions { scrollTop?:number; scale?:number; showFinger?:boolean; fingerImage?:HTMLImageElement|null }
export function renderScrolledQuranPage(ctx:CanvasRenderingContext2D,pageImage:HTMLImageElement,page:QuranPage|undefined,time:number,options:ScrolledRenderOptions={}){
 if(!page||!pageImage.naturalWidth||!pageImage.naturalHeight)return
 const canvas=ctx.canvas,scale=options.scale??Math.min(canvas.width/page.width,canvas.height/page.height),width=page.width*scale,offsetX=(canvas.width-width)/2,scrollTop=options.scrollTop??0
 ctx.save();ctx.translate(offsetX,-scrollTop);ctx.scale(scale,scale);ctx.drawImage(pageImage,0,0,page.width,page.height)
 const focus=getSyncedFocus(page,time)
 if(focus.word){const line=page.lines.find(item=>item.number===focus.word?.line);if(line)drawActiveLine(ctx,0,line.y,page.width,line.height);drawActiveWord(ctx,focus.word);if(options.showFinger!==false)drawFinger(ctx,focus.finger,options.fingerImage)}ctx.restore()
}
