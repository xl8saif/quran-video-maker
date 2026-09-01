const AUTH_BASE_BY_ENV = {
  prelive: 'https://prelive-oauth2.quran.foundation',
  production: 'https://oauth2.quran.foundation',
} as const

type QfEnv = keyof typeof AUTH_BASE_BY_ENV

type TokenResponse = {
  access_token?: unknown
  expires_in?: unknown
}

function getConfig() {
  const clientId = process.env.QF_CLIENT_ID
  const clientSecret = process.env.QF_CLIENT_SECRET
  const env = (process.env.QF_ENV ?? 'prelive') as string

  if (!clientId || !clientSecret) {
    throw new Error('Quran Foundation OAuth credentials are not configured')
  }

  if (!(env in AUTH_BASE_BY_ENV)) {
    throw new Error("QF_ENV must be 'prelive' or 'production'")
  }

  return {
    clientId,
    clientSecret,
    env: env as QfEnv,
  }
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', Allow: 'POST' },
    })
  }

  try {
    const { clientId, clientSecret, env } = getConfig()
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    const response = await fetch(`${AUTH_BASE_BY_ENV[env]}/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        scope: 'content',
      }),
    })

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Quran Foundation token request failed' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const token = (await response.json()) as TokenResponse
    if (typeof token.access_token !== 'string' || typeof token.expires_in !== 'number') {
      return new Response(JSON.stringify({ error: 'Invalid token response from Quran Foundation' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(
      JSON.stringify({
        access_token: token.access_token,
        expires_in: token.expires_in,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      },
    )
  } catch (error) {
    console.error('Quran Foundation token retrieval failed:', error instanceof Error ? error.message : 'unknown error')
    return new Response(JSON.stringify({ error: 'Unable to retrieve Quran Foundation token' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
