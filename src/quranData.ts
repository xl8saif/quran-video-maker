export type QuranWord = {
  text: string
  start: number
  end: number
  line: number
  index: number
}

export type QuranAyah = {
  verseKey: string
  arabic: string
  translations: {
    en: string
    ur: string
    ar: string
  }
  words: QuranWord[]
}

/**
 * Seed data used by the synchronization prototype.
 * Production Quran text/audio/timing will be loaded from a verified source.
 * Do not edit Quran text during ingestion.
 */
export const seedQuran: QuranAyah[] = [
  {
    verseKey: '1:1',
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
    translations: {
      en: 'In the name of Allah, the Most Compassionate, the Most Merciful.',
      ur: 'اللہ کے نام سے جو نہایت مہربان، بار بار رحم کرنے والا ہے۔',
      ar: 'بِاسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ',
    },
    words: [
      { text: 'بِسْمِ', start: 0, end: 0.55, line: 1, index: 1 },
      { text: 'اللَّهِ', start: 0.55, end: 1.15, line: 1, index: 2 },
      { text: 'الرَّحْمَنِ', start: 1.15, end: 1.85, line: 1, index: 3 },
      { text: 'الرَّحِيمِ', start: 1.85, end: 2.55, line: 1, index: 4 },
    ],
  },
  {
    verseKey: '1:2',
    arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    translations: {
      en: 'All praise is for Allah—Lord of the worlds.',
      ur: 'سب تعریف اللہ ہی کے لیے ہے جو تمام جہانوں کا رب ہے۔',
      ar: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    },
    words: [
      { text: 'الْحَمْدُ', start: 2.55, end: 3.15, line: 2, index: 1 },
      { text: 'لِلَّهِ', start: 3.15, end: 3.7, line: 2, index: 2 },
      { text: 'رَبِّ', start: 3.7, end: 4.1, line: 2, index: 3 },
      { text: 'الْعَالَمِينَ', start: 4.1, end: 4.9, line: 2, index: 4 },
    ],
  },
  {
    verseKey: '1:3',
    arabic: 'الرَّحْمَنِ الرَّحِيمِ',
    translations: {
      en: 'The Most Compassionate, Most Merciful.',
      ur: 'نہایت مہربان، بار بار رحم کرنے والا۔',
      ar: 'الرَّحْمَنِ الرَّحِيمِ',
    },
    words: [
      { text: 'الرَّحْمَنِ', start: 4.9, end: 5.65, line: 3, index: 1 },
      { text: 'الرَّحِيمِ', start: 5.65, end: 6.4, line: 3, index: 2 },
    ],
  },
  {
    verseKey: '1:4',
    arabic: 'مَالِكِ يَوْمِ الدِّينِ',
    translations: {
      en: 'Master of the Day of Judgment.',
      ur: 'روزِ جزا کا مالک ہے۔',
      ar: 'مَالِكِ يَوْمِ الدِّينِ',
    },
    words: [
      { text: 'مَالِكِ', start: 6.4, end: 7, line: 4, index: 1 },
      { text: 'يَوْمِ', start: 7, end: 7.5, line: 4, index: 2 },
      { text: 'الدِّينِ', start: 7.5, end: 8.2, line: 4, index: 3 },
    ],
  },
  {
    verseKey: '1:5',
    arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
    translations: {
      en: 'You alone we worship, and You alone we ask for help.',
      ur: 'ہم صرف تیری ہی عبادت کرتے ہیں اور صرف تجھ ہی سے مدد مانگتے ہیں۔',
      ar: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
    },
    words: [
      { text: 'إِيَّاكَ', start: 8.2, end: 8.8, line: 5, index: 1 },
      { text: 'نَعْبُدُ', start: 8.8, end: 9.4, line: 5, index: 2 },
      { text: 'وَإِيَّاكَ', start: 9.4, end: 10.05, line: 5, index: 3 },
      { text: 'نَسْتَعِينُ', start: 10.05, end: 10.9, line: 5, index: 4 },
    ],
  },
  {
    verseKey: '1:6',
    arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
    translations: {
      en: 'Guide us to the Straight Path.',
      ur: 'ہمیں سیدھے راستے کی ہدایت دے۔',
      ar: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
    },
    words: [
      { text: 'اهْدِنَا', start: 10.9, end: 11.55, line: 6, index: 1 },
      { text: 'الصِّرَاطَ', start: 11.55, end: 12.2, line: 6, index: 2 },
      { text: 'الْمُسْتَقِيمَ', start: 12.2, end: 13.05, line: 6, index: 3 },
    ],
  },
  {
    verseKey: '1:7',
    arabic: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ',
    translations: {
      en: 'The path of those You have blessed.',
      ur: 'ان لوگوں کا راستہ جن پر تو نے انعام فرمایا۔',
      ar: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ',
    },
    words: [
      { text: 'صِرَاطَ', start: 13.05, end: 13.6, line: 7, index: 1 },
      { text: 'الَّذِينَ', start: 13.6, end: 14.25, line: 7, index: 2 },
      { text: 'أَنْعَمْتَ', start: 14.25, end: 14.95, line: 7, index: 3 },
      { text: 'عَلَيْهِمْ', start: 14.95, end: 15.7, line: 7, index: 4 },
    ],
  },
]

export const quranSourceMetadata = {
  status: 'seed',
  textSource: 'Verified seed data for development only',
  productionSource: 'Tanzil / Quran Foundation adapter to be configured',
  translationPolicy: 'Use only sources whose redistribution terms permit the intended use',
}
