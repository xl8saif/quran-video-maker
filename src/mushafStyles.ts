export type MushafStyleId = 'hafs-arabic-naskh' | 'indo-pak-muhammadi'

export type MushafStyle = {
  id: MushafStyleId
  label: string
  description: string
  script: 'Arabic Naskh' | 'Indo-Pak Naskh'
  fontFamily: string
  direction: 'rtl'
  coordinateProfile: string
}

/**
 * Quran rendering presets. Keep font/page assets and word-coordinate data
 * separate for each preset because identical ayahs can occupy different
 * positions and line breaks in different Mushaf layouts.
 */
export const mushafStyles: MushafStyle[] = [
  {
    id: 'hafs-arabic-naskh',
    label: 'Hafs — Arabic Naskh',
    description: 'Hafs reading in an Arabic Naskh presentation',
    script: 'Arabic Naskh',
    fontFamily: 'Noto Naskh Arabic, serif',
    direction: 'rtl',
    coordinateProfile: 'hafs-arabic-naskh-v1',
  },
  {
    id: 'indo-pak-muhammadi',
    label: 'Indo-Pak — Muhammadi Quran',
    description: 'Indo-Pak Naskh presentation using the Muhammadi Quran style',
    script: 'Indo-Pak Naskh',
    fontFamily: 'Muhammadi Quran, serif',
    direction: 'rtl',
    coordinateProfile: 'indo-pak-muhammadi-v1',
  },
]

export const defaultMushafStyle: MushafStyleId = 'hafs-arabic-naskh'
