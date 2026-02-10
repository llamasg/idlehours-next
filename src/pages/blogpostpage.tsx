// src/pages/BlogPostPage.tsx

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPost, getAllPosts } from '@/lib/queries'
import { PortableText } from '@portabletext/react'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import { urlFor } from '@/lib/sanity'
import DisclosureBanner from '@/components/DisclosureBanner'
import AffiliateCTA from '@/components/AffiliateCTA'
import ProductCallout from '@/components/ProductCallout'
import { motion } from 'framer-motion'


// Custom components for Portable Text
const components = {
  types: {
    affiliateCTA: ({ value }: any) => <AffiliateCTA value={value} />,
    productCallout: ({ value }: any) => <ProductCallout value={value} />,
    inlineImage: ({ value }: any) => (
      <figure className="my-8">
        <img
          src={urlFor(value).url()}
          alt={value.alt || ''}
          className="w-full rounded-xl"
        />
        {value.caption && (
          <figcaption className="text-center text-muted-foreground mt-3 text-sm italic">
            {value.caption}
          </figcaption>
        )}
      </figure>
    ),
    
    youtube: ({ value }: any) => {
      const getVideoId = (url: string) => {
        const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
        return match ? match[1] : null
      }
      
      const videoId = getVideoId(value.url)
      
      if (!videoId) return null
      
      return (
        <div className="my-8 aspect-video rounded-xl overflow-hidden">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )
    },
    
    codeBlock: ({ value }: any) => (
      <div className="my-8">
        {value.filename && (
          <div className="bg-muted px-4 py-2 rounded-t-xl text-muted-foreground text-sm font-mono border-b border-border">
            {value.filename}
          </div>
        )}
        <pre className={`bg-muted p-4 ${value.filename ? 'rounded-b-xl' : 'rounded-xl'} overflow-x-auto`}>
          <code className="text-primary text-sm font-mono">{value.code}</code>
        </pre>
      </div>
    ),
    
    callout: ({ value }: any) => {
      const styles = {
        info: 'bg-accent/10 border-accent text-accent',
        warning: 'bg-yellow-500/10 border-yellow-500 text-yellow-400',
        success: 'bg-green-500/10 border-green-500 text-primary',
        error: 'bg-red-500/10 border-red-500 text-red-400',
      }
      
      const icons = {
        info: '💡',
        warning: '⚠️',
        success: '✅',
        error: '❌',
      }
      
      return (
        <div className={`${styles[value.type as keyof typeof styles]} border-l-4 p-4 my-8 rounded-r-xl`}>
          <div className="flex gap-3">
            <span className="text-2xl">{icons[value.type as keyof typeof icons]}</span>
            <div className="flex-1">
              {value.title && <p className="font-bold mb-2">{value.title}</p>}
              <p className="text-white/90">{value.text}</p>
            </div>
          </div>
        </div>
      )
    },
    
    divider: ({ value }: any) => {
      if (value.style === 'dots') {
        return <div className="text-center text-muted-foreground text-2xl my-12">• • •</div>
      }
      if (value.style === 'stars') {
        return <div className="text-center text-muted-foreground text-2xl my-12">✦ ✦ ✦</div>
      }
      return <hr className="border-border my-12" />
    },
  },
  
  block: {
    h2: ({ children }: any) => (
      <h2 className="text-4xl font-bold text-foreground mt-12 mb-6">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-3xl font-bold text-foreground mt-10 mb-5">{children}</h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="text-2xl font-bold text-foreground mt-8 mb-4">{children}</h4>
    ),
    normal: ({ children }: any) => (
      <p className="text-muted-foreground text-lg leading-relaxed mb-6">{children}</p>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-accent pl-6 py-2 italic text-muted-foreground text-xl my-8 bg-accent/5 rounded-r">
        {children}
      </blockquote>
    ),
  },
  
  list: {
    bullet: ({ children }: any) => (
      <ul className="list-disc list-outside text-muted-foreground space-y-3 mb-6 ml-6 text-lg">
        {children}
      </ul>
    ),
    number: ({ children }: any) => (
      <ol className="list-decimal list-outside text-muted-foreground space-y-3 mb-6 ml-6 text-lg">
        {children}
      </ol>
    ),
  },
  
  marks: {
    strong: ({ children }: any) => (
      <strong className="font-bold text-foreground">{children}</strong>
    ),
    em: ({ children }: any) => (
      <em className="italic">{children}</em>
    ),
    code: ({ children }: any) => (
      <code className="bg-muted px-2 py-1 rounded text-primary text-base font-mono">
        {children}
      </code>
    ),
    underline: ({ children }: any) => (
      <u className="underline">{children}</u>
    ),
    'strike-through': ({ children }: any) => (
      <s className="line-through">{children}</s>
    ),
    link: ({ value, children }: any) => (
      
       <a href={value.href}
        target={value.blank ? '_blank' : '_self'}
        rel={value.blank ? 'noopener noreferrer' : undefined}
        className="text-accent hover:text-accent underline decoration-accent/30 hover:decoration-accent transition-colors"
      >
        {children}
      </a>
    ),
  },
}

