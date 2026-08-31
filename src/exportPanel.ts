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
