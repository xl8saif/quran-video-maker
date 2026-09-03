export type MushafStyleId = 'hafs-arabic-naskh' | 'indo-pak-muhammadi' | 'king-fahd-uthmanic-hafs'

export type MushafStyle = {
  id: MushafStyleId
  label: string
  description: string
  script: 'Arabic Naskh' | 'Indo-Pak Naskh' | 'Uthmanic Script'
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
  {
    id: 'king-fahd-uthmanic-hafs',
    label: 'King Fahd — Uthmanic Hafs',
    description: 'King Fahd Complex Uthmanic Script HAFS presentation for the Madinah Mushaf style',
    script: 'Uthmanic Script',
    fontFamily: 'KFGQPC HAFS Uthmanic Script, serif',
    direction: 'rtl',
    coordinateProfile: 'king-fahd-uthmanic-hafs-v1',
  },
]

export const defaultMushafStyle: MushafStyleId = 'hafs-arabic-naskh'
