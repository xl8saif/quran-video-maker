import { createAppRuntime, type AppRuntime } from './appRuntime'
import { mountExportPanel, type ExportPanelController } from './exportPanel'

export interface AppBootstrapOptions {
  root?: HTMLElement
  panelRoot?: HTMLElement
}

export interface BootstrappedApp {
  runtime: AppRuntime
  exportPanel: ExportPanelController | null
  destroy: () => void
}

export function bootstrapApp(options: AppBootstrapOptions = {}): BootstrappedApp {
  const runtime = createAppRuntime()
  const panelRoot = options.panelRoot ?? options.root ?? document.body
  const exportPanel = mountExportPanel(panelRoot, {
    runtime,
    onExport: config => runtime.startExport(config),
    onCancel: () => runtime.cancelExport(),
  })

  const destroy = () => {
    exportPanel?.destroy?.()
    runtime.destroy?.()
  }

  return { runtime, exportPanel, destroy }
}

if (typeof document !== 'undefined') {
  const root = document.querySelector<HTMLElement>('#app')
  if (root) bootstrapApp({ root })
}
