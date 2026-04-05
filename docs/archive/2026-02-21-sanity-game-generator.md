Before starting any tasks, create and switch to a new git branch:

cd D:\websites\IdleHours
git checkout -b dev

All work should be done on this branch. Do not touch main.

At the end of Task 7, after sanity deploy succeeds, commit everything
and push the branch:

git add .
git commit -m "feat: game generator plugin"
git push origin dev

Do not merge to main — that will be done manually after review.

# Sanity Studio "Generate Game" Plugin

## Context
- Main site: Next.js, deployed to Vercel via git push
- Sanity Studio: lives locally at D:\websites\IdleHours\studio\
- Studio deploys separately via: cd studio && sanity deploy
- Studio is NOT part of the Next.js build or git deployment
- All plugin work happens inside the studio/ folder only

## Prerequisites (already done)
- Twitch app registered at dev.twitch.tv
- Add to studio/.env.local (this file is gitignored):
  VITE_TWITCH_CLIENT_ID=your_client_id
  VITE_TWITCH_CLIENT_SECRET=your_client_secret
- Note: VITE_ prefix is correct — Sanity Studio uses Vite internally
  regardless of the main site using Next.js

## Task 1: Mappings + slug utility

**Files:**
- Create: `studio/components/gameGenerator/mappings.ts`

**What this does:** Defines platform/genre mapping from IGDB names → our schema values, and a `slugify` helper.

**Step 1: Create the mappings file**

```ts
// studio/components/gameGenerator/mappings.ts

/** Maps IGDB platform name substrings → our platform values */
export const PLATFORM_MAP: Record<string, string> = {
  'Windows': 'PC',
  'Mac': 'PC',
  'Linux': 'PC',
  'Nintendo Switch': 'Switch',
  'PlayStation 5': 'PS5',
  'Xbox Series': 'Xbox',
  'Xbox One': 'Xbox',
  'iOS': 'Mobile',
  'Android': 'Mobile',
}

/** Our valid platform values */
export const VALID_PLATFORMS = ['PC', 'Switch', 'PS5', 'Xbox', 'Mobile'] as const

/** Maps IGDB genre/theme names → our genre tag values */
export const GENRE_MAP: Record<string, string> = {
  'Role-playing (RPG)': 'RPG',
  'Adventure': 'adventure',
  'Simulator': 'simulation',
  'Puzzle': 'puzzle',
  'Platform': 'platformer',
  'Horror': 'horror',
  'Survival': 'survival',
  'Sandbox': 'sandbox',
  'Visual Novel': 'visual novel',
  'Turn-based strategy (TBS)': 'turn-based',
  'Strategy': 'turn-based',
  'Hack and slash/Beat \'em up': 'adventure',
  'Indie': '',  // skip — not a genre tag in our schema
}

/** Our valid genre tag values */
export const VALID_GENRES = [
  'farming', 'survival', 'roguelike', 'turn-based', 'puzzle',
  'platformer', 'adventure', 'RPG', 'simulation', 'sandbox',
  'visual novel', 'horror',
] as const

/** Convert a game title to a URL-safe slug */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/** Map an array of IGDB platform names to our platform list (deduped) */
export function mapPlatforms(igdbPlatformNames: string[]): string[] {
  const result = new Set<string>()
  for (const name of igdbPlatformNames) {
    for (const [key, value] of Object.entries(PLATFORM_MAP)) {
      if (name.includes(key) && value) {
        result.add(value)
      }
    }
  }
  return Array.from(result).filter((p) => VALID_PLATFORMS.includes(p as any))
}

/** Map IGDB genre + theme names to our genre tag list (deduped) */
export function mapGenres(igdbNames: string[]): string[] {
  const result = new Set<string>()
  for (const name of igdbNames) {
    const mapped = GENRE_MAP[name]
    if (mapped && VALID_GENRES.includes(mapped as any)) {
      result.add(mapped)
    }
  }
  return Array.from(result)
}

/** Truncate a string to maxLength, appending "…" if cut */
export function truncate(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength - 1) + '…'
}
```

