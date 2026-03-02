'use client'

import Link from 'next/link'
import type { Post } from '@/types'

interface LongReadProps {
  post: Post | null
}

export default function LongRead({ post }: LongReadProps) {
  if (!post) return null

  const dateStr = new Date(post.publishedAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <article className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <div className="grid gap-0 md:grid-cols-2">
        {/* Image half */}
        <div className="aspect-[16/10] overflow-hidden bg-secondary md:aspect-auto md:min-h-[320px]">
          {post.coverImageUrl || (post as any).headerImage ? (
            <img
              src={post.coverImageUrl || (post as any).headerImage}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="font-heading text-muted-foreground">No image</span>
            </div>
          )}
        </div>
        {/* Content half */}
        <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
          {(post as any).categories?.[0] && (
            <span className="font-heading text-xs font-bold uppercase tracking-widest text-primary">
              {(post as any).categories[0]}
            </span>
          )}
          <h3 className="mt-2 text-2xl font-bold text-foreground lg:text-3xl">
            {post.title}
          </h3>
          {(post.excerpt || (post as any).subheader) && (
            <p className="mt-3 leading-relaxed text-muted-foreground line-clamp-3">
              {post.excerpt || (post as any).subheader}
            </p>
          )}
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            {post.author && <span>{post.author}</span>}
            {post.author && <span>·</span>}
            <span>{dateStr}</span>
          </div>
          <Link
            href={`/blog/${post.slug.current}`}
            className="mt-6 inline-flex w-fit items-center gap-2 font-heading text-sm font-bold text-foreground transition-colors hover:text-primary"
          >
            Read More
            <span className="text-xs">&#8594;</span>
          </Link>
        </div>
      </div>
    </article>
  )
}
