'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

/* ------------------------------------------------------------------ */
/*  Static game data (intentionally duplicated to avoid side-effects) */
/* ------------------------------------------------------------------ */
const PLAY_HUB_GAMES = [
  { id: 'game-sense',  title: 'Game Sense',  href: '/play/game-sense',  icon: '\u{1F3AE}', description: 'Guess the game from clues',       color: 'bg-violet-500/10 border-violet-500/20' },
  { id: 'street-date', title: 'Street Date', href: '/play/street-date', icon: '\u{1F4C5}', description: 'Guess the release year',           color: 'bg-amber-500/10 border-amber-500/20' },
  { id: 'shelf-price', title: 'Shelf Price', href: '/play/shelf-price', icon: '\u{1F4B0}', description: 'Guess the launch price',            color: 'bg-emerald-500/10 border-emerald-500/20' },
  { id: 'ship-it',     title: 'Ship It',     href: '/play/ship-it',     icon: '\u{1F4E6}', description: 'Navigate publisher meetings',       color: 'bg-rose-500/10 border-rose-500/20' },
]

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface DiscoverMoreProps {
  currentGame?: string
}

interface BlogPost {
  title: string
  slug: string
  image: string | null
  category: string | null
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function DiscoverMore({ currentGame }: DiscoverMoreProps) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)

  /* Fetch blog posts on mount */
  useEffect(() => {
    fetch('/api/featured-content')
      .then((r) => r.json())
      .then((data) => {
        setPosts(data.posts ?? [])
        setPostsLoading(false)
      })
      .catch(() => {
        setPosts([])
        setPostsLoading(false)
      })
  }, [])

  const otherGames = PLAY_HUB_GAMES.filter((g) => g.id !== currentGame)
  const showPosts = postsLoading || posts.length > 0

  return (
    <div className="mt-12 border-t border-border/40 pt-8">
      {/* Overall heading */}
      <p className="font-heading text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-6">
        More from Idle Hours
      </p>

      {/* ---- Section 1: Try another game ---- */}
      <SectionLabel>Try another game</SectionLabel>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {otherGames.map((game) => (
          <Link
            key={game.id}
            href={game.href}
            className={`rounded-xl border p-3 transition-transform hover:scale-[1.02] ${game.color}`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{game.icon}</span>
              <span className="font-heading text-sm font-semibold">{game.title}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{game.description}</p>
          </Link>
        ))}
      </div>

      {/* ---- Section 2: Worth reading ---- */}
      {showPosts && (
        <>
          <SectionLabel className="mt-8">Worth reading</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            {postsLoading
              ? Array.from({ length: 2 }).map((_, i) => <PostSkeleton key={i} />)
              : posts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group rounded-xl border border-border/60 bg-card overflow-hidden transition-transform hover:scale-[1.01]"
                  >
                    {/* Image */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                      {post.image ? (
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          sizes="(max-width: 640px) 50vw, 300px"
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-muted to-muted-foreground/10" />
                      )}
                    </div>

                    {/* Text */}
                    <div className="p-3">
                      {post.category && (
                        <span className="mb-1 inline-block rounded-full bg-muted px-2 py-0.5 font-heading text-[10px] text-muted-foreground">
                          {post.category}
                        </span>
                      )}
                      <h3 className="font-heading text-sm font-semibold leading-snug line-clamp-2">
                        {post.title}
                      </h3>
                    </div>
                  </Link>
                ))}
          </div>
        </>
      )}

      {/* ---- Section 3: Stay in the loop ---- */}
      <SectionLabel className="mt-8">Stay in the loop</SectionLabel>
      {submitted ? (
        <p className="font-body text-sm text-muted-foreground">
          You&apos;re in! We&apos;ll be in touch.
        </p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setSubmitted(true)
          }}
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <span className="font-body text-sm text-muted-foreground">
            Good games. Good reads. Once a week.
          </span>
          <input
            type="email"
            required
            placeholder="your@email.com"
            className="rounded-full border border-border/60 bg-transparent px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            className="rounded-full bg-primary px-4 py-2 text-sm font-heading font-semibold text-white"
          >
            Subscribe
          </button>
        </form>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Small helpers                                                      */
/* ------------------------------------------------------------------ */

function SectionLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`font-heading text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-2 ${className}`}>
      {children}
    </p>
  )
}

function PostSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      <div className="aspect-[16/9] w-full animate-pulse bg-muted" />
      <div className="space-y-2 p-3">
        <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}