**Step 2: Verify the file exists**
```bash
ls studio/components/gameGenerator/
# Expected: mappings.ts
```

**Step 3: Commit**
```bash
git add studio/components/gameGenerator/mappings.ts
git commit -m "feat: add IGDB→schema field mappings and slug utility"
```

---

## Task 2: IGDB API client

**Files:**
- Create: `studio/components/gameGenerator/igdb.ts`

**What this does:** Fetches a Twitch OAuth bearer token, then queries IGDB for game data.

**Step 1: Create the IGDB client**

```ts
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
```

**Step 2: Commit**
```bash
git add studio/components/gameGenerator/igdb.ts
git commit -m "feat: add IGDB Twitch auth + game search client"
```

---

## Task 3: OpenCritic API client

**Files:**
- Create: `studio/components/gameGenerator/openCritic.ts`

**What this does:** Searches OpenCritic for a game name and returns the top match's ID and score.

**Step 1: Create the OpenCritic client**

```ts
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
```

**Step 2: Commit**
```bash
git add studio/components/gameGenerator/openCritic.ts
git commit -m "feat: add OpenCritic search client"
```

---

## Task 4: Build the GameGeneratorInput component (search UI + preview panel)

**Files:**
- Create: `studio/components/gameGenerator/GameGeneratorInput.tsx`
- Modify: `studio/schemaTypes/game.ts` — add `_generate` helper field at top

This is the main component. It renders:
1. A text input for the game name
2. A "Generate with Pip" button
3. On success: a preview panel with proposed field values
4. Two actions: "Apply to Document" (patches the doc) and "Cancel"

**Step 1: Create the component**

