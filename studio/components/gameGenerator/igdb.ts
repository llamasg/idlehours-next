// studio/components/gameGenerator/igdb.ts

export interface IgdbGame {
  id: number
  name: string
  summary?: string
  cover?: { url: string }
  platforms?: { name: string }[]
  genres?: { name: string }[]
  themes?: { name: string }[]
  multiplayer_modes?: { offlinecoop?: boolean; onlinecoop?: boolean }[]
}

/** Fetch a client_credentials token from Twitch. Caches in sessionStorage. */
export async function getTwitchToken(): Promise<string> {
  const cached = sessionStorage.getItem('twitch_token')
  if (cached) return cached

  const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID as string
  const clientSecret = import.meta.env.VITE_TWITCH_CLIENT_SECRET as string

  if (!clientId || !clientSecret) {
    throw new Error('VITE_TWITCH_CLIENT_ID and VITE_TWITCH_CLIENT_SECRET must be set in studio/.env.local')
  }

  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    { method: 'POST' },
  )
  if (!res.ok) throw new Error(`Twitch auth failed: ${res.status}`)

  const data = await res.json()
  const token = data.access_token as string
  sessionStorage.setItem('twitch_token', token)
  return token
}

/**
 * Search IGDB for games matching the query.
 * Returns up to 5 main-game results with the fields we need.
 */
export async function searchIGDB(query: string): Promise<IgdbGame[]> {
  const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID as string
  const token = await getTwitchToken()

  const body = [
    `fields name,summary,cover.url,platforms.name,genres.name,themes.name,multiplayer_modes.offlinecoop,multiplayer_modes.onlinecoop;`,
    `search "${query.replace(/"/g, '')}";`,
    `where category = 0;`,  // main games only (no DLC, ports, etc.)
    `limit 5;`,
  ].join(' ')

  const res = await fetch('https://api.igdb.com/v4/games', {
    method: 'POST',
    headers: {
      'Client-ID': clientId,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'text/plain',
    },
    body,
  })

  if (!res.ok) {
    // Token may be expired — clear cache and throw so caller can retry
    sessionStorage.removeItem('twitch_token')
    throw new Error(`IGDB request failed: ${res.status}`)
  }

  return res.json() as Promise<IgdbGame[]>
}
