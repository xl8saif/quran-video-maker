export type ReciterSource = {
  id: number
  name: string
  style?: string
  qirat?: string
  sourceType: 'chapter'
}

export type RecitationSource = {
  id: string
  name: string
  kind: 'upload' | 'url' | 'quran-foundation'
  url?: string
  reciter?: string
  license?: string
  attribution?: string
  surahNumber?: number
  verifiedRights: boolean
}

/** Public catalog metadata only. Actual Content API calls require backend credentials. */
export const recitationSourceConfig = {
  chapterRecitersEndpoint: 'https://apis.quran.foundation/content/api/v4/resources/chapter_reciters',
  chapterAudioEndpoint: 'https://apis.quran.foundation/content/api/v4/chapter_recitations/{reciterId}/{chapter}',
  defaultReciterId: 7,
}

export const BUILTIN_RECITATION_SOURCES: RecitationSource[] = [
  { id: 'local-upload', name: 'Uploaded audio', kind: 'upload', verifiedRights: false },
]

export function createExternalRecitationSource(input: Omit<RecitationSource, 'id' | 'kind'> & { id?: string }): RecitationSource {
  return {
    ...input,
    id: input.id || `external-${Date.now()}`,
    kind: 'url',
    verifiedRights: Boolean(input.verifiedRights),
  }
}

export function canUseForExport(source: RecitationSource): boolean {
  return source.kind === 'upload' || source.verifiedRights
}

export function validateRecitationSource(source: RecitationSource): string[] {
  const errors: string[] = []
  if (!source.name.trim()) errors.push('A recitation source name is required.')
  if (source.kind !== 'upload' && !source.url) errors.push('An external recitation URL is required.')
  if (source.kind !== 'upload' && !source.license) errors.push('License information is required for external audio.')
  if (source.kind !== 'upload' && !source.attribution) errors.push('Attribution information is required for external audio.')
  return errors
}
