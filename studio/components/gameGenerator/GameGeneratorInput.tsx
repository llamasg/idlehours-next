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
  const [imageWarning, setImageWarning] = useState<string | null>(null)

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
    setImageWarning(null)

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
          setImageWarning('Cover image could not be uploaded — all other fields applied. Upload the image manually.')
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

        {/* Image warning — survives success banner */}
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
