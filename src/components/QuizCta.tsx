import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import type { QuizCtaSection, CmsLink } from '@/types'

function resolveLinkHref(link?: CmsLink): string {
  if (!link) return '#'
  if (link.linkType === 'external' && link.externalUrl) return link.externalUrl
  if (link.internalRef?.slug?.current) return link.internalRef.slug.current
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
      className="relative overflow-hidden rounded-2xl bg-plum px-6 py-10 text-center sm:px-10 sm:py-14"
    >
      {/* Decorative circles */}
      <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-ember/10" />
      <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-ember/10" />

      <div className="relative z-10">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ember/20">
          <Sparkles size={24} className="text-ember" />
        </div>

        <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">
          {data.title}
        </h2>

        {data.description && (
          <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-white/75">
            {data.description}
          </p>
        )}

        <Link
          to={resolveLinkHref(data.link)}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-ember px-6 py-3 font-heading text-sm font-semibold text-warm-cream shadow-lg transition-transform hover:scale-105"
        >
          <Sparkles size={14} />
          {data.buttonLabel}
        </Link>
      </div>
    </motion.section>
  )
}
