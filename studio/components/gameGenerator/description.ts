// studio/components/gameGenerator/description.ts

export interface GameDescription {
  hook: string
  gameplay: string
  story: string
  length: string
  immersion: string
  replayability: string
  uniqueAngle: {
    label: string
    body: string
  }
}

function randomKey(): string {
  return Math.random().toString(36).slice(2, 10)
}

function block(style: string, text: string) {
  return {
    _type: 'block',
    _key: randomKey(),
    style,
    markDefs: [],
    children: [{_type: 'span', _key: randomKey(), text, marks: []}],
  }
}

/** Convert structured description JSON into Sanity Portable Text blocks. */
export function descriptionToBlocks(desc: GameDescription): any[] {
  return [
    block('normal', desc.hook),
    block('h2', 'Gameplay'),
    block('normal', desc.gameplay),
    block('h2', 'Story'),
    block('normal', desc.story),
    block('h2', 'How Long Is It'),
    block('normal', desc.length),
    block('h2', 'Atmosphere'),
    block('normal', desc.immersion),
    block('h2', 'Replayability'),
    block('normal', desc.replayability),
    block('h2', desc.uniqueAngle.label),
    block('normal', desc.uniqueAngle.body),
  ]
}

const COPY_BRIEF = `You are a copywriter for Idle Hours, a cozy gaming website.

VOICE & TONE:
- Warm and specific, like a friend who plays a lot of games
- UK English throughout EXCEPT spell "cozy" not "cosy"
- Short sentences. Vary the rhythm deliberately.
- Contractions always ("you're" not "you are", "it's" not "it is")
- Second person where natural but don't overdo it

NEVER DO:
- No em dashes. Use commas or full stops instead.
- No genre comparisons ("the Dark Souls of farming", "Minecraft meets Stardew Valley")
- No "not just X, it's Y" constructions
- Never use: hidden gem, masterpiece, must-play, game-changing, iconic, unique, amazing, journey, incredible, fantastic, wonderful, nostalgia trip, casual gamers, cosy
- No: "In conclusion", "To sum up", "At the end of the day"
- No: "I think", "I feel", "I believe"
- Never start with "Literally" unless literal
- Don't sound like a press release or a review aggregator
- The angle should feel like something a real fan would tell you down the pub

RESPOND WITH ONLY RAW JSON, no markdown, no code fences:

{
  "hook": "One sentence capturing the feeling of the game. Lead with emotion not genre.",
  "gameplay": "What you actually do day to day. Be specific. If it's a farming game, say what farming feels like, not just that farming exists.",
  "story": "How much narrative is there. Linear, emergent, or minimal. Does it have an ending or keep going.",
  "length": "Honest estimate of playtime. Weekend game or 200-hour game. Does it overstay its welcome or leave you wanting more.",
  "immersion": "Atmosphere, music, art style. What it actually feels like to sit with this game. A feeling, not a feature list.",
  "replayability": "Honest reasons to go back. Or honest reasons not to. Don't oversell a one-and-done experience.",
  "uniqueAngle": {
    "label": "3-5 word label for the one genuinely distinct thing. E.g. 'Romanceable Villagers' or 'Grief as a Game Mechanic'",
    "body": "2-3 sentences about this quality. The thing a real fan would bring up unprompted. Specific, warm, no hype."
  }
}`

/**
 * Call Claude Haiku to generate a structured game description.
 * Returns null if the API key is missing or the call fails.
 */
export async function generateDescription(
  gameName: string,
  summary: string,
  platforms: string[],
  genres: string[],
  coop: boolean,
): Promise<{desc: GameDescription; blocks: any[]} | null> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY ?? ''
  if (!apiKey) return null

  const context = [
    `Game: "${gameName}"`,
    summary ? `IGDB summary: ${summary}` : '',
    platforms.length ? `Platforms: ${platforms.join(', ')}` : '',
    genres.length ? `Genres: ${genres.join(', ')}` : '',
    coop ? 'Supports co-op/multiplayer' : '',
  ]
    .filter(Boolean)
    .join('\n')

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
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `${COPY_BRIEF}\n\n---\n\n${context}`,
          },
        ],
      }),
    })

    if (!res.ok) return null

    const data = await res.json()
    let text = (data?.content?.[0]?.text ?? '').trim()
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

    const desc: GameDescription = JSON.parse(text)

    // Validate required fields
    if (!desc.hook || !desc.gameplay || !desc.uniqueAngle?.label) return null

    return {desc, blocks: descriptionToBlocks(desc)}
  } catch {
    return null
  }
}
