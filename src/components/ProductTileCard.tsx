import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import type { Product } from '@/types'

interface ProductTileCardProps {
  product: Product
}

export default function ProductTileCard({ product }: ProductTileCardProps) {
  return (
    <motion.a
      href={product.affiliateUrl}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group block overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-secondary">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-heading text-sm text-muted-foreground">No image</span>
          </div>
        )}

        {/* Retailer badge */}
        {product.retailerName && (
          <div className="absolute right-2 top-2 rounded-full bg-card/90 px-2 py-0.5 font-heading text-[10px] font-medium text-muted-foreground shadow-sm backdrop-blur-sm">
            {product.retailerName}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3.5">
        <h3 className="font-heading text-sm font-semibold leading-snug text-foreground line-clamp-2">
          {product.name}
        </h3>

        <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
          {product.shortDescription}
        </p>

        <div className="mt-3 flex items-center justify-between">
          {product.price && (
            <span className="font-heading text-sm font-bold text-foreground">
              {product.price}
            </span>
          )}
          <span className="flex items-center gap-1 font-heading text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            View <ExternalLink size={10} />
          </span>
        </div>
      </div>
    </motion.a>
  )
}
