'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { BlogFeatureSection } from '@/types'

interface BlogFeatureProps {
  data: BlogFeatureSection
}

export default function BlogFeature({ data }: BlogFeatureProps) {
  const posts = data.curatedPosts ?? []

  if (posts.length === 0) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-4">
        <h2 className="font-heading text-lg font-bold text-foreground sm:text-xl">
          {data.title}
        </h2>
        {data.subtitle && (
          <p className="mt-0.5 text-sm text-muted-foreground">{data.subtitle}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {posts.map((post) => (
          <Link key={post._id} href={`/blog/${post.slug.current}`}>
            <motion.article
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="cursor-pointer overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-secondary">
                {post.mainImage ? (
                  <img
                    src={post.mainImage}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-secondary to-muted" />
                )}
                {post.category && (
                  <div className="absolute left-2 top-2 rounded-full bg-card/90 px-2 py-0.5 font-heading text-[10px] font-semibold text-foreground shadow-sm backdrop-blur-sm">
                    {post.category.title}
                  </div>
                )}
              </div>
              <div className="p-3.5">
                <h3 className="font-heading text-sm font-semibold leading-snug text-foreground line-clamp-2">
                  {post.title}
                </h3>
                <div className="mt-1.5 flex items-center gap-2 font-heading text-[10px] text-muted-foreground">
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
        ))}
      </div>
    </motion.section>
  )
}
