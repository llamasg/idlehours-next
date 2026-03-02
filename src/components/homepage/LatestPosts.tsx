'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

// motion is used by PostCard whileHover

interface BlogPost {
  _id: string
  title: string
  slug: { current: string }
  headerImage?: string
  subheader?: string
  publishedAt: string
  author?: string
  categories?: string[]
}

interface LatestPostsProps {
  posts: BlogPost[]
}

function PostCard({ post, featured = false, compact = false }: { post: BlogPost; featured?: boolean; compact?: boolean }) {
  const dateStr = new Date(post.publishedAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  // Compact layout: horizontal card for the side column
  if (compact) {
    return (
      <Link href={`/blog/${post.slug.current}`} className="group h-full">
        <motion.article
          whileHover={{ y: -2 }}
          className="flex h-full overflow-hidden rounded-xl border border-border/40 bg-card"
        >
          <div className="w-[240px] shrink-0 overflow-hidden bg-secondary">
            {post.headerImage && (
              <img
                src={post.headerImage}
                alt={post.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
            )}
          </div>
          <div className="flex flex-1 flex-col justify-center p-3">
            <h3 className="font-heading text-sm font-bold leading-snug text-foreground line-clamp-2 group-hover:text-primary">
              {post.title}
            </h3>
            <span className="mt-1.5 inline-block w-fit rounded-full bg-secondary px-2 py-0.5 font-heading text-[10px] font-semibold text-muted-foreground">
              {dateStr}
            </span>
          </div>
        </motion.article>
      </Link>
    )
  }

  return (
    <Link href={`/blog/${post.slug.current}`} className="group">
      <motion.article
        whileHover={{ y: -4 }}
        className="overflow-hidden rounded-2xl border border-border/40 bg-card"
      >
        <div className={`w-full overflow-hidden bg-secondary ${featured ? 'aspect-[16/9]' : 'aspect-[16/10]'}`}>
          {post.headerImage && (
            <img
              src={post.headerImage}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
          )}
        </div>
        <div className="p-5">
          {post.categories && post.categories.length > 0 && (
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
          <h3 className={`mb-2 font-heading font-bold leading-tight text-foreground line-clamp-3 group-hover:text-primary ${featured ? 'text-3xl lg:text-4xl' : 'text-lg'}`}>
            {post.title}
          </h3>
          {featured && post.subheader && (
            <p className="mb-3 text-sm leading-relaxed text-muted-foreground line-clamp-2">
              {post.subheader}
            </p>
          )}
          <span className="mt-2 inline-block rounded-full bg-secondary px-3 py-1 font-heading text-[11px] font-semibold text-muted-foreground">
            {dateStr}
          </span>
        </div>
      </motion.article>
    </Link>
  )
}

function PlaceholderCard() {
  return (
    <div className="flex h-full overflow-hidden rounded-xl border border-border/20 bg-muted/30">
      <div className="w-[240px] shrink-0 bg-secondary/40" />
      <div className="flex flex-1 flex-col justify-center p-3">
        <div className="h-3.5 w-3/4 rounded bg-border/30" />
        <div className="mt-2 h-3 w-1/2 rounded bg-border/20" />
      </div>
    </div>
  )
}

export default function LatestPosts({ posts }: LatestPostsProps) {
  // Filter out posts with missing slugs
  const validPosts = posts.filter((p) => p.slug?.current)
  if (validPosts.length === 0) return null

  const [hero, ...rest] = validPosts.slice(0, 10)
  const sideCards = rest.slice(0, 3)
  const gridCards = rest.slice(3)

  // Pad side cards to 3 with placeholders
  const sideCount = sideCards.length
  const placeholderCount = Math.max(0, 3 - sideCount)

  return (
    <div className="space-y-6">
      {/* Hero row: wide card + 3 stacked, heights matched */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 lg:row-span-1">
          <PostCard post={hero} featured />
        </div>
        <div className="flex flex-col gap-3 lg:overflow-hidden">
          {sideCards.map((post) => (
            <div key={post._id} className="min-h-0 flex-1 overflow-hidden">
              <PostCard post={post} compact />
            </div>
          ))}
          {Array.from({ length: placeholderCount }).map((_, i) => (
            <div key={`placeholder-${i}`} className="min-h-0 flex-1 overflow-hidden">
              <PlaceholderCard />
            </div>
          ))}
        </div>
      </div>

      {/* Remaining grid */}
      {gridCards.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {gridCards.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
