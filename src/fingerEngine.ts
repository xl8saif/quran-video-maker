export interface FingerPoint { x:number; y:number; angle?:number; scale?:number }
export interface FingerOptions { xOffset?:number; yOffset?:number; smoothing?:number }

export function getFingerPoint(word: {x:number;y:number;width:number;height:number}|undefined, options:FingerOptions={}):FingerPoint|null {
  if(!word)return null
  return {
    x: word.x + word.width/2 + (options.xOffset??0),
    y: word.y + word.height + (options.yOffset??8),
    angle: -18,
    scale: 1,
  }
}

export function smoothFingerPoint(previous:FingerPoint|null, target:FingerPoint|null, smoothing=0.18):FingerPoint|null {
  if(!target)return null
  if(!previous)return target
  const t=Math.min(1,Math.max(0,smoothing))
  return {
    x: previous.x + (target.x-previous.x)*t,
    y: previous.y + (target.y-previous.y)*t,
    angle: target.angle,
    scale: target.scale,
  }
}

export function drawFinger(ctx:CanvasRenderingContext2D, point:FingerPoint|null, source?:HTMLImageElement|null){
  if(!point)return
  ctx.save()
  ctx.translate(point.x,point.y)
  ctx.rotate((point.angle??-18)*Math.PI/180)
  const scale=point.scale??1
  if(source?.naturalWidth){
    const w=source.naturalWidth*scale,h=source.naturalHeight*scale
    ctx.drawImage(source,-w/2,-h/2,w,h)
  } else {
    ctx.font=`${30*scale}px Arial`
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('☝',0,0)
  }
  ctx.restore()
}