```tsx
// studio/components/gameGenerator/GameGeneratorInput.tsx

import {useState} from 'react'
import {
  Stack,
  Card,
  Text,
  TextInput,
  Button,
  Spinner,
  Flex,
  Box,
  Badge,
  Heading,
} from '@sanity/ui'
import {useClient, useFormValue} from 'sanity'
import {searchIGDB, type IgdbGame} from './igdb'
import {searchOpenCritic, type OpenCriticResult} from './openCritic'
import {mapPlatforms, mapGenres, slugify, truncate} from './mappings'

// ── Types ─────────────────────────────────────────────────────────────────────

interface GeneratedData {
  title: string
  slug: string
  shortDescription: string
  coverImageUrl: string | null  // raw IGDB CDN URL (https://...)
  platforms: string[]
  genre: string[]
  coop: boolean
  openCriticScore: number | null
  openCriticId: string | null
}

// ── Component ─────────────────────────────────────────────────────────────────

export function GameGeneratorInput() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<GeneratedData | null>(null)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)

  // The current document's draft ID (e.g. "drafts.abc123" or "abc123")
  const documentId = useFormValue(['_id']) as string | undefined
  const client = useClient({apiVersion: '2024-01-01'})

  // ── Search handler ───────────────────────────────────────────────────────────

  async function handleGenerate() {
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    setPreview(null)
    setApplied(false)

    try {
      // Fetch IGDB + OpenCritic in parallel
      const [igdbResults, ocResult] = await Promise.all([
        searchIGDB(query.trim()),
        searchOpenCritic(query.trim()),
      ])

      if (!igdbResults.length) {
        setError(`No games found on IGDB for "${query}". Try a different spelling.`)
        return
      }

      const game: IgdbGame = igdbResults[0]

      // Build cover image URL (upgrade thumb → cover_big)
      let coverImageUrl: string | null = null
      if (game.cover?.url) {
        const url = game.cover.url.startsWith('//')
          ? `https:${game.cover.url}`
          : game.cover.url
        coverImageUrl = url.replace('t_thumb', 't_cover_big')
      }

      const generated: GeneratedData = {
        title: game.name,
        slug: slugify(game.name),
        shortDescription: truncate(game.summary ?? '', 247),
        coverImageUrl,
        platforms: mapPlatforms((game.platforms ?? []).map((p) => p.name)),
        genre: mapGenres([
          ...(game.genres ?? []).map((g) => g.name),
          ...(game.themes ?? []).map((t) => t.name),
        ]),
        coop:
          (game.multiplayer_modes ?? []).some(
            (m) => m.offlinecoop || m.onlinecoop,
          ),
        openCriticScore: ocResult?.topCriticScore ?? null,
        openCriticId: ocResult?.id != null ? String(ocResult.id) : null,
      }

      setPreview(generated)
    } catch (err: any) {
      setError(err?.message ?? 'Unknown error. Check your .env.local credentials.')
    } finally {
      setLoading(false)
    }
  }

  // ── Apply handler ────────────────────────────────────────────────────────────

  async function handleApply() {
    if (!preview || !documentId) return
    setApplying(true)
    setError(null)

    try {
      // Build the patch object with all non-image fields
      const patch: Record<string, any> = {
        title: preview.title,
        slug: {_type: 'slug', current: preview.slug},
        shortDescription: preview.shortDescription,
        platforms: preview.platforms,
        genre: preview.genre,
        coop: preview.coop,
      }

      if (preview.openCriticScore != null) {
        patch.openCriticScore = preview.openCriticScore
      }
      if (preview.openCriticId != null) {
        patch.openCriticId = preview.openCriticId
      }

      // Upload cover image to Sanity assets if available
      if (preview.coverImageUrl) {
        try {
          const imgRes = await fetch(preview.coverImageUrl)
          const blob = await imgRes.blob()
          const asset = await client.assets.upload('image', blob, {
            filename: `${preview.slug}-cover.jpg`,
          })
          patch.coverImage = {
            _type: 'image',
            asset: {_type: 'reference', _ref: asset._id},
          }
        } catch {
          // Image upload failed — skip it, user can upload manually
          setError('Cover image could not be uploaded — all other fields applied. Upload the image manually.')
        }
      }

      // Apply the patch to the document
      await client.patch(documentId).set(patch).commit()
      setApplied(true)
      setPreview(null)
    } catch (err: any) {
      setError(`Failed to apply: ${err?.message}`)
    } finally {
      setApplying(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Card padding={4} radius={2} shadow={1} tone="primary">
      <Stack space={3}>
        <Text size={1} weight="semibold">
          Auto-fill with IGDB + OpenCritic
        </Text>

        {/* Search row */}
        <Flex gap={2} align="flex-end">
          <Box flex={1}>
            <TextInput
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleGenerate() }}
              placeholder="e.g. Stardew Valley"
              disabled={loading || applying}
            />
          </Box>
          <Button
            text={loading ? 'Searching…' : 'Generate with Pip'}
            tone="primary"
            onClick={handleGenerate}
            disabled={!query.trim() || loading || applying}
            icon={loading ? Spinner : undefined}
          />
        </Flex>

        {/* Error */}
        {error && (
          <Card padding={3} tone="critical" radius={2}>
            <Text size={1}>{error}</Text>
          </Card>
        )}

        {/* Success confirmation */}
        {applied && (
          <Card padding={3} tone="positive" radius={2}>
            <Text size={1}>✓ Fields applied! Review and adjust as needed, then publish.</Text>
          </Card>
        )}

        {/* Preview panel */}
        {preview && (
          <Card padding={4} radius={2} border>
            <Stack space={4}>
              <Heading size={1}>Preview — {preview.title}</Heading>

              <Flex gap={4}>
                {/* Cover image thumbnail */}
                {preview.coverImageUrl && (
                  <Box style={{flexShrink: 0}}>
                    <img
                      src={preview.coverImageUrl}
                      alt={preview.title}
                      style={{width: 80, height: 110, objectFit: 'cover', borderRadius: 4}}
                    />
                  </Box>
                )}

                <Stack space={2} flex={1}>
                  <Text size={1} muted>
                    <strong>Description:</strong> {preview.shortDescription || '—'}
                  </Text>

                  <Flex gap={1} wrap="wrap">
                    {preview.platforms.map((p) => (
                      <Badge key={p} tone="primary" mode="outline">{p}</Badge>
                    ))}
                    {preview.genre.map((g) => (
                      <Badge key={g} tone="default" mode="outline">{g}</Badge>
                    ))}
                    {preview.coop && <Badge tone="positive">Co-op</Badge>}
                    {preview.openCriticScore != null && (
                      <Badge tone="caution">{preview.openCriticScore}% OC</Badge>
                    )}
                  </Flex>

                  {!preview.coverImageUrl && (
                    <Text size={1} muted>No cover image found — upload manually.</Text>
                  )}
                  {preview.openCriticScore == null && (
                    <Text size={1} muted>OpenCritic score not found — set manually or let nightly job fetch it.</Text>
                  )}
                </Stack>
              </Flex>

              {/* Action buttons */}
              <Flex gap={2}>
                <Button
                  text={applying ? 'Applying…' : 'Apply to Document'}
                  tone="positive"
                  onClick={handleApply}
                  disabled={applying}
                />
                <Button
                  text="Cancel"
                  mode="ghost"
                  onClick={() => setPreview(null)}
                  disabled={applying}
                />
              </Flex>
            </Stack>
          </Card>
        )}
      </Stack>
    </Card>
  )
}
```

