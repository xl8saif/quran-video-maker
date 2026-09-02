interface Env {
  ASSETS: Fetcher
}

type Verse = { sura: number; aya: number; text: string; verse_key: string }
type PageStart = { page: number; sura: number; aya: number }

let quranPromise: Promise<Map<number, string[]>> | null = null
let pageMapPromise: Promise<PageStart[]> | null = null

async function assetText(env: Env, path: string) {
  const url = new URL(path, 'https://assets.local')
  const response = await env.ASSETS.fetch(new Request(url.toString(), { headers: { accept: 'text/plain,application/json' } }))
  if (!response.ok) throw new Error(`Bundled Quran asset unavailable (${response.status})`)
  return response.text()
}

async function loadQuran(env: Env) {
  if (quranPromise) return quranPromise
  quranPromise = assetText(env, '/data/quran-uthmani-min.txt').then(text => {
    const result = new Map<number, string[]>()
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.trim()
      const match = line.match(/^(\d+)\|(\d+)\|(.*)$/)
      if (!match) continue
      const sura = Number(match[1])
      const aya = Number(match[2])
      const verses = result.get(sura) || []
      verses[aya] = match[3]
      result.set(sura, verses)
    }
    return result
  })
  return quranPromise
}

async function loadPageMap(env: Env) {
  if (pageMapPromise) return pageMapPromise
  pageMapPromise = assetText(env, '/data/mushaf/page-map.json').then(text => {
    const data = JSON.parse(text)
    if (!Array.isArray(data) || data.length !== 604) throw new Error('Invalid bundled Mushaf page map')
    return data.map((item: PageStart) => ({ page: Number(item.page), sura: Number(item.sura), aya: Number(item.aya) })).sort((a, b) => a.page - b.page)
  })
  return pageMapPromise
}

function verseKey(sura: number, aya: number) { return `${sura}:${aya}` }

function orderedVerses(quran: Map<number, string[]>) {
  const result: Verse[] = []
  for (const [sura, verses] of quran.entries()) {
    for (let aya = 1; aya < verses.length; aya++) {
      const text = verses[aya]
      if (text) result.push({ sura, aya, text, verse_key: verseKey(sura, aya) })
    }
  }
  return result
}

async function pageVerses(env: Env, pageNumber: number) {
  const [quran, pageMap] = await Promise.all([loadQuran(env), loadPageMap(env)])
  const all = orderedVerses(quran)
  const index = new Map(all.map((verse, i) => [verse.verse_key, i]))
  const page = Math.min(604, Math.max(1, Math.floor(pageNumber)))
  const current = pageMap[page - 1]
  const next = pageMap[page]
  const start = index.get(verseKey(current.sura, current.aya))
  if (start === undefined) throw new Error(`Mushaf page ${page} start boundary unavailable`)
  const end = next ? (index.get(verseKey(next.sura, next.aya)) ?? all.length) - 1 : all.length - 1
  return all.slice(start, end + 1).map(verse => ({
    verse_key: verse.verse_key,
    verse_number: verse.aya,
    page_number: page,
    sura: verse.sura,
    aya: verse.aya,
    text_uthmani: verse.text,
    text_qpc_hafs: verse.text,
  }))
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const match = url.pathname.match(/^\/api\/quran\/content\/verses\/by_page\/(\d+)$/)
    if (request.method === 'GET' && match) {
      try {
        const page = Number(match[1])
        if (!Number.isInteger(page) || page < 1 || page > 604) return json({ error: 'Page must be between 1 and 604.' }, 400)
        return json({ verses: await pageVerses(env, page) })
      } catch (error) {
        return json({ error: error instanceof Error ? error.message : 'Unable to load Quran page.' }, 500)
      }
    }

    if (url.pathname.startsWith('/api/')) return json({ error: 'API route not found.' }, 404)
    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>
