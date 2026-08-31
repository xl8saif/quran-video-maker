export interface ExportPanelOptions {
  resolution: '720p' | '1080p' | '1440p' | '2160p'
  fps: 24 | 30 | 60
  mushafStyle: 'hafs-naskh' | 'indo-pak-muhammadi'
  translationLanguage: 'ar' | 'en' | 'ur' | 'none'
  filename: string
}

export interface ExportPanelState {
  status: 'idle' | 'preparing' | 'recording' | 'finalizing' | 'ready' | 'cancelled' | 'error'
  progress: number
  elapsed: number
  duration: number
  blobUrl?: string
  error?: string
}

export const EXPORT_RESOLUTIONS: Record<ExportPanelOptions['resolution'], { width:number; height:number }> = {
  '720p': { width:1280, height:720 },
  '1080p': { width:1920, height:1080 },
  '1440p': { width:2560, height:1440 },
  '2160p': { width:3840, height:2160 },
}

export function normalizeFilename(name: string): string {
  const clean = name.trim().replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '')
  return `${clean || 'quran-video'}.webm`
}

export function createDefaultExportOptions(): ExportPanelOptions {
  return {
    resolution:'1080p', fps:30, mushafStyle:'hafs-naskh', translationLanguage:'none', filename:'quran-video.webm'
  }
}

export function clampProgress(value:number):number { return Math.max(0, Math.min(100, value)) }

export interface ExportPanelBindings {
  options: ExportPanelOptions
  state: ExportPanelState
  onOptionsChange?: (options: ExportPanelOptions) => void
  onExport?: () => void
  onCancel?: () => void
}

export function createExportPanel(bindings: ExportPanelBindings): HTMLElement {
  const root = document.createElement('section')
  root.className = 'export-panel'
  root.setAttribute('aria-label', 'Video export')

  const title = document.createElement('h2')
  title.textContent = 'Export Video'
  root.appendChild(title)

  const form = document.createElement('div')
  form.className = 'export-panel__form'
  root.appendChild(form)

  const select = <T extends string>(labelText: string, value: T, options: Array<{value:T; label:string}>, onChange:(value:T)=>void) => {
    const label = document.createElement('label')
    label.textContent = labelText
    const input = document.createElement('select')
    for (const option of options) {
      const item = document.createElement('option')
      item.value = option.value
      item.textContent = option.label
      item.selected = option.value === value
      input.appendChild(item)
    }
    input.addEventListener('change', () => onChange(input.value as T))
    label.appendChild(input)
    form.appendChild(label)
  }

  select('Resolution', bindings.options.resolution, [
    {value:'720p',label:'720p'}, {value:'1080p',label:'1080p'}, {value:'1440p',label:'1440p'}, {value:'2160p',label:'4K'},
  ], value => bindings.onOptionsChange?.({...bindings.options, resolution:value}))

  select('FPS', String(bindings.options.fps), [
    {value:'24',label:'24 FPS'}, {value:'30',label:'30 FPS'}, {value:'60',label:'60 FPS'},
  ], value => bindings.onOptionsChange?.({...bindings.options, fps:Number(value) as 24|30|60}))

  select('Mushaf', bindings.options.mushafStyle, [
    {value:'hafs-naskh',label:'Hafs Arabic Naskh'}, {value:'indo-pak-muhammadi',label:'Indo-Pak Muhammadi'},
  ], value => bindings.onOptionsChange?.({...bindings.options, mushafStyle:value}))

  select('Translation', bindings.options.translationLanguage, [
    {value:'none',label:'None'}, {value:'ar',label:'Arabic'}, {value:'en',label:'English'}, {value:'ur',label:'Urdu'},
  ], value => bindings.onOptionsChange?.({...bindings.options, translationLanguage:value}))

  const filename = document.createElement('input')
  filename.type = 'text'
  filename.value = bindings.options.filename
  filename.setAttribute('aria-label', 'Output filename')
  filename.addEventListener('change', () => bindings.onOptionsChange?.({...bindings.options, filename:filename.value}))
  form.appendChild(filename)

  const progress = document.createElement('progress')
  progress.max = 100
  progress.value = clampProgress(bindings.state.progress)
  root.appendChild(progress)

  const status = document.createElement('output')
  status.textContent = bindings.state.error ?? bindings.state.status
  root.appendChild(status)

  const action = document.createElement('button')
  action.type = 'button'
  const busy = bindings.state.status === 'recording' || bindings.state.status === 'preparing' || bindings.state.status === 'finalizing'
  action.textContent = busy ? 'Cancel' : 'Export Video'
  action.disabled = bindings.state.status === 'ready' && !bindings.state.blobUrl
  action.addEventListener('click', () => busy ? bindings.onCancel?.() : bindings.onExport?.())
  root.appendChild(action)

  if (bindings.state.blobUrl) {
    const preview = document.createElement('video')
    preview.controls = true
    preview.src = bindings.state.blobUrl
    preview.style.maxWidth = '100%'
    root.appendChild(preview)

    const download = document.createElement('a')
    download.href = bindings.state.blobUrl
    download.download = normalizeFilename(bindings.options.filename)
    download.textContent = 'Download video'
    root.appendChild(download)
  }

  return root
}
