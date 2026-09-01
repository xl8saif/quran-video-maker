import React from 'react'
import { fetchTranslationResources, selectDefaultTranslationResources, type TranslationResource } from './translationResourcesApi'
import type { TranslationLanguage } from './translationUiModel'

export function useTranslationResources() {
  const [resources, setResources] = React.useState<TranslationResource[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    fetchTranslationResources()
      .then(result => {
        if (!cancelled) setResources(result)
      })
      .catch(error => {
        if (!cancelled) setError(error instanceof Error ? error.message : 'Unable to load translation resources.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const defaults = React.useMemo(() => selectDefaultTranslationResources(resources), [resources])
  const getId = React.useCallback((language: TranslationLanguage) => defaults[language]?.id, [defaults])

  return { resources, defaults, getId, loading, error }
}
