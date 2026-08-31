export type TranslationLanguage = 'en' | 'ur' | 'ar';

export interface TranslationEntry {
  surah: number;
  ayah: number;
  text: string;
}

export interface TranslationSelection {
  language: TranslationLanguage;
  visible: boolean;
  entries: TranslationEntry[];
  direction: 'ltr' | 'rtl';
  label: string;
}

const LABELS: Record<TranslationLanguage, string> = {
  en: 'English',
  ur: 'Urdu',
  ar: 'Arabic',
};

export function createTranslationSelection(
  language: TranslationLanguage,
  entries: TranslationEntry[] = [],
  visible = true,
): TranslationSelection {
  return {
    language,
    visible,
    entries,
    direction: language === 'en' ? 'ltr' : 'rtl',
    label: LABELS[language],
  };
}

export function findTranslation(
  selection: TranslationSelection,
  surah: number,
  ayah: number,
): TranslationEntry | undefined {
  return selection.entries.find(
    (entry) => entry.surah === surah && entry.ayah === ayah,
  );
}

export function toggleTranslation(
  selection: TranslationSelection,
): TranslationSelection {
  return { ...selection, visible: !selection.visible };
}
