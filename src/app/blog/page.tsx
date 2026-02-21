'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { getAllPosts } from '@/lib/queries'

interface Post {
  _id: string
  title: string
  slug: { current: string }
  subheader: string
  publishedAt: string
  author: string
  headerImage: string
  categories: string[]
}

const CATEGORIES = ['All', 'Lists', 'Opinions', 'Recommendations']
const POSTS_PER_PAGE = 9

export default function BlogPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') ?? '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') ?? 'All')
  const [visiblePosts, setVisiblePosts] = useState(POSTS_PER_PAGE)

  useEffect(() => {
    getAllPosts().then((data) => { setPosts(data); setLoading(false) })
  }, [])

  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('search', searchQuery)
    if (selectedCategory !== 'All') params.set('category', selectedCategory)
    const qs = params.toString()
    router.replace(qs ? `/blog?${qs}` : '/blog', { scroll: false })
  }, [searchQuery, selectedCategory, router])

  const filteredPosts = useMemo(() => {
    let filtered = posts
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((p) => p.categories?.includes(selectedCategory))
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.subheader?.toLowerCase().includes(q) ||
          p.categories?.some((c) => c.toLowerCase().includes(q))
      )
    }
    return filtered
  }, [posts, selectedCategory, searchQuery])

  const displayed = filteredPosts.slice(0, visiblePosts)
  const hasMore = displayed.length < filteredPosts.length

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-12">
          <div className="h-64 animate-pulse rounded-3xl bg-muted/40" />
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className="mb-4 font-heading text-4xl font-black text-foreground md:text-5xl lg:text-6xl">
            Posts
          </h1>
          <p className="text-lg text-muted-foreground">
            Tips, reviews, and thoughtful takes on the cozy gaming life
          </p>
        </motion.div>

        <div className="mb-8 space-y-4">
          <div className="relative mx-auto max-w-2xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 w-full rounded-full border border-border/60 bg-muted/40 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setVisiblePosts(POSTS_PER_PAGE) }}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-muted/40 text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {(searchQuery || selectedCategory !== 'All') && (
          <p className="mb-6 text-center text-sm text-muted-foreground">
            Found {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
          </p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayed.map((post, i) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <Link href={`/blog/${post.slug.current}`}>
                <motion.article
                  whileHover={{ y: -4 }}
                  className="group h-full overflow-hidden rounded-2xl border border-border/40 bg-card"
                >
                  <div className="aspect-[16/10] w-full overflow-hidden bg-secondary">
                    {post.headerImage && (
                      <img
                        src={post.headerImage}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="flex flex-col p-5">
                    {post.categories?.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {post.categories.slice(0, 2).map((c) => (
                          <span
                            key={c}
                            className="rounded-full bg-primary/20 px-2.5 py-0.5 font-heading text-[10px] font-bold uppercase tracking-widest text-primary"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                    <h2 className="mb-2 font-heading text-lg font-bold leading-snug text-foreground line-clamp-2 group-hover:text-primary">
                      {post.title}
                    </h2>
                    <p className="mb-4 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                      {post.subheader}
                    </p>
                    <div className="mt-auto text-xs text-muted-foreground">
                      {new Date(post.publishedAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      · {post.author}
                    </div>
                  </div>
                </motion.article>
              </Link>
            </motion.div>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="rounded-2xl border border-border/40 bg-card p-12 text-center">
            <p className="mb-2 text-lg text-foreground">No posts found</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All') }}
              className="mt-4 text-sm text-primary hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {hasMore && (
          <div className="mt-12 text-center">
            <button
              onClick={() => setVisiblePosts((n) => n + POSTS_PER_PAGE)}
              className="rounded-full border border-border px-8 py-2.5 font-heading text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              Load More
            </button>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
