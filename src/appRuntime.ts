import type { ExportPanelOptions, ExportPanelState } from './exportPanel'

export interface AppRuntime {
  state: ExportPanelState
  options: ExportPanelOptions
  startExport: (options: ExportPanelOptions) => void
  cancelExport: () => void
  subscribe: (listener: (state: ExportPanelState, options: ExportPanelOptions) => void) => () => void
  destroy: () => void
}

export function createAppRuntime(): AppRuntime {
  let options: ExportPanelOptions = {
    resolution: '1080p', fps: 30, mushafStyle: 'hafs-naskh', translationLanguage: 'none', filename: 'quran-video.webm'
  }
  let state: ExportPanelState = { status: 'idle', progress: 0, elapsed: 0, duration: 0 }
  const listeners = new Set<(state: ExportPanelState, options: ExportPanelOptions) => void>()
  let timer: number | undefined

  const emit = () => listeners.forEach(listener => listener(state, options))
  const stop = () => { if (timer !== undefined) window.clearInterval(timer); timer = undefined }

  const startExport = (nextOptions: ExportPanelOptions) => {
    stop()
    options = { ...nextOptions }
    state = { status: 'preparing', progress: 0, elapsed: 0, duration: 0 }
    emit()
    // The actual compositor/exporter is attached here once media assets are loaded.
    state = { ...state, status: 'error', error: 'Export engine is waiting for Quran page, timing, and recitation assets.' }
    emit()
  }

  const cancelExport = () => {
    stop()
    state = { ...state, status: 'cancelled' }
    emit()
  }

  return {
    get state() { return state },
    get options() { return options },
    startExport,
    cancelExport,
    subscribe(listener) { listeners.add(listener); listener(state, options); return () => listeners.delete(listener) },
    destroy() { stop(); listeners.clear() }
  }
}
