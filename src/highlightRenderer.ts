export interface WordBox { start:number; end:number; x:number; y:number; width:number; height:number }
export interface HighlightStyle { lineColor?:string; wordColor?:string; lineAlpha?:number; wordAlpha?:number }

export function getActiveWord(time:number, words:WordBox[]):number {
  return words.findIndex(word=>time>=word.start&&time<word.end)
}

export function drawActiveWord(ctx:CanvasRenderingContext2D, word:WordBox|undefined, style:HighlightStyle={}) {
  if(!word)return
  ctx.save()
  ctx.globalAlpha=style.wordAlpha??0.5
  ctx.fillStyle=style.wordColor??'#d9e85b'
  const pad=4
  ctx.fillRect(word.x-pad,word.y-pad,word.width+pad*2,word.height+pad*2)
  ctx.restore()
}

export function drawActiveLine(ctx:CanvasRenderingContext2D, x:number,y:number,width:number,height:number,style:HighlightStyle={}) {
  ctx.save()
  ctx.globalAlpha=style.lineAlpha??0.22
  ctx.fillStyle=style.lineColor??'#b7d98a'
  ctx.fillRect(x,y,width,height)
  ctx.restore()
}
