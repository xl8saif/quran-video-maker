import { getQfAccessToken, getQfApiBase, getQfConfig, clearQfToken } from './_auth'

export async function GET(req: Request): Promise<Response> {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', Allow: 'GET' },
    })
  }

  try {
    const { clientId, env } = getQfConfig()
    const url = new URL(`${getQfApiBase(env)}/content/api/v4/chapters`)
    const language = new URL(req.url).searchParams.get('language') ?? 'en'
    if (language) url.searchParams.set('language', language)

    const request = async (forceRefresh = false) => {
      const token = await getQfAccessToken(forceRefresh)
      return fetch(url, {
        headers: {
          'x-auth-token': token,
          'x-client-id': clientId,
        },
      })
    }

    let response = await request()
    if (response.status === 401) {
      clearQfToken()
      response = await request(true)
    }

    if (!response.ok) {
      const status = response.status === 403 ? 502 : response.status
      return new Response(JSON.stringify({ error: 'Quran Foundation chapters request failed' }), {
        status,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const data = await response.json() as { chapters?: unknown }
    if (!Array.isArray(data.chapters)) {
      return new Response(JSON.stringify({ error: 'Invalid chapters response from Quran Foundation' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Quran Foundation chapters request failed:', error instanceof Error ? error.message : 'unknown error')
    return new Response(JSON.stringify({ error: 'Unable to retrieve Quran Foundation chapters' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
