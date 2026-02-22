'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@sanity/client'

export interface SanityGameCard {
  title: string
  slug: string
  coverImage: string | null
  shortDescription: string
  platforms: string[]
  affiliateLinks: { label: string; url: string }[]
}

// Public CDN client — no token needed for published documents
const cdnClient = createClient({
  projectId: 'ijj3h2lj',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-01-01',
})

const QUERY = `
  *[_type == "game" && slug.current == $slug][0] {
    title,
    "slug": slug.current,
    "coverImage": coverImage.asset->url,
    shortDescription,
    "platforms": coalesce(platforms, []),
    "affiliateLinks": coalesce(affiliateLinks, [])
  }
`

export function useSanityGame(slug: string | null) {
  const [game, setGame] = useState<SanityGameCard | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!slug) return

    let cancelled = false
    setLoading(true)

    cdnClient
      .fetch(QUERY, { slug })
      .then((result) => {
        if (!cancelled) {
          setGame(result ?? null)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setGame(null)
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  return { game, loading }
}
