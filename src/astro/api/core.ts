const API_URL = import.meta.env.WORDPRESS_API_URL

const cache = new Map<string, any>()

export async function fetchAPI(
  query = '',
  {
    variables,
  }: {
    variables?: { id?: string; idType?: string }
  } = {}
) {
  const headers = { 'Content-Type': 'application/json' }

  if (import.meta.env.WORDPRESS_AUTH_REFRESH_TOKEN) {
    headers['Authorization'] = `Bearer ${
      import.meta.env.WORDPRESS_AUTH_REFRESH_TOKEN
    }`
  }

  const body = JSON.stringify({
    query,
    variables,
  })

  const cacheKey = body?.replaceAll(/(\s|\\n)/g, '')
  if (cache.has(cacheKey)) {
    return structuredClone(cache.get(cacheKey))
  }

  // WPGraphQL Plugin must be enabled
  const res = await fetch(API_URL, {
    headers,
    method: 'POST',
    body,
  })

  const json = await res.json()
  const data = json.data
  if (json.errors) {
    console.error(json.errors)
    throw new Error('Failed to fetch API')
  } else {
    cache.set(cacheKey, data)
  }

  return structuredClone(data)
}
