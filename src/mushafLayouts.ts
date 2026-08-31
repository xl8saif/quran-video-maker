import type { MushafId } from './mushafData'

export type MushafLayoutSource = {
  id: MushafId
  label: string
  pageCount: number
  lineCount: number
  wordFields: string[]
  coordinateStrategy: 'line-grouped' | 'page-font-glyphs'
  notes: string
}

/**
 * Rendering contract for the two requested styles.
 * Coordinates are intentionally not invented here; they must come from the
 * verified page/line data for the exact Mushaf layout selected by the user.
 */
export const mushafLayouts: Record<MushafId, MushafLayoutSource> = {
  hafs: {
    id: 'hafs',
    label: 'Hafs — Arabic Naskh',
    pageCount: 604,
    lineCount: 15,
    wordFields: ['text_qpc_hafs', 'page_number', 'line_number'],
    coordinateStrategy: 'page-font-glyphs',
    notes: 'Use the verified QPC/Hafs Unicode or page-font data for exact Mushaf rendering.',
  },
  indopak: {
    id: 'indopak',
    label: 'Indo-Pak — Muhammadi Quran',
    pageCount: 604,
    lineCount: 15,
    wordFields: ['text_indopak', 'page_number', 'line_number'],
    coordinateStrategy: 'line-grouped',
    notes: 'Do not bundle a Muhammadi/IndoPak font or text asset unless its redistribution permission is verified.',
  },
}

export function getMushafLayout(id: MushafId) {
  return mushafLayouts[id]
}
