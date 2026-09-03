import type { ExportResolution } from './exportPanel'

export type PlatformPresetId = 'youtube' | 'youtube-shorts' | 'tiktok' | 'instagram' | 'facebook' | 'bilibili'

export interface PlatformPreset {
  id: PlatformPresetId
  label: string
  resolution: ExportResolution
  fps: 24 | 30 | 60
  aspectRatio: '16:9' | '9:16' | '1:1'
  width: number
  height: number
  safeArea: { top: number; right: number; bottom: number; left: number }
  uploadUrl: string
}

const LANDSCAPE_SAFE_AREA = { top: 0.06, right: 0.04, bottom: 0.06, left: 0.04 }
const VERTICAL_SAFE_AREA = { top: 0.12, right: 0.06, bottom: 0.16, left: 0.06 }
const SQUARE_SAFE_AREA = { top: 0.08, right: 0.06, bottom: 0.08, left: 0.06 }

export const PLATFORM_PRESETS: PlatformPreset[] = [
  { id: 'youtube', label: 'YouTube', resolution: 'youtube-landscape', fps: 30, aspectRatio: '16:9', width: 1920, height: 1080, safeArea: LANDSCAPE_SAFE_AREA, uploadUrl: 'https://studio.youtube.com/' },
  { id: 'youtube-shorts', label: 'YouTube Shorts', resolution: 'youtube-shorts', fps: 30, aspectRatio: '9:16', width: 1080, height: 1920, safeArea: VERTICAL_SAFE_AREA, uploadUrl: 'https://studio.youtube.com/' },
  { id: 'tiktok', label: 'TikTok', resolution: 'youtube-shorts', fps: 30, aspectRatio: '9:16', width: 1080, height: 1920, safeArea: VERTICAL_SAFE_AREA, uploadUrl: 'https://www.tiktok.com/tiktokstudio/upload' },
  { id: 'instagram', label: 'Instagram Reels', resolution: 'youtube-shorts', fps: 30, aspectRatio: '9:16', width: 1080, height: 1920, safeArea: VERTICAL_SAFE_AREA, uploadUrl: 'https://www.instagram.com/' },
  { id: 'facebook', label: 'Facebook', resolution: 'square', fps: 30, aspectRatio: '1:1', width: 1080, height: 1080, safeArea: SQUARE_SAFE_AREA, uploadUrl: 'https://www.facebook.com/creatorstudio/' },
  { id: 'bilibili', label: 'BiliBili', resolution: 'youtube-landscape', fps: 30, aspectRatio: '16:9', width: 1920, height: 1080, safeArea: LANDSCAPE_SAFE_AREA, uploadUrl: 'https://member.bilibili.com/platform/upload/video/frame' },
]

export function getPlatformPreset(id: PlatformPresetId) {
  return PLATFORM_PRESETS.find(preset => preset.id === id)
}

export function getSafeAreaPixels(preset: PlatformPreset) {
  return {
    top: Math.round(preset.height * preset.safeArea.top),
    right: Math.round(preset.width * preset.safeArea.right),
    bottom: Math.round(preset.height * preset.safeArea.bottom),
    left: Math.round(preset.width * preset.safeArea.left),
  }
}
