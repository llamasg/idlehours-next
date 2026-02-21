import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ExternalLink, Disc3 } from 'lucide-react'
import { PortableText } from '@portabletext/react'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import GameTileCard from '@/components/GameTileCard'
import { getGame, getAllGames } from '@/lib/queries'
import type { Game } from '@/types'

// Portable Text components (shared style with blog)
const bodyComponents = {
  block: {
    h2: ({ children }: any) => (
      <h2 className="mt-10 mb-5 font-heading text-2xl font-bold text-foreground">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="mt-8 mb-4 font-heading text-xl font-bold text-foreground">{children}</h3>
    ),
    normal: ({ children }: any) => (
      <p className="mb-5 text-lg leading-relaxed text-muted-foreground">{children}</p>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="my-6 border-l-4 border-primary/40 bg-primary/5 py-2 pl-5 italic text-muted-foreground rounded-r">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="mb-5 ml-6 list-disc space-y-2 text-lg text-muted-foreground">{children}</ul>
    ),
    number: ({ children }: any) => (
      <ol className="mb-5 ml-6 list-decimal space-y-2 text-lg text-muted-foreground">{children}</ol>
    ),
  },
  marks: {
    strong: ({ children }: any) => <strong className="font-bold text-foreground">{children}</strong>,
    em: ({ children }: any) => <em className="italic">{children}</em>,
    link: ({ value, children }: any) => (
      <a
        href={value.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline decoration-primary/30 hover:decoration-primary transition-colors"
      >
        {children}
      </a>
    ),
  },
}

function ocColor(score: number): string {
  if (score >= 90) return 'bg-purple-600 text-white'
  if (score >= 75) return 'bg-rose-500 text-white'
  if (score >= 50) return 'bg-green-600 text-white'
  return 'bg-blue-500 text-white'
}

function DifficultyLabel({ level }: { level: 1 | 2 | 3 }) {
  const labels = { 1: 'Beginner', 2: 'Intermediate', 3: 'Experienced' } as const
  return (
    <div className="flex items-center gap-1.5" title={labels[level]}>
      {([1, 2, 3] as const).map((i) => (
        <span
          key={i}
          className={`inline-block h-2.5 w-2.5 rounded-full ${i <= level ? 'bg-amber-500' : 'bg-muted-foreground/20'}`}
        />
      ))}
      <span className="ml-1 font-heading text-sm text-muted-foreground">{labels[level]}</span>
    </div>
  )
}

function ReplayMeter({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1" title={`Replayability: ${value}/5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = value >= i
        const half = !filled && value >= i - 0.5
        return (
          <span
            key={i}
            className={`inline-block h-2.5 w-2.5 rounded-full ${
              filled ? 'bg-accent-green' : half ? 'bg-accent-green/50' : 'bg-muted-foreground/20'
            }`}
          />
        )
      })}
      <span className="ml-1 font-heading text-sm text-muted-foreground">{value}/5 replay</span>
    </div>
  )
}

export default function GameDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [game, setGame] = useState<Game | null>(null)
  const [related, setRelated] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    setLoading(true)

    Promise.all([
      getGame(slug),
      getAllGames(),
    ]).then(([gameData, allGames]) => {
      setGame(gameData ?? null)
      const others = (allGames ?? []).filter((g: Game) => g.slug.current !== slug)
      setRelated(others.slice(0, 4))
    }).catch(() => {
      setGame(null)
    }).finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-16 lg:px-8 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </main>
        <SiteFooter />
      </div>
    )
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-16 text-center lg:px-8">
          <p className="font-heading text-xl font-semibold text-foreground">Game not found</p>
          <Link to="/games" className="mt-4 inline-block text-primary underline">Back to games</Link>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
        {/* Back link */}
        <Link
          to="/games"
          className="mb-6 inline-flex items-center gap-1.5 font-heading text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Game Library
        </Link>

        {/* Hero card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm"
        >
          <div className="grid gap-0 lg:grid-cols-[1.4fr_1fr]">
            {/* Cover image */}
            <div className="relative aspect-[16/10] overflow-hidden bg-secondary lg:aspect-auto lg:min-h-[400px]">
              {game.coverImage ? (
                <img src={game.coverImage} alt={game.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-secondary to-muted">
                  <span className="font-heading text-muted-foreground">No image</span>
                </div>
              )}
            </div>

            {/* Info panel */}
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
              <h1 className="font-heading text-3xl font-bold text-foreground lg:text-4xl">
                {game.title}
              </h1>

              {/* Rating icons */}
              <div className="mt-4 flex flex-wrap items-center gap-4">
                {game.openCriticScore != null && (
                  <span className={`rounded-full px-3 py-1 font-heading text-sm font-bold shadow ${ocColor(game.openCriticScore)}`}>
                    {game.openCriticScore} OpenCritic
                  </span>
                )}
                {game.difficulty != null && (
                  <DifficultyLabel level={game.difficulty} />
                )}
                {game.replayability != null && (
                  <ReplayMeter value={game.replayability} />
                )}
                {game.greatSoundtrack && (
                  <div className="flex items-center gap-1.5" title="Great Soundtrack">
                    <Disc3 size={18} className="text-accent fill-accent/20" strokeWidth={2} />
                    <span className="font-heading text-sm text-muted-foreground">Great Soundtrack</span>
                  </div>
                )}
                {game.coop && (
                  <span className="rounded-full bg-blue-50 px-3 py-1 font-heading text-xs font-medium text-accent-green">
                    Co-op
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                {game.shortDescription}
              </p>

              {/* Platforms */}
              {game.platforms.length > 0 && (
                <div className="mt-5">
                  <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Platforms
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {game.platforms.map((p) => (
                      <span key={p} className="rounded-full border border-border bg-background px-3 py-1 font-heading text-xs text-foreground">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {game.tags.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tags
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {game.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-muted px-2.5 py-0.5 font-heading text-[11px] text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Buy links */}
              {game.affiliateLinks && game.affiliateLinks.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {game.affiliateLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 font-heading text-sm font-semibold text-white transition-transform hover:scale-105"
                    >
                      {link.label}
                      <ExternalLink size={12} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Body content (long description / write-up) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mx-auto mt-10 max-w-3xl"
        >
          {(game as any).longDescription && (game as any).longDescription.length > 0 ? (
            <div className="rounded-2xl border border-border/40 bg-card p-6 md:p-10">
              <PortableText value={(game as any).longDescription} components={bodyComponents} />
            </div>
          ) : (
            <div className="rounded-2xl border border-border/40 bg-card p-6 md:p-10">
              <p className="text-lg leading-relaxed text-muted-foreground">
                {game.shortDescription}
              </p>
              <p className="mt-4 text-sm text-muted-foreground/60">
                Full review coming soon.
              </p>
            </div>
          )}
        </motion.div>

        {/* Related games */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 font-heading text-lg font-bold text-foreground">
              You might also like
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {related.map((g) => (
                <GameTileCard key={g._id} game={g} />
              ))}
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}
