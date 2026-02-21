import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { PortableText } from '@portabletext/react'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import DisclosureBanner from '@/components/DisclosureBanner'
import AffiliateCTA from '@/components/AffiliateCTA'
import ProductCallout from '@/components/ProductCallout'
import GameReferenceBlock from '@/components/GameReferenceBlock'
import { urlFor } from '@/lib/sanity'
import { getPost, getAllPosts } from '@/lib/queries'

function estimateReadTime(body: any[]): string {
  if (!Array.isArray(body)) return '1 min read'
  const words = body.reduce((count, block) => {
    if (block._type === 'block' && Array.isArray(block.children)) {
      return count + block.children.map((c: any) => c.text ?? '').join(' ').split(/\s+/).filter(Boolean).length
    }
    return count
  }, 0)
  return `${Math.max(1, Math.ceil(words / 200))} min read`
}

const ptComponents = {
  types: {
    affiliateCTA: ({ value }: any) => <AffiliateCTA value={value} />,
    productCallout: ({ value }: any) => <ProductCallout value={value} />,
    gameReference: ({ value }: any) => <GameReferenceBlock value={value} />,
    inlineImage: ({ value }: any) => (
      <figure className="my-8">
        <img src={urlFor(value).url()} alt={value.alt || ''} className="w-full rounded-xl" />
        {value.caption && (
          <figcaption className="mt-3 text-center text-sm italic text-muted-foreground">
            {value.caption}
          </figcaption>
        )}
      </figure>
    ),
    youtube: ({ value }: any) => {
      const match = value.url?.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/)
      if (!match) return null
      return (
        <div className="my-8 aspect-video overflow-hidden rounded-xl">
          <iframe className="h-full w-full" src={`https://www.youtube.com/embed/${match[1]}`} allowFullScreen />
        </div>
      )
    },
    codeBlock: ({ value }: any) => (
      <pre className="my-8 overflow-x-auto rounded-xl bg-muted p-4">
        <code className="font-mono text-sm text-primary">{value.code}</code>
      </pre>
    ),
    callout: ({ value }: any) => (
      <div className={`my-8 rounded-r-xl border-l-4 p-4 ${value.type === 'warning' ? 'border-yellow-500 bg-yellow-500/10' : 'border-accent bg-accent/10'}`}>
        <p className="text-white/90">{value.text}</p>
      </div>
    ),
    divider: ({ value }: any) => (
      value.style === 'dots'
        ? <div className="my-12 text-center text-2xl text-muted-foreground">• • •</div>
        : value.style === 'stars'
        ? <div className="my-12 text-center text-2xl text-muted-foreground">✦ ✦ ✦</div>
        : <hr className="my-12 border-border" />
    ),
  },
  block: {
    h2: ({ children }: any) => <h2 className="mb-6 mt-12 text-4xl font-bold text-foreground">{children}</h2>,
    h3: ({ children }: any) => <h3 className="mb-5 mt-10 text-3xl font-bold text-foreground">{children}</h3>,
    h4: ({ children }: any) => <h4 className="mb-4 mt-8 text-2xl font-bold text-foreground">{children}</h4>,
    normal: ({ children }: any) => <p className="mb-6 text-lg leading-relaxed text-muted-foreground">{children}</p>,
    blockquote: ({ children }: any) => (
      <blockquote className="my-8 rounded-r border-l-4 border-accent bg-accent/5 py-2 pl-6 text-xl italic text-muted-foreground">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: any) => <ul className="mb-6 ml-6 list-disc space-y-3 text-lg text-muted-foreground">{children}</ul>,
    number: ({ children }: any) => <ol className="mb-6 ml-6 list-decimal space-y-3 text-lg text-muted-foreground">{children}</ol>,
  },
  marks: {
    strong: ({ children }: any) => <strong className="font-bold text-foreground">{children}</strong>,
    em: ({ children }: any) => <em className="italic">{children}</em>,
    code: ({ children }: any) => <code className="rounded bg-muted px-2 py-1 font-mono text-base text-primary">{children}</code>,
    link: ({ value, children }: any) => (
      <a
        href={value.href}
        target={value.blank ? '_blank' : '_self'}
        rel={value.blank ? 'noopener noreferrer' : undefined}
        className="text-accent underline decoration-accent/30 transition-colors hover:decoration-accent"
      >
        {children}
      </a>
    ),
  },
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.subheader,
    openGraph: {
      title: post.title,
      description: post.subheader,
      images: post.headerImage ? [{ url: post.headerImage }] : [],
      type: 'article',
      publishedTime: post.publishedAt,
    },
  }
}

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((p: any) => ({ slug: p.slug.current }))
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [post, allPosts] = await Promise.all([getPost(slug), getAllPosts()])
  if (!post) notFound()

  const otherPosts = allPosts
    .filter((p: any) => p.slug.current !== slug)
    .slice(0, 4)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <article>
        <div className="w-full">
          <img
            src={post.headerImage}
            alt={post.title}
            className="max-h-[70vh] w-full object-cover"
          />
        </div>
        <div className="mx-auto max-w-5xl px-4 py-8 pb-20">
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back to Blog
          </Link>

          {post.categories?.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {post.categories.map((cat: string) => (
                <span
                  key={cat}
                  className="rounded-full border border-accent/30 bg-accent/20 px-3 py-1 text-xs text-accent"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}

          <h1 className="mb-4 text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
            {post.title}
          </h1>
          <p className="mb-6 text-xl leading-relaxed text-muted-foreground md:text-2xl">
            {post.subheader}
          </p>
          <div className="mb-8 flex items-center gap-2 border-b border-border pb-8 text-sm text-muted-foreground">
            <span>{estimateReadTime(post.body)}</span>
            <span>·</span>
            <span>
              {new Date(post.publishedAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>

          {post.affiliateDisclosureRequired && <DisclosureBanner />}

          <div className="prose max-w-none">
            <PortableText value={post.body} components={ptComponents} />
          </div>

          {otherPosts.length > 0 && (
            <div className="mt-16 border-t border-border pt-12">
              <h2 className="mb-6 font-heading text-2xl font-bold text-foreground">
                Other Posts You Might Like
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {otherPosts.map((p: any) => (
                  <Link key={p._id} href={`/blog/${p.slug.current}`}>
                    <article className="group overflow-hidden rounded-2xl border border-border/40 bg-card">
                      <div className="aspect-[16/10] overflow-hidden bg-secondary">
                        {p.headerImage && (
                          <img
                            src={p.headerImage}
                            alt={p.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                            loading="lazy"
                          />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="mb-2 line-clamp-2 font-heading text-sm font-bold leading-snug text-foreground group-hover:text-primary">
                          {p.title}
                        </h3>
                        <p className="text-[11px] text-muted-foreground">{p.author}</p>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
      <SiteFooter />
    </div>
  )
}
