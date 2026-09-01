import React from 'react'
import { Pause, Play } from 'lucide-react'
import { fetchChapterAudio, fetchChapterRecitations, type Reciter } from './recitationApi'
import { findActiveTiming, timingDuration, type ChapterAudioTiming } from './recitationTiming'
import './liveRecitationControls.css'

type Props = {
  chapterNumber: number
  onSync?: (verseKey: string, wordIndex: number, timeMs: number) => void
  onStatus?: (message: string) => void
}

const SPEEDS = [0.75, 1, 1.25, 1.5]

export function LiveRecitationControls({ chapterNumber, onSync, onStatus }: Props) {
  const audioRef = React.useRef<HTMLAudioElement>(null)
  const statusRef = React.useRef(onStatus)
  const [reciters, setReciters] = React.useState<Reciter[]>([])
  const [reciterId, setReciterId] = React.useState<number | ''>('')
  const [audio, setAudio] = React.useState<ChapterAudioTiming | null>(null)
  const [loadingReciters, setLoadingReciters] = React.useState(true)
  const [loadingAudio, setLoadingAudio] = React.useState(false)
  const [playing, setPlaying] = React.useState(false)
  const [currentMs, setCurrentMs] = React.useState(0)
  const [speed, setSpeed] = React.useState(1)
  const [error, setError] = React.useState('')

  React.useEffect(() => { statusRef.current = onStatus }, [onStatus])
  React.useEffect(() => {
    let cancelled = false
    setLoadingReciters(true); setError('')
    void fetchChapterRecitations().then(result => {
      if (cancelled) return
      setReciters(result.recitations)
      if (result.recitations.length && !result.recitations.some(item => item.id === reciterId)) setReciterId(result.recitations[0].id)
    }).catch(errorValue => { if (!cancelled) setError(errorValue instanceof Error ? errorValue.message : 'Unable to load reciters.') }).finally(() => { if (!cancelled) setLoadingReciters(false) })
    return () => { cancelled = true }
  }, [])
  React.useEffect(() => {
    if (!reciterId) return
    let cancelled = false
    setLoadingAudio(true); setError(''); setPlaying(false); setCurrentMs(0); audioRef.current?.pause()
    void fetchChapterAudio(reciterId, chapterNumber, undefined, true).then(result => {
      if (cancelled) return
      setAudio(result)
      if (audioRef.current) { audioRef.current.src = result.audioUrl; audioRef.current.playbackRate = speed; audioRef.current.dataset.qvmExportSpeed = String(speed); audioRef.current.load() }
      statusRef.current?.('Quran Foundation recitation loaded')
    }).catch(errorValue => { if (!cancelled) { setAudio(null); setError(errorValue instanceof Error ? errorValue.message : 'Unable to load recitation.'); statusRef.current?.('Quran Foundation recitation unavailable') } }).finally(() => { if (!cancelled) setLoadingAudio(false) })
    return () => { cancelled = true }
  }, [chapterNumber, reciterId])
  React.useEffect(() => { if (audioRef.current) { audioRef.current.playbackRate = speed; audioRef.current.dataset.qvmExportSpeed = String(speed) } }, [speed])

  const handleTime = (timeMs: number) => { setCurrentMs(timeMs); if (!audio) return; const active = findActiveTiming(audio.timestamps, timeMs); onSync?.(active.verseKey, active.wordIndex, timeMs) }
  const durationMs = Math.max(audio?.timestamps.length ? timingDuration(audio.timestamps) : 0, audioRef.current?.duration ? audioRef.current.duration * 1000 : 0)
  const progress = durationMs > 0 ? Math.min(100, currentMs / durationMs * 100) : 0
  const togglePlayback = () => { const element = audioRef.current; if (!element || !audio) return; if (element.paused) void element.play(); else element.pause() }
  const seek = (value: number) => { const element = audioRef.current; if (!element || !durationMs) return; element.currentTime = value / 100 * (durationMs / 1000); handleTime(element.currentTime * 1000) }

  return <div className="live-recitation-controls">
    <div className="recitation-row">
      <button className="primary" type="button" onClick={togglePlayback} disabled={!audio || loadingAudio} aria-label={playing ? 'Pause recitation' : 'Play recitation'}>{playing ? <Pause size={15}/> : <Play size={15}/>} {playing ? 'Pause' : 'Play'}</button>
      <select value={reciterId} disabled={loadingReciters || loadingAudio || !reciters.length} onChange={event => setReciterId(Number(event.target.value))} aria-label="Reciter">
        {!reciters.length && <option value="">{loadingReciters ? 'Loading reciters…' : 'No reciters available'}</option>}
        {reciters.map(reciter => <option key={reciter.id} value={reciter.id}>{reciter.reciter_name || reciter.name || `Reciter ${reciter.id}`}{reciter.style ? ` · ${reciter.style}` : ''}</option>)}
      </select>
      <select value={speed} onChange={event => setSpeed(Number(event.target.value))} aria-label="Playback speed">{SPEEDS.map(value => <option key={value} value={value}>{value}×</option>)}</select>
    </div>
    <input aria-label="Recitation progress" type="range" min="0" max="100" step="0.1" value={progress} disabled={!audio} onChange={event => seek(Number(event.target.value))}/>
    <audio id="qvm-export-audio" ref={audioRef} crossOrigin="anonymous" preload="metadata" onTimeUpdate={event => handleTime(event.currentTarget.currentTime * 1000)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => { setPlaying(false); handleTime(durationMs) }} />
    <small className="hint">{error || (loadingAudio ? 'Loading Surah recitation…' : audio ? `${formatTime(currentMs)} / ${formatTime(durationMs)} · ${speed}×` : 'Select a reciter')}</small>
  </div>
}

function formatTime(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}
