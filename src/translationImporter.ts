export type TranslationLanguage = 'en' | 'ur' | 'ar';

export interface TranslationEntry {
  surah: number;
  ayah: number;
  text: string;
}

export interface TranslationPack {
  id: string;
  language: TranslationLanguage;
  name: string;
  translator?: string;
  license?: string;
  sourceUrl?: string;
  entries: TranslationEntry[];
}

export interface TranslationFile {
  id?: string;
  language: TranslationLanguage;
  name: string;
  translator?: string;
  license?: string;
  sourceUrl?: string;
  entries: TranslationEntry[];
}

const STORAGE_KEY = 'quran-video-maker:translations:v1';

export function validateTranslationFile(input: unknown): TranslationPack {
  if (!input || typeof input !== 'object') throw new Error('Translation file must contain a JSON object.');
  const value = input as Partial<TranslationFile>;
  if (!['en', 'ur', 'ar'].includes(value.language ?? '')) throw new Error('Language must be en, ur, or ar.');
  if (!value.name?.trim()) throw new Error('Translation name is required.');
  if (!Array.isArray(value.entries)) throw new Error('Translation entries must be an array.');

  const entries = value.entries.map((entry, index) => {
    if (!entry || typeof entry !== 'object') throw new Error(`Entry ${index + 1} is invalid.`);
    const e = entry as Partial<TranslationEntry>;
    if (!Number.isInteger(e.surah) || e.surah < 1 || e.surah > 114) throw new Error(`Entry ${index + 1}: invalid surah.`);
    if (!Number.isInteger(e.ayah) || e.ayah < 1) throw new Error(`Entry ${index + 1}: invalid ayah.`);
    if (typeof e.text !== 'string' || !e.text.trim()) throw new Error(`Entry ${index + 1}: translation text is required.`);
    return { surah: e.surah, ayah: e.ayah, text: e.text };
  });

  const seen = new Set<string>();
  for (const entry of entries) {
    const key = `${entry.surah}:${entry.ayah}`;
    if (seen.has(key)) throw new Error(`Duplicate translation entry: ${key}.`);
    seen.add(key);
  }

  return {
    id: value.id?.trim() || `upload-${Date.now()}`,
    language: value.language as TranslationLanguage,
    name: value.name.trim(),
    translator: value.translator?.trim(),
    license: value.license?.trim(),
    sourceUrl: value.sourceUrl?.trim(),
    entries,
  };
}

export function translationText(pack: TranslationPack, surah: number, ayah: number): string | undefined {
  return pack.entries.find((entry) => entry.surah === surah && entry.ayah === ayah)?.text;
}

export function saveTranslation(pack: TranslationPack): void {
  const packs = loadTranslations().filter((item) => item.id !== pack.id);
  packs.push(pack);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(packs));
}

export function loadTranslations(): TranslationPack[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(validateTranslationFile);
  } catch {
    return [];
  }
}

export function removeTranslation(id: string): void {
  const packs = loadTranslations().filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(packs));
}

export async function importTranslationFile(file: File): Promise<TranslationPack> {
  const raw = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Only valid JSON translation files are supported in this first importer.');
  }
  const pack = validateTranslationFile(parsed);
  saveTranslation(pack);
  return pack;
}
