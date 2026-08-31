export type MushafId = 'hafs' | 'indopak'

export type PageBoundary = {
  page: number
  from: string
  to: string
}

/**
 * Static Mushaf metadata for the client-side renderer.
 * Page boundaries are kept separate by Mushaf because printed layouts differ.
 * Production word coordinates must be generated from a verified source for each style.
 */
export const mushafData = {
  hafs: {
    label: 'Hafs — Arabic Naskh',
    sourceLabel: 'Uthmani/Hafs Mushaf layout',
    totalPages: 604,
    linesPerPage: 15,
    textField: 'text_qpc_hafs',
    boundaries: [] as PageBoundary[],
  },
  indopak: {
    label: 'Indo-Pak — Muhammadi Quran',
    sourceLabel: 'IndoPak Mushaf layout',
    totalPages: 604,
    linesPerPage: 15,
    textField: 'text_indopak',
    boundaries: [] as PageBoundary[],
  },
} as const

export function getMushafConfig(id: MushafId) {
  return mushafData[id]
}

export function getMushafPageCount(id: MushafId) {
  return mushafData[id].totalPages
}
