import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Post } from '@/types'

interface BlogTileCardProps {
  post: Post
}

export default function BlogTileCard({ post }: BlogTileCardProps) {
  return (
    <Link to={`/blog/${post.slug.current}`} className="block snap-start">
      <motion.article
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="w-[260px] shrink-0 cursor-pointer overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md sm:w-[280px]"
      >
        {/* Image */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-secondary">
          {post.mainImage ? (
            <img
              src={post.mainImage}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-secondary to-muted">
              <span className="font-heading text-sm text-muted-foreground">No image</span>
            </div>
          )}

          {/* Category badge */}
          {post.category && (
            <div className="absolute left-2 top-2 rounded-full bg-card/90 px-2.5 py-0.5 font-heading text-[10px] font-semibold text-foreground shadow-sm backdrop-blur-sm">
              {post.category.title}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3.5">
          <h3 className="font-heading text-sm font-semibold leading-snug text-foreground line-clamp-2">
            {post.title}
          </h3>

          {post.excerpt && (
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
              {post.excerpt}
            </p>
          )}

          <div className="mt-2 flex items-center gap-2 font-heading text-[10px] text-muted-foreground">
            {post.readTime && <span>{post.readTime} min read</span>}
            {post.readTime && post.publishedAt && <span>·</span>}
            {post.publishedAt && (
              <span>
                {new Date(post.publishedAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            )}
          </div>
        </div>
      </motion.article>
    </Link>
  )
}
