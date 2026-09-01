import React from 'react'
import { fetchLiveChapters, type LiveChapter } from './liveChaptersApi'

export function useLiveChapters(language = 'en') {
  const [chapters, setChapters] = React.useState<LiveChapter[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    fetchLiveChapters(language)
      .then(result => {
        if (!cancelled) setChapters(result)
      })
      .catch(reason => {
        if (cancelled) return
        setChapters([])
        setError(reason instanceof Error ? reason.message : 'Unable to load Quran chapters.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [language])

  return { chapters, loading, error }
}
