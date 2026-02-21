'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import ProductTileCard from './ProductTileCard'
import type { ProductFeatureSection, CmsLink } from '@/types'

function resolveLinkHref(link?: CmsLink): string {
  if (!link) return '#'
  if (link.linkType === 'external' && link.externalUrl) return link.externalUrl
  if (link.internalRef?.slug?.current) return '/' + link.internalRef.slug.current
  return '#'
}

interface ProductFeatureProps {
  data: ProductFeatureSection
}

export default function ProductFeature({ data }: ProductFeatureProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg font-bold text-foreground sm:text-xl">
            {data.title}
          </h2>
          {data.subtitle && (
            <p className="mt-0.5 text-sm text-muted-foreground">{data.subtitle}</p>
          )}
        </div>
        {data.cta && (
          <Link
            href={resolveLinkHref(data.cta)}
            className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-border px-3 py-1.5 font-heading text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {data.cta.label}
            <ArrowRight size={12} />
          </Link>
        )}
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {data.products.map((product) => (
          <ProductTileCard key={product._id} product={product} />
        ))}
      </div>
    </motion.section>
  )
}