export default function BlogPostPage() {
  const { slug } = useParams()
  const [post, setPost] = useState<any>(null)
  const [otherPosts, setOtherPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug) {
      getPost(slug).then((data) => {
        setPost(data)
        setLoading(false)
      })

      // Fetch other recent posts
      getAllPosts().then((posts) => {
        // Filter out current post and take first 4
        const filtered = posts.filter((p: any) => p.slug.current !== slug).slice(0, 4)
        setOtherPosts(filtered)
      })
    }
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground text-2xl animate-pulse">Loading post...</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-foreground text-2xl">Post not found</p>
        <Link to="/blog" className="text-accent hover:text-accent underline">
          ← Back to blog
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <article>
      {/* Header Image */}
      <div className="relative h-[70vh] w-full">
        <img
          src={post.headerImage}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        
        {/* Back Button */}
        <Link
          to="/blog"
          className="absolute top-8 left-8 bg-background/50 backdrop-blur-sm text-foreground px-4 py-2 rounded-lg hover:bg-background/70 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Blog
        </Link>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 -mt-32 relative z-10 pb-20">
        {/* Categories */}
        {post.categories && post.categories.length > 0 && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {post.categories.map((cat: string) => (
              <span
                key={cat}
                className="bg-accent/20 text-accent px-4 py-2 rounded-full text-sm border border-accent/30 backdrop-blur-sm"
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
          {post.title}
        </h1>

        {/* Subheader */}
        <p className="text-2xl md:text-3xl text-muted-foreground mb-8 leading-relaxed">
          {post.subheader}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-muted-foreground mb-8 pb-8 border-b border-border">
          <span className="text-foreground font-medium">{post.author}</span>
          <span>•</span>
          <span>
            {new Date(post.publishedAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>

        {/* Affiliate Disclosure */}
        {post.affiliateDisclosureRequired && <DisclosureBanner />}

        {/* Body Content */}
        <div className="prose prose-invert max-w-none">
          <PortableText value={post.body} components={components} />
        </div>

        {/* Other Blogs */}
        {otherPosts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-border">
            <h2 className="mb-6 font-heading text-2xl font-bold text-foreground">
              Other Blogs You Might Like
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {otherPosts.map((otherPost: any) => (
                <Link key={otherPost._id} to={`/blog/${otherPost.slug.current}`}>
                  <motion.article
                    whileHover={{ y: -4, boxShadow: "0 8px 30px hsl(210 100% 50% / 0.12)" }}
                    transition={{ duration: 0.2 }}
                    className="group overflow-hidden rounded-2xl border border-border/40 bg-card"
                  >
                    <div className="aspect-[16/10] w-full bg-gradient-to-br from-secondary via-card to-secondary">
                      {otherPost.headerImage && (
                        <img
                          src={otherPost.headerImage}
                          alt={otherPost.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="mb-2 font-heading text-sm font-bold leading-snug text-foreground line-clamp-2 group-hover:text-primary">
                        {otherPost.title}
                      </h3>
                      <p className="mb-3 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                        {otherPost.subheader}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {otherPost.author}
                      </p>
                    </div>
                  </motion.article>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back to Blog Link */}
        <div className="mt-12 text-center">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-accent hover:text-accent transition-colors text-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to all posts
          </Link>
        </div>
      </div>
    </article>
      <SiteFooter />
    </div>
  )
}