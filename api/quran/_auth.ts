const AUTH_BASE_BY_ENV = {
  prelive: 'https://prelive-oauth2.quran.foundation',
  production: 'https://oauth2.quran.foundation',
} as const

const API_BASE_BY_ENV = {
  prelive: 'https://apis-prelive.quran.foundation',
  production: 'https://apis.quran.foundation',
} as const

type QfEnv = keyof typeof AUTH_BASE_BY_ENV

type CachedToken = { access_token: string; expiresAt: number }
type TokenResponse = { access_token?: unknown; expires_in?: unknown }

let cachedToken: CachedToken | null = null
let tokenRequest: Promise<CachedToken> | null = null

export function getQfConfig() {
  const clientId = process.env.QF_CLIENT_ID
  const clientSecret = process.env.QF_CLIENT_SECRET
  const env = (process.env.QF_ENV ?? 'prelive') as string

  if (!clientId || !clientSecret) throw new Error('Quran Foundation OAuth credentials are not configured')
  if (!(env in AUTH_BASE_BY_ENV)) throw new Error("QF_ENV must be 'prelive' or 'production'")

  return { clientId, clientSecret, env: env as QfEnv }
}

export function getQfApiBase(env: QfEnv) {
  return API_BASE_BY_ENV[env]
}

async function requestToken(): Promise<CachedToken> {
  const { clientId, clientSecret, env } = getQfConfig()
  const response = await fetch(`${AUTH_BASE_BY_ENV[env]}/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'client_credentials', scope: 'content' }),
  })

  if (!response.ok) throw new Error(`Quran Foundation token request failed with status ${response.status}`)
  const token = (await response.json()) as TokenResponse
  if (typeof token.access_token !== 'string' || typeof token.expires_in !== 'number') {
    throw new Error('Invalid token response from Quran Foundation')
  }

  return { access_token: token.access_token, expiresAt: Date.now() + token.expires_in * 1000 }
}

export function clearQfToken() {
  cachedToken = null
}

export async function getQfAccessToken(forceRefresh = false) {
  if (!forceRefresh && cachedToken && Date.now() < cachedToken.expiresAt - 30_000) return cachedToken.access_token

  if (!tokenRequest) {
    tokenRequest = requestToken()
      .then(token => {
        cachedToken = token
        return token
      })
      .finally(() => { tokenRequest = null })
  }

  return (await tokenRequest).access_token
}
