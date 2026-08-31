import type { MushafStyle } from './quranCoordinates'
import { parseCoordinateDataset, type QuranCoordinateDataset } from './quranDataLoader'

export interface DatasetManifestEntry {
  id: string
  style: MushafStyle
  url: string
  license?: string
  attribution?: string
}

export async function loadCoordinateDataset(url: string): Promise<QuranCoordinateDataset> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Unable to load Quran coordinate data (${response.status}).`)
  return parseCoordinateDataset(await response.text())
}

export const datasetManifest: DatasetManifestEntry[] = [
  {
    id: 'sample-hafs',
    style: 'hafs-naskh',
    url: './data/quran-coordinate-sample.json',
    license: 'Sample data only',
    attribution: 'Replace with a verified, properly licensed Quran coordinate dataset before production use.',
  },
]

export function findDataset(id: string) { return datasetManifest.find(item => item.id === id) }
