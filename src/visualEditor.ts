export type VisualEditorSettings = {
  quranX: number
  quranY: number
  quranScale: number
  translationX: number
  translationY: number
  translationScale: number
  logoX: number
  logoY: number
  logoSize: number
  logoOpacity: number
  backgroundBlur: number
  backgroundDim: number
  gradientOverlay: boolean
  gradientStrength: number
  showSafeAreas: boolean
}

export const DEFAULT_VISUAL_EDITOR_SETTINGS: VisualEditorSettings = {
  quranX: 50,
  quranY: 42,
  quranScale: 100,
  translationX: 50,
  translationY: 76,
  translationScale: 100,
  logoX: 88,
  logoY: 90,
  logoSize: 12,
  logoOpacity: 100,
  backgroundBlur: 0,
  backgroundDim: 0,
  gradientOverlay: true,
  gradientStrength: 28,
  showSafeAreas: false,
}

export const SAFE_AREA_INSETS: Record<'16:9' | '9:16' | '1:1', { x: number; y: number }> = {
  '16:9': { x: 6, y: 8 },
  '9:16': { x: 8, y: 9 },
  '1:1': { x: 7, y: 7 },
}

const STORAGE_KEY = 'qvm.visual-editor.v1'
let settings: VisualEditorSettings = loadSettings()
const listeners = new Set<(value: VisualEditorSettings) => void>()
let mounted = false

function loadSettings(): VisualEditorSettings {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as Partial<VisualEditorSettings>
    return { ...DEFAULT_VISUAL_EDITOR_SETTINGS, ...stored }
  } catch {
    return { ...DEFAULT_VISUAL_EDITOR_SETTINGS }
  }
}

export function getVisualEditorSettings(): VisualEditorSettings {
  return { ...settings }
}

export function setVisualEditorSettings(patch: Partial<VisualEditorSettings>) {
  settings = { ...settings, ...patch }
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)) } catch { /* optional */ }
  listeners.forEach(listener => listener(getVisualEditorSettings()))
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('qvm:visual-editor-change', { detail: getVisualEditorSettings() }))
}

export function resetVisualEditorSettings() {
  settings = { ...DEFAULT_VISUAL_EDITOR_SETTINGS }
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)) } catch { /* optional */ }
  listeners.forEach(listener => listener(getVisualEditorSettings()))
}

export function subscribeVisualEditor(listener: (value: VisualEditorSettings) => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function clampVisualValue(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min))
}

export function safeAreaStyle(aspectRatio: '16:9' | '9:16' | '1:1') {
  const inset = SAFE_AREA_INSETS[aspectRatio]
  return { left: `${inset.x}%`, right: `${inset.x}%`, top: `${inset.y}%`, bottom: `${inset.y}%` }
}

function createRange(parent: HTMLElement, label: string, key: keyof VisualEditorSettings, min: number, max: number, step = 1) {
  const row = document.createElement('label')
  row.style.cssText = 'display:grid;grid-template-columns:92px 1fr 42px;gap:7px;align-items:center;margin:6px 0;font:12px system-ui,sans-serif;color:#e5e7eb'
  const name = document.createElement('span'); name.textContent = label
  const input = document.createElement('input')
  input.type = 'range'; input.min = String(min); input.max = String(max); input.step = String(step); input.value = String(settings[key])
  const value = document.createElement('output'); value.textContent = String(settings[key]); value.style.textAlign = 'right'
  input.addEventListener('input', () => { const next = Number(input.value); value.textContent = String(next); setVisualEditorSettings({ [key]: next } as Partial<VisualEditorSettings>) })
  row.append(name, input, value); parent.append(row)
}

function mountPanel() {
  if (document.getElementById('qvm-visual-editor')) return
  const panel = document.createElement('aside')
  panel.id = 'qvm-visual-editor'
  panel.style.cssText = 'position:fixed;right:16px;top:84px;width:320px;max-height:calc(100vh - 100px);overflow:auto;z-index:9999;background:rgba(15,20,25,.97);border:1px solid #374151;border-radius:10px;box-shadow:0 16px 45px rgba(0,0,0,.35);padding:12px;box-sizing:border-box;font-family:system-ui,sans-serif;backdrop-filter:blur(12px)'
  const header = document.createElement('div'); header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:8px'
  const title = document.createElement('strong'); title.textContent = 'Visual Editor'; title.style.color = '#f5f1e8'
  const hide = document.createElement('button'); hide.textContent = 'Hide'; hide.type = 'button'; hide.style.cssText = 'border:1px solid #4b5563;background:#1f2937;color:#f5f1e8;border-radius:6px;padding:5px 8px;cursor:pointer'; hide.onclick = () => { panel.style.display = 'none' }
  header.append(title, hide); panel.append(header)

  const section = (text: string) => { const h = document.createElement('div'); h.textContent = text; h.style.cssText = 'margin:11px 0 5px;color:#a8895b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em'; panel.append(h) }
  section('Quran'); createRange(panel, 'Horizontal', 'quranX', 20, 80); createRange(panel, 'Vertical', 'quranY', 15, 70); createRange(panel, 'Scale', 'quranScale', 70, 130)
  section('Translation'); createRange(panel, 'Horizontal', 'translationX', 15, 85); createRange(panel, 'Vertical', 'translationY', 55, 92); createRange(panel, 'Scale', 'translationScale', 70, 130)
  section('Logo'); createRange(panel, 'Horizontal', 'logoX', 0, 100); createRange(panel, 'Vertical', 'logoY', 0, 100); createRange(panel, 'Size', 'logoSize', 4, 30); createRange(panel, 'Opacity', 'logoOpacity', 0, 100)
  section('Background'); createRange(panel, 'Blur', 'backgroundBlur', 0, 20); createRange(panel, 'Dim', 'backgroundDim', 0, 70); createRange(panel, 'Gradient', 'gradientStrength', 0, 70)

  const checks = document.createElement('div'); checks.style.cssText = 'display:flex;gap:12px;flex-wrap:wrap;margin:10px 0;color:#e5e7eb;font-size:12px'
  const gradient = document.createElement('label'); const gradientInput = document.createElement('input'); gradientInput.type = 'checkbox'; gradientInput.checked = settings.gradientOverlay; gradientInput.onchange = () => setVisualEditorSettings({ gradientOverlay: gradientInput.checked }); gradient.append(gradientInput, document.createTextNode('Gradient'))
  const safe = document.createElement('label'); const safeInput = document.createElement('input'); safeInput.type = 'checkbox'; safeInput.checked = settings.showSafeAreas; safeInput.onchange = () => setVisualEditorSettings({ showSafeAreas: safeInput.checked }); safe.append(safeInput, document.createTextNode('Safe areas'))
  checks.append(gradient, safe); panel.append(checks)

  const reset = document.createElement('button'); reset.textContent = 'Reset layout'; reset.type = 'button'; reset.style.cssText = 'width:100%;border:1px solid #4b5563;background:#1f2937;color:#f5f1e8;border-radius:6px;padding:8px;cursor:pointer'; reset.onclick = () => window.location.reload(); panel.append(reset)
  document.body.append(panel)
}

export function mountVisualEditor() {
  if (mounted || typeof document === 'undefined') return
  mounted = true
  const run = () => mountPanel()
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true })
  else run()
}

if (typeof document !== 'undefined') mountVisualEditor()
