import type { ExportResolution } from './exportPanel'

export type PlatformPresetId = 'youtube' | 'youtube-shorts' | 'tiktok' | 'instagram' | 'facebook' | 'bilibili'

export interface PlatformPreset {
  id: PlatformPresetId
  label: string
  resolution: ExportResolution
  fps: 24 | 30 | 60
  aspectRatio: '16:9' | '9:16' | '1:1'
  uploadUrl: string
}

export const PLATFORM_PRESETS: PlatformPreset[] = [
  { id: 'youtube', label: 'YouTube', resolution: 'youtube-landscape', fps: 30, aspectRatio: '16:9', uploadUrl: 'https://studio.youtube.com/' },
  { id: 'youtube-shorts', label: 'YouTube Shorts', resolution: 'youtube-shorts', fps: 30, aspectRatio: '9:16', uploadUrl: 'https://studio.youtube.com/' },
  { id: 'tiktok', label: 'TikTok', resolution: 'youtube-shorts', fps: 30, aspectRatio: '9:16', uploadUrl: 'https://www.tiktok.com/tiktokstudio/upload' },
  { id: 'instagram', label: 'Instagram Reels', resolution: 'youtube-shorts', fps: 30, aspectRatio: '9:16', uploadUrl: 'https://www.instagram.com/' },
  { id: 'facebook', label: 'Facebook', resolution: 'square', fps: 30, aspectRatio: '1:1', uploadUrl: 'https://www.facebook.com/creatorstudio/' },
  { id: 'bilibili', label: 'BiliBili', resolution: 'youtube-landscape', fps: 30, aspectRatio: '16:9', uploadUrl: 'https://member.bilibili.com/platform/upload/video/frame' },
]

export function getPlatformPreset(id: PlatformPresetId) {
  return PLATFORM_PRESETS.find(preset => preset.id === id)
}
