import type { QuranPage, MushafStyle, WordCoordinate } from './quranCoordinates'

export interface QuranCoordinateDataset {
  version: string
  source?: string
  style: MushafStyle
  pages: QuranPage[]
}

export function validateDataset(data: unknown): data is QuranCoordinateDataset {
  if (!data || typeof data !== 'object') return false
  const d = data as Record<string, unknown>
  if (typeof d.version !== 'string' || !Array.isArray(d.pages)) return false
  if (d.style !== 'hafs-naskh' && d.style !== 'indo-pak-muhammadi') return false
  return d.pages.every(page => {
    if (!page || typeof page !== 'object') return false
    const p = page as Record<string, unknown>
    return typeof p.page === 'number' && p.style === d.style && typeof p.width === 'number' && typeof p.height === 'number' && Array.isArray(p.lines)
  })
}

export function parseCoordinateDataset(json: string): QuranCoordinateDataset {
  const data: unknown = JSON.parse(json)
  if (!validateDataset(data)) throw new Error('Invalid Quran coordinate dataset.')
  return data
}

export function getPage(dataset: QuranCoordinateDataset, pageNumber: number): QuranPage | undefined {
  return dataset.pages.find(page => page.page === pageNumber)
}

export function getWords(dataset: QuranCoordinateDataset, pageNumber: number): WordCoordinate[] {
  return getPage(dataset, pageNumber)?.lines.flatMap(line => line.words) ?? []
}

export function emptyDataset(style: MushafStyle): QuranCoordinateDataset {
  return { version: '1.0', style, pages: [] }
}
