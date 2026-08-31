import type { ExportPanelOptions, ExportPanelState } from './exportPanel'

export interface ExportPanelUiHandlers {
  onOptionsChange?: (options: ExportPanelOptions) => void
  onExport?: (options: ExportPanelOptions) => void | Promise<void>
  onCancel?: () => void
}

export interface ExportPanelUi {
  element: HTMLElement
  options: ExportPanelOptions
  state: ExportPanelState
  destroy: () => void
  setState: (state: ExportPanelState) => void
}

const option = (value: string, label: string, selected: boolean) => `<option value="${value}"${selected ? ' selected' : ''}>${label}</option>`

export function mountExportPanel(host: HTMLElement, initialOptions: ExportPanelOptions, handlers: ExportPanelUiHandlers = {}): ExportPanelUi {
  let options = { ...initialOptions }
  let state: ExportPanelState = { status: 'idle', progress: 0, elapsed: 0, duration: 0 }

  host.innerHTML = `
    <section class="qvm-export-panel" aria-label="Quran video export">
      <h2>Export Quran Video</h2>
      <label>Resolution<select data-field="resolution">
        ${option('720p','720p',options.resolution==='720p')}${option('1080p','1080p',options.resolution==='1080p')}${option('1440p','1440p',options.resolution==='1440p')}${option('2160p','4K',options.resolution==='2160p')}
      </select></label>
      <label>FPS<select data-field="fps">${option('24','24 FPS',options.fps===24)}${option('30','30 FPS',options.fps===30)}${option('60','60 FPS',options.fps===60)}</select></label>
      <label>Mushaf<select data-field="mushafStyle">${option('hafs-naskh','Hafs Arabic Naskh',options.mushafStyle==='hafs-naskh')}${option('indo-pak-muhammadi','Pak/Indo Naskh (Muhammadi Quran)',options.mushafStyle==='indo-pak-muhammadi')}</select></label>
      <label>Translation<select data-field="translationLanguage">${option('none','None',options.translationLanguage==='none')}${option('ar','Arabic',options.translationLanguage==='ar')}${option('en','English',options.translationLanguage==='en')}${option('ur','Urdu',options.translationLanguage==='ur')}</select></label>
      <label>Filename<input data-field="filename" value="${options.filename.replace(/&/g,'&amp;').replace(/\"/g,'&quot;')}" /></label>
      <div class="qvm-export-actions"><button type="button" data-action="export">Export</button><button type="button" data-action="cancel" hidden>Cancel</button></div>
      <progress data-progress value="0" max="100"></progress><output data-status>Ready</output>
      <video data-preview controls hidden></video><a data-download hidden>Download video</a>
    </section>`

  const panel = host.firstElementChild as HTMLElement
  const statusEl = panel.querySelector('[data-status]') as HTMLOutputElement
  const progressEl = panel.querySelector('[data-progress]') as HTMLProgressElement
  const exportButton = panel.querySelector('[data-action="export"]') as HTMLButtonElement
  const cancelButton = panel.querySelector('[data-action="cancel"]') as HTMLButtonElement
  const preview = panel.querySelector('[data-preview]') as HTMLVideoElement
  const download = panel.querySelector('[data-download]') as HTMLAnchorElement

  const change = (event: Event) => {
    const target = event.target as HTMLInputElement | HTMLSelectElement
    const field = target.dataset.field as keyof ExportPanelOptions
    const value = field === 'fps' ? Number(target.value) : target.value
    options = { ...options, [field]: value } as ExportPanelOptions
    handlers.onOptionsChange?.(options)
  }
  panel.querySelectorAll('[data-field]').forEach(el => el.addEventListener('change', change))
  panel.querySelector('[data-field="filename"]')?.addEventListener('input', change)
  exportButton.addEventListener('click', () => handlers.onExport?.(options))
  cancelButton.addEventListener('click', () => handlers.onCancel?.())

  const setState = (next: ExportPanelState) => {
    state = next
    progressEl.value = Math.max(0, Math.min(100, next.progress))
    statusEl.textContent = next.error ?? (next.status === 'recording' ? `Exporting ${Math.round(next.progress)}%` : next.status)
    const busy = ['preparing','recording','finalizing'].includes(next.status)
    exportButton.disabled = busy
    cancelButton.hidden = !busy
    if (next.blobUrl && next.status === 'ready') {
      preview.hidden = false
      preview.src = next.blobUrl
      download.hidden = false
      download.href = next.blobUrl
      download.download = options.filename
      download.textContent = 'Download video'
    }
  }

  return {
    element: panel,
    get options() { return options },
    get state() { return state },
    setState,
    destroy: () => { panel.remove() },
  }
}
