import type { Metadata } from 'next'
import { getAllGames } from '@/lib/queries'
import GamesPage from '../page'

// ── Metadata ─────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const games = await getAllGames()
  const game = (games ?? []).find((g: any) => g.slug.current === slug)
  if (!game) return {}
  return {
    title: game.title,
    description: game.shortDescription,
    openGraph: {
      title: game.title,
      description: game.shortDescription,
      images: game.coverImage ? [{ url: game.coverImage }] : [],
    },
  }
}

// ── Page ─────────────────────────────────────────────────────────────────
export default async function GameSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <GamesPage initialLightboxSlug={slug} />
}
