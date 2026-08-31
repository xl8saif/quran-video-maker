import type { MushafStyle, QuranPage } from './quranCoordinates'
import { datasetManifest, loadCoordinateDataset, type DatasetManifestEntry } from './quranDatasetRegistry'

export interface MushafDatasetState {
  style: MushafStyle
  dataset: QuranPage[]
  sourceId?: string
  loading: boolean
  error?: string
}

export function datasetForStyle(style: MushafStyle): DatasetManifestEntry | undefined {
  return datasetManifest.find(entry => entry.style === style)
}

export async function loadMushafDataset(style: MushafStyle): Promise<MushafDatasetState> {
  const entry = datasetForStyle(style)
  if (!entry) return { style, dataset: [], loading: false, error: `No coordinate dataset is registered for ${style}.` }
  try {
    const data = await loadCoordinateDataset(entry.url)
    return { style, dataset: data.pages, sourceId: entry.id, loading: false }
  } catch (error) {
    return { style, dataset: [], sourceId: entry.id, loading: false, error: error instanceof Error ? error.message : 'Unable to load dataset.' }
  }
}

export function pageForStyle(pages: QuranPage[], style: MushafStyle, pageNumber: number): QuranPage | undefined {
  return pages.find(page => page.style === style && page.page === pageNumber)
}
