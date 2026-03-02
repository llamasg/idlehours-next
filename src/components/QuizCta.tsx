'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

import type { QuizCtaSection, CmsLink } from '@/types'

function resolveLinkHref(link?: CmsLink): string {
  if (!link) return '#'
  if (link.linkType === 'external' && link.externalUrl) return link.externalUrl
  if (link.internalRef?.slug?.current) return '/' + link.internalRef.slug.current
  return '#'
}

interface QuizCtaProps {
  data: QuizCtaSection
}

export default function QuizCta({ data }: QuizCtaProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl bg-foreground px-6 py-10 text-center sm:px-10 sm:py-14"
    >
      {/* Decorative circles */}
      <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-burnt-orange/10" />
      <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-burnt-orange/10" />

      <div className="relative z-10">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-burnt-orange/20">
          <span className="inline-block shrink-0 text-burnt-orange bg-current" style={{ width: '24px', height: '24px', WebkitMask: 'url(/images/icons/icon_Star-rating-highlight-feature-headericon-backgroundicon.svg) no-repeat center / contain', mask: 'url(/images/icons/icon_Star-rating-highlight-feature-headericon-backgroundicon.svg) no-repeat center / contain' }} />
        </div>

        <h2 className="font-heading text-2xl font-bold text-background sm:text-3xl">
          {data.title}
        </h2>

        {data.description && (
          <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-background/75">
            {data.description}
          </p>
        )}

        <Link
          href={resolveLinkHref(data.link)}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-burnt-orange px-6 py-3 font-heading text-sm font-semibold text-background shadow-lg transition-transform hover:scale-105"
        >
          <span className="inline-block shrink-0 bg-current" style={{ width: '14px', height: '14px', WebkitMask: 'url(/images/icons/icon_Star-rating-highlight-feature-headericon-backgroundicon.svg) no-repeat center / contain', mask: 'url(/images/icons/icon_Star-rating-highlight-feature-headericon-backgroundicon.svg) no-repeat center / contain' }} />
          {data.buttonLabel}
        </Link>
      </div>
    </motion.section>
  )
}
