import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { CmsLink } from '@/types'

function resolveLinkHref(link?: CmsLink): string {
  if (!link) return '#'
  if (link.linkType === 'external' && link.externalUrl) return link.externalUrl
  if (link.internalRef?.slug?.current) return link.internalRef.slug.current
  return '#'
}

interface RowCarouselProps {
  title: string
  subtitle?: string
  seeAllLink?: CmsLink
  children: React.ReactNode
}

export default function RowCarousel({ title, subtitle, seeAllLink, children }: RowCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  function checkScroll() {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true })
      window.addEventListener('resize', checkScroll)
    }
    return () => {
      el?.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [])

  function scroll(dir: 'left' | 'right') {
    const el = scrollRef.current
    if (!el) return
    const amount = el.clientWidth * 0.75
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <section>
      {/* Header row */}
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg font-bold text-foreground sm:text-xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {seeAllLink && (
            <Link
              to={resolveLinkHref(seeAllLink)}
              className="whitespace-nowrap rounded-full border border-border px-3 py-1.5 font-heading text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {seeAllLink.label}
            </Link>
          )}
          {/* Arrows (desktop only) */}
          <div className="hidden gap-1 sm:flex">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="rounded-full border border-border p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30"
              aria-label="Scroll left"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="rounded-full border border-border p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30"
              aria-label="Scroll right"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable row */}
      <motion.div
        ref={scrollRef}
        className="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory sm:snap-none"
      >
        {children}
      </motion.div>
    </section>
  )
}