**Step 2: Add the helper field to the game schema**

Open `studio/schemaTypes/game.ts`. Add this as the FIRST item in the `fields` array (before `title`):

```ts
// At top of file, add import:
import {GameGeneratorInput} from '../components/gameGenerator/GameGeneratorInput'

// First field in fields array:
defineField({
  name: '_generate',
  title: 'Auto-fill',
  type: 'string',
  components: {
    input: GameGeneratorInput,
  },
}),
```

The `_generate` field is a hidden helper — the component never calls `onChange` on it, so it stores no value in the document. It purely renders the generator UI.

**Step 3: Verify the studio starts without errors**
```bash
cd studio && npm run dev
```
Expected: Studio starts, no TypeScript/import errors. Open a Game document and the generate panel appears at the top.

**Step 4: Commit**
```bash
git add studio/components/gameGenerator/GameGeneratorInput.tsx studio/schemaTypes/game.ts
git commit -m "feat: add GameGeneratorInput component and wire to game schema"
```

## Task 5: CORS proxy for local dev

IGDB blocks browser requests so add a Vite proxy to studio/vite.config.ts:

import {defineConfig} from 'vite'

export default defineConfig({
  server: {
    proxy: {
      '/igdb': {
        target: 'https://api.igdb.com/v4',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/igdb/, ''),
      },
    },
  },
})

In studio/components/gameGenerator/igdb.ts, change the fetch URL from:
https://api.igdb.com/v4/games
To:
/igdb/games

This proxy only works during local npm run dev — that is fine because
game generation will always be done locally, not on the deployed studio.

## Task 6: Test locally

cd studio && npm run dev

Open http://localhost:3333 and test with "roblox".

Checklist:
- [ ] Generate with Pip button appears on game documents
- [ ] Preview shows title, cover image, platforms, genres, OC score
- [ ] Apply to Document patches all fields in Sanity
- [ ] difficulty, replayability, greatSoundtrack left blank for manual entry
- [ ] _generate field does NOT appear in the Sanity document data

## Task 7: Build and deploy Studio

cd studio && npm run build
cd studio && sanity deploy

Do NOT run git push for studio changes — studio deploys via
sanity deploy only, completely separate from the Next.js site.

## Important
Do not touch anything outside of the studio/ folder.
Do not modify package.json at the project root.
Do not add studio dependencies to the Next.js project.