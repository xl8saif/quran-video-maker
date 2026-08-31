export type AudioSequenceState = 'intro' | 'quran' | 'outro'

export interface AudioSequenceConfig {
  introDuration: number
  quranDuration: number
  outroDuration: number
  introEnabled: boolean
  outroEnabled: boolean
}

export function getAudioSegment(time:number, config:AudioSequenceConfig):AudioSequenceState {
  const intro=config.introEnabled?Math.max(0,config.introDuration):0
  const quranEnd=intro+Math.max(0,config.quranDuration)
  if(intro>0&&time<intro)return 'intro'
  if(config.outroEnabled&&time>=quranEnd)return 'outro'
  return 'quran'
}

export function getQuranAudioTime(masterTime:number,config:AudioSequenceConfig){
  const intro=config.introEnabled?Math.max(0,config.introDuration):0
  return Math.max(0,masterTime-intro)
}

export function shouldPlayQuranAudio(masterTime:number,config:AudioSequenceConfig){
  const segment=getAudioSegment(masterTime,config)
  return segment==='quran'
}
