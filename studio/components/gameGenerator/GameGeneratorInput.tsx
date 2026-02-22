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
import {searchOpenCritic} from './openCritic'
import {generateDescription, type GameDescription} from './description'
import {mapPlatforms, mapGenres, slugify, truncate} from './mappings'

// ── Types ─────────────────────────────────────────────────────────────────────

interface GeneratedData {
  title: string
  slug: string
  shortDescription: string
  coverImageUrl: string | null
  platforms: string[]
  genre: string[]
  coop: boolean
  openCriticScore: number | null
  openCriticId: string | null
  steamAppId: string | null
  affiliateLinks: {_key: string; label: string; url: string}[]
  longDescriptionBlocks: any[] | null
  descriptionPreview: GameDescription | null
}

// ── Component ─────────────────────────────────────────────────────────────────

export function GameGeneratorInput() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<GeneratedData | null>(null)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [imageWarning, setImageWarning] = useState<string | null>(null)

  const documentId = useFormValue(['_id']) as string | undefined
  const client = useClient({apiVersion: '2024-01-01'})

  // ── Search handler ───────────────────────────────────────────────────────────

  async function handleGenerate() {
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    setPreview(null)
    setApplied(false)
    setImageWarning(null)

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

      // Prefer horizontal artwork over vertical cover
      let coverImageUrl: string | null = null
      const rawUrl = game.artworks?.[0]?.url ?? game.cover?.url
      if (rawUrl) {
        const url = rawUrl.startsWith('//') ? `https:${rawUrl}` : rawUrl
        coverImageUrl = game.artworks?.[0]
          ? url.replace('t_thumb', 't_screenshot_huge')
          : url.replace('t_thumb', 't_cover_big')
      }

      const platforms = mapPlatforms((game.platforms ?? []).map((p) => p.name))
      const genre = mapGenres([
        ...(game.genres ?? []).map((g) => g.name),
        ...(game.themes ?? []).map((t) => t.name),
      ])
      const coop = (game.multiplayer_modes ?? []).some(
        (m) => m.offlinecoop || m.onlinecoop,
      )
      const steamAppId =
        (game.external_games ?? []).find((e) => e.external_game_source === 1)
          ?.uid ?? null

      // Build affiliate links from known IDs
      const affiliateLinks: {_key: string; label: string; url: string}[] = []
      if (steamAppId) {
        affiliateLinks.push({
          _key: 'steam',
          label: 'Steam',
          url: `https://store.steampowered.com/app/${steamAppId}/`,
        })
      }

      // Generate long description with Claude (non-blocking, don't fail the whole generate)
      const descResult = await generateDescription(
        game.name,
        game.summary ?? '',
        platforms,
        genre,
        coop,
      ).catch(() => null)

      const generated: GeneratedData = {
        title: game.name,
        slug: slugify(game.name),
        shortDescription: truncate(game.summary ?? '', 247),
        coverImageUrl,
        platforms,
        genre,
        coop,
        openCriticScore: ocResult?.topCriticScore ?? null,
        openCriticId: ocResult?.id != null ? String(ocResult.id) : null,
        steamAppId,
        affiliateLinks,
        longDescriptionBlocks: descResult?.blocks ?? null,
        descriptionPreview: descResult?.desc ?? null,
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
    setImageWarning(null)

    try {
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
      if (preview.steamAppId != null) {
        patch.steamAppId = preview.steamAppId
      }
      if (preview.affiliateLinks.length > 0) {
        patch.affiliateLinks = preview.affiliateLinks
      }
      if (preview.longDescriptionBlocks) {
        patch.longDescription = preview.longDescriptionBlocks
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
          setImageWarning(
            'Cover image could not be uploaded. All other fields applied. Upload the image manually.',
          )
        }
      }

      const patchId = documentId.startsWith('drafts.')
        ? documentId
        : `drafts.${documentId}`
      await client
        .transaction()
        .createIfNotExists({_id: patchId, _type: 'game'})
        .patch(patchId, (p) => p.set(patch))
        .commit()
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
          Auto-fill with IGDB + OpenCritic + Pip
        </Text>

        {/* Search row */}
        <Flex gap={2} align="flex-end">
          <Box flex={1}>
            <TextInput
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleGenerate()
              }}
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
            <Text size={1}>
              Fields applied! Review and adjust as needed, then publish.
            </Text>
          </Card>
        )}

        {/* Image warning */}
        {imageWarning && (
          <Card padding={3} tone="caution" radius={2}>
            <Text size={1}>{imageWarning}</Text>
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
                      style={{
                        width: 80,
                        height: 110,
                        objectFit: 'cover',
                        borderRadius: 4,
                      }}
                    />
                  </Box>
                )}

                <Stack space={2} flex={1}>
                  <Text size={1} muted>
                    <strong>Description:</strong>{' '}
                    {preview.shortDescription || '—'}
                  </Text>

                  <Flex gap={1} wrap="wrap">
                    {preview.platforms.map((p) => (
                      <Badge key={p} tone="primary" mode="outline">
                        {p}
                      </Badge>
                    ))}
                    {preview.genre.map((g) => (
                      <Badge key={g} tone="default" mode="outline">
                        {g}
                      </Badge>
                    ))}
                    {preview.coop && <Badge tone="positive">Co-op</Badge>}
                    {preview.openCriticScore != null && (
                      <Badge tone="caution">
                        {preview.openCriticScore}% OC
                      </Badge>
                    )}
                    {preview.steamAppId && (
                      <Badge tone="default">Steam {preview.steamAppId}</Badge>
                    )}
                  </Flex>

                  {/* Buy links preview */}
                  {preview.affiliateLinks.length > 0 && (
                    <Text size={1} muted>
                      <strong>Buy links:</strong>{' '}
                      {preview.affiliateLinks.map((l) => l.label).join(', ')}
                    </Text>
                  )}

                  {/* Warnings */}
                  {!preview.coverImageUrl && (
                    <Text size={1} muted>
                      No cover image found. Upload manually.
                    </Text>
                  )}
                  {preview.openCriticScore == null && (
                    <Text size={1} muted>
                      OpenCritic score not found. Set manually or let nightly
                      job fetch it.
                    </Text>
                  )}
                  {!preview.steamAppId && (
                    <Text size={1} muted>
                      Steam App ID not found. Set manually if needed.
                    </Text>
                  )}
                </Stack>
              </Flex>

              {/* Long description preview */}
              {preview.descriptionPreview && (
                <Card padding={3} radius={2} tone="default" border>
                  <Stack space={3}>
                    <Text size={1} weight="semibold">
                      Long Description Preview
                    </Text>
                    <Text size={1} style={{fontStyle: 'italic'}}>
                      {preview.descriptionPreview.hook}
                    </Text>
                    <Flex gap={1} wrap="wrap">
                      <Badge mode="outline">Gameplay</Badge>
                      <Badge mode="outline">Story</Badge>
                      <Badge mode="outline">Length</Badge>
                      <Badge mode="outline">Atmosphere</Badge>
                      <Badge mode="outline">Replayability</Badge>
                      <Badge mode="outline">
                        {preview.descriptionPreview.uniqueAngle.label}
                      </Badge>
                    </Flex>
                  </Stack>
                </Card>
              )}
              {!preview.descriptionPreview && (
                <Text size={1} muted>
                  Long description could not be generated. You can write one
                  manually.
                </Text>
              )}

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
