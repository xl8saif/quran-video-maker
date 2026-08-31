import { createDefaultExportOptions, EXPORT_RESOLUTIONS, normalizeFilename, type ExportPanelOptions, type ExportPanelState } from './exportPanel'

export interface AppIntegrationState {
  options: ExportPanelOptions
  exportState: ExportPanelState
}

export function createAppIntegrationState(): AppIntegrationState {
  return {
    options: createDefaultExportOptions(),
    exportState: { status: 'idle', progress: 0, elapsed: 0, duration: 0 },
  }
}

export function updateExportOption(
  state: AppIntegrationState,
  patch: Partial<ExportPanelOptions>,
): AppIntegrationState {
  const options = { ...state.options, ...patch }
  options.filename = normalizeFilename(options.filename.replace(/\.webm$/i, ''))
  return { ...state, options }
}

export function getCanvasSize(options: ExportPanelOptions) {
  return EXPORT_RESOLUTIONS[options.resolution]
}

export function setExportState(state: AppIntegrationState, patch: Partial<ExportPanelState>): AppIntegrationState {
  return { ...state, exportState: { ...state.exportState, ...patch } }
}

export function resetExportState(state: AppIntegrationState): AppIntegrationState {
  if (state.exportState.blobUrl) URL.revokeObjectURL(state.exportState.blobUrl)
  return { ...state, exportState: { status: 'idle', progress: 0, elapsed: 0, duration: 0 } }
}
