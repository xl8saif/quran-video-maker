type RequestLike = { headers: { get(name: string): string | null } }

export default function handler(request: RequestLike) {
  const country = request.headers.get('x-vercel-ip-country') || request.headers.get('cf-ipcountry') || ''
  const continent = request.headers.get('x-vercel-ip-continent') || ''
  const language = request.headers.get('accept-language') || ''

  return new Response(JSON.stringify({ country, continent, language }), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'private, no-store',
    },
  })
}
