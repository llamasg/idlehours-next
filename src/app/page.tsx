import HomepageClient from '@/components/HomepageClient'
import { getAllGames, getAllPosts, getHomepageConfig } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [games, posts, config] = await Promise.all([
    getAllGames(),
    getAllPosts(),
    getHomepageConfig(),
  ])

  return (
    <HomepageClient
      games={games ?? []}
      posts={posts ?? []}
      featuredPost={config?.featuredPost ?? null}
    />
  )
}
