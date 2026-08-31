import type { QuranPage } from './quranCoordinates'
import { getSyncedFocus } from './fingerHighlightSync'
import { renderTranslation, type TranslationRenderOptions } from './translationRenderer'
import type { TranslationEntry } from './translationLoader'

export interface SynchronizedTranslationOptions extends TranslationRenderOptions {
  enabled?: boolean
  y?: number
}

export function renderSynchronizedTranslation(
  ctx: CanvasRenderingContext2D,
  page: QuranPage | undefined,
  time: number,
  translations: TranslationEntry[],
  options: SynchronizedTranslationOptions = {},
) {
  if (options.enabled === false) return
  const focus = getSyncedFocus(page, time)
  const ayah = focus.word?.ayah
  if (!ayah) return
  const entry = translations.find(item => item.surah === 1 && item.ayah === ayah)
  if (!entry) return
  renderTranslation(ctx, entry.text, {
    ...options,
    y: options.y ?? ctx.canvas.height * 0.78,
  })
}
