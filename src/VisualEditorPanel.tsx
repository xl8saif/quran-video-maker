import React from 'react'
import type { VisualEditorSettings } from './visualEditor'
import { clampVisualValue } from './visualEditor'

type Props = {
  value: VisualEditorSettings
  onChange: (value: VisualEditorSettings) => void
  aspectRatio: '16:9' | '9:16' | '1:1'
}

function Slider({ label, value, min, max, step = 1, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (value: number) => void }) {
  return <label className="visual-editor-control"><span>{label}<strong>{value}</strong></span><input type="range" min={min} max={max} step={step} value={value} onChange={event => onChange(Number(event.target.value))} /></label>
}

export function VisualEditorPanel({ value, onChange, aspectRatio }: Props) {
  const update = (patch: Partial<VisualEditorSettings>) => onChange({ ...value, ...patch })
  return <section className="visual-editor-panel" aria-label="Visual editor">
    <div className="section-title">Visual editor</div>
    <div className="visual-editor-grid">
      <fieldset><legend>Quran</legend>
        <Slider label="Horizontal" value={value.quranX} min={10} max={90} onChange={quranX => update({ quranX })} />
        <Slider label="Vertical" value={value.quranY} min={10} max={90} onChange={quranY => update({ quranY })} />
        <Slider label="Scale" value={value.quranScale} min={70} max={140} step={5} onChange={quranScale => update({ quranScale })} />
      </fieldset>
      <fieldset><legend>Translation</legend>
        <Slider label="Horizontal" value={value.translationX} min={10} max={90} onChange={translationX => update({ translationX })} />
        <Slider label="Vertical" value={value.translationY} min={10} max={92} onChange={translationY => update({ translationY })} />
        <Slider label="Scale" value={value.translationScale} min={70} max={140} step={5} onChange={translationScale => update({ translationScale })} />
      </fieldset>
      <fieldset><legend>Logo</legend>
        <Slider label="Horizontal" value={value.logoX} min={5} max={95} onChange={logoX => update({ logoX })} />
        <Slider label="Vertical" value={value.logoY} min={5} max={95} onChange={logoY => update({ logoY })} />
        <Slider label="Size" value={value.logoSize} min={5} max={30} onChange={logoSize => update({ logoSize })} />
        <Slider label="Opacity" value={value.logoOpacity} min={10} max={100} onChange={logoOpacity => update({ logoOpacity })} />
      </fieldset>
      <fieldset><legend>Background</legend>
        <Slider label="Blur" value={value.backgroundBlur} min={0} max={20} onChange={backgroundBlur => update({ backgroundBlur })} />
        <Slider label="Dim" value={value.backgroundDim} min={0} max={80} onChange={backgroundDim => update({ backgroundDim })} />
        <Slider label="Gradient" value={value.gradientStrength} min={0} max={70} onChange={gradientStrength => update({ gradientStrength })} />
        <label className="toggle-option"><input type="checkbox" checked={value.gradientOverlay} onChange={event => update({ gradientOverlay: event.target.checked })} /><span>Gradient overlay</span></label>
      </fieldset>
    </div>
    <label className="toggle-option visual-safe-toggle"><input type="checkbox" checked={value.showSafeAreas} onChange={event => update({ showSafeAreas: event.target.checked })} /><span>Show {aspectRatio} safe area</span></label>
    <button type="button" className="ghost" onClick={() => onChange({ quranX:50,quranY:42,quranScale:100,translationX:50,translationY:76,translationScale:100,logoX:88,logoY:90,logoSize:12,logoOpacity:100,backgroundBlur:0,backgroundDim:0,gradientOverlay:true,gradientStrength:28,showSafeAreas:false })}>Reset layout</button>
  </section>
}

export function normalizeVisualEditorSettings(settings: VisualEditorSettings): VisualEditorSettings {
  return {
    ...settings,
    quranX: clampVisualValue(settings.quranX, 0, 100), quranY: clampVisualValue(settings.quranY, 0, 100), quranScale: clampVisualValue(settings.quranScale, 50, 200),
    translationX: clampVisualValue(settings.translationX, 0, 100), translationY: clampVisualValue(settings.translationY, 0, 100), translationScale: clampVisualValue(settings.translationScale, 50, 200),
    logoX: clampVisualValue(settings.logoX, 0, 100), logoY: clampVisualValue(settings.logoY, 0, 100), logoSize: clampVisualValue(settings.logoSize, 1, 50), logoOpacity: clampVisualValue(settings.logoOpacity, 0, 100),
    backgroundBlur: clampVisualValue(settings.backgroundBlur, 0, 30), backgroundDim: clampVisualValue(settings.backgroundDim, 0, 100), gradientStrength: clampVisualValue(settings.gradientStrength, 0, 100),
  }
}
