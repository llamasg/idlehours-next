// studio/components/gameGenerator/igdb.ts

export interface IgdbGame {
  id: number
  name: string
  summary?: string
  cover?: { url: string }
  artworks?: { url: string }[]
  platforms?: { name: string }[]
  genres?: { name: string }[]
  themes?: { name: string }[]
  multiplayer_modes?: { offlinecoop?: boolean; onlinecoop?: boolean }[]
  external_games?: { external_game_source: number; uid: string }[]
}

/**
 * Search IGDB for games matching the query.
 * Calls the Next.js server-side proxy which handles Twitch auth + IGDB request.
 * Returns up to 5 results with the fields we need.
 */
export async function searchIGDB(query: string): Promise<IgdbGame[]> {
  // Read inside function body so CJS schema extraction doesn't crash on import.meta
  const proxyUrl = import.meta.env.VITE_IGDB_PROXY_URL ?? 'https://idlehours.co.uk/api/igdb'
  const body = [
    `fields name,summary,cover.url,artworks.url,platforms.name,genres.name,themes.name,multiplayer_modes.offlinecoop,multiplayer_modes.onlinecoop,external_games.*;`,
    `search "${query.replace(/[";\\]/g, '')}";`,
    `limit 5;`,
  ].join(' ')

  const res = await fetch(proxyUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `IGDB request failed: ${res.status}`)
  }

  return res.json() as Promise<IgdbGame[]>
}
