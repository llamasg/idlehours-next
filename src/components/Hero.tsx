'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { HeroSection, CmsLink } from '@/types'

function resolveLinkHref(link?: CmsLink): string {
  if (!link) return '#'
  if (link.linkType === 'external' && link.externalUrl) return link.externalUrl
  if (link.internalRef?.slug?.current) return '/' + link.internalRef.slug.current
  return '#'
}

interface HeroProps {
  data: HeroSection
}

export default function Hero({ data }: HeroProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-foreground">
      {/* Background image */}
      {data.heroImage && (
        <img
          src={data.heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--leaf))]/90 via-[hsl(var(--leaf))]/70 to-transparent" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          {/* Tags */}
          {data.tags && data.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {data.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/15 px-3 py-1 font-heading text-xs font-medium text-white/80"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="font-heading text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            {data.headline}
          </h1>

          {data.subheadline && (
            <p className="mt-4 max-w-lg text-lg leading-relaxed text-white/80">
              {data.subheadline}
            </p>
          )}

          {/* CTA buttons */}
          <div className="mt-8 flex flex-wrap gap-3">
            {data.primaryButton && (
              <Link
                href={resolveLinkHref(data.primaryButton)}
                className="rounded-full bg-burnt-orange px-6 py-3 font-heading text-sm font-semibold text-background shadow-lg transition-transform hover:scale-105"
              >
                {data.primaryButton.label}
              </Link>
            )}
            {data.secondaryButton && (
              <Link
                href={resolveLinkHref(data.secondaryButton)}
                className="rounded-full border border-white/30 bg-white/10 px-6 py-3 font-heading text-sm font-semibold text-white backdrop-blur-sm transition-transform hover:scale-105 hover:bg-white/20"
              >
                {data.secondaryButton.label}
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
