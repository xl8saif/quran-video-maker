export type QuranTextSource = {
  id: string
  label: string
  license: string
  attribution: string
  url: string
  redistribution: 'allowed' | 'restricted' | 'unknown'
}

/**
 * Source registry. Keep Quran text verbatim and keep source attribution attached
 * to the dataset so the renderer cannot silently strip licensing information.
 */
export const quranTextSources: QuranTextSource[] = [
  {
    id: 'tanzil-uthmani',
    label: 'Tanzil Quran Text — Uthmani',
    license: 'CC BY 3.0',
    attribution: 'Tanzil Quran Text — Copyright (C) 2007–2026 Tanzil Project',
    url: 'https://tanzil.net/',
    redistribution: 'allowed',
  },
]

export const quranSourceNotice =
  'Quran text is displayed verbatim from the selected source. Source attribution and licensing information must remain available in the application.'

export function getRedistributableQuranSources() {
  return quranTextSources.filter(source => source.redistribution === 'allowed')
}
