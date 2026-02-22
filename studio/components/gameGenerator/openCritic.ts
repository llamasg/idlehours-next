// studio/components/gameGenerator/openCritic.ts

export interface OpenCriticResult {
  id: number
  name: string
  topCriticScore?: number
}

/**
 * Search OpenCritic for a game. Returns the top match or null.
 * Note: OpenCritic is an unofficial public API — gracefully returns null on failure.
 */
export async function searchOpenCritic(gameName: string): Promise<OpenCriticResult | null> {
  try {
    const res = await fetch(
      `https://api.opencritic.com/api/game/search?criteria=${encodeURIComponent(gameName)}`,
    )
    if (!res.ok) return null

    const results = (await res.json()) as OpenCriticResult[]
    if (!results.length) return null

    const top = results[0]
    if (typeof top?.id !== 'number') return null

    // The search result may not include score; fetch the game detail to get it
    const detailRes = await fetch(`https://api.opencritic.com/api/game/${top.id}`)
    if (!detailRes.ok) return { id: top.id, name: top.name }

    const detail = (await detailRes.json()) as { topCriticScore?: number; name?: string }
    return {
      id: top.id,
      name: top.name,
      topCriticScore: typeof detail.topCriticScore === 'number' ? Math.round(detail.topCriticScore) : undefined,
    }
  } catch {
    // CORS or network error — return null, user can fill score manually
    return null
  }
}
