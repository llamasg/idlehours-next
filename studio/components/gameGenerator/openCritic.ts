// studio/components/gameGenerator/openCritic.ts

export interface OpenCriticResult {
  id: number
  name: string
  topCriticScore?: number
}

/**
 * Use Claude to look up the OpenCritic score and ID for a game.
 * Returns the top match or null if unknown.
 */
export async function searchOpenCritic(gameName: string): Promise<OpenCriticResult | null> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY ?? ''
  if (!apiKey) return null

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 100,
        messages: [{
          role: 'user',
          content: `Look up the OpenCritic page for the video game "${gameName}". What is the OpenCritic "top critic average" score (integer 0-100) and the numeric ID from the OpenCritic URL (e.g. opencritic.com/game/2671/stardew-valley has ID 2671)? Respond with ONLY raw JSON, no markdown, no code fences: {"score": 89, "id": 2671, "name": "Stardew Valley"} — use null for any value you are unsure about.`,
        }],
      }),
    })

    if (!res.ok) return null

    const data = await res.json()
    let text = (data?.content?.[0]?.text ?? '').trim()

    // Strip markdown code fences if present
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

    const parsed = JSON.parse(text)

    if (typeof parsed.id !== 'number' || parsed.id === null) return null

    return {
      id: parsed.id,
      name: parsed.name ?? gameName,
      topCriticScore: typeof parsed.score === 'number' ? Math.round(parsed.score) : undefined,
    }
  } catch {
    return null
  }
}
