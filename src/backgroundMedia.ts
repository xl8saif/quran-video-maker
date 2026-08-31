export type BackgroundMediaKind = 'image' | 'video' | 'upload'

export interface BackgroundMedia {
  id: string
  name: string
  kind: BackgroundMediaKind
  url?: string
  thumbnailUrl?: string
  author?: string
  license?: string
  attribution?: string
  sourceUrl?: string
  verifiedRights: boolean
}

export const BUILTIN_BACKGROUND_SOURCES: BackgroundMedia[] = []

export function createUploadedBackground(file: File): BackgroundMedia {
  return {
    id: `upload-${Date.now()}`,
    name: file.name,
    kind: 'upload',
    url: URL.createObjectURL(file),
    verifiedRights: false,
  }
}

export function createOnlineBackground(input: Omit<BackgroundMedia, 'id' | 'kind'> & { kind: 'image' | 'video'; id?: string }): BackgroundMedia {
  return {
    ...input,
    id: input.id || `online-${Date.now()}`,
    verifiedRights: Boolean(input.verifiedRights),
  }
}

export function validateBackgroundMedia(media: BackgroundMedia): string[] {
  const errors: string[] = []
  if (!media.name.trim()) errors.push('A background name is required.')
  if (!media.url) errors.push('A background URL or uploaded object is required.')
  if (media.kind !== 'upload' && !media.license) errors.push('License information is required for online media.')
  if (media.kind !== 'upload' && !media.attribution) errors.push('Attribution information is required for online media.')
  return errors
}

export function canUseBackgroundForExport(media: BackgroundMedia): boolean {
  return media.kind === 'upload' || media.verifiedRights
}
