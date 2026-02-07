// src/pages/BlogPostPage.tsx

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPost } from '@/lib/queries'
import { PortableText } from '@portabletext/react'
import { urlFor } from '@/lib/sanity'

// Replace your SocialShare function with this:


// Custom components for Portable Text
const components = {
  types: {
    inlineImage: ({ value }: any) => (
      <figure className="my-8">
        <img
          src={urlFor(value).url()}
          alt={value.alt || ''}
          className="w-full rounded-xl"
        />
        {value.caption && (
          <figcaption className="text-center text-gray-500 mt-3 text-sm italic">
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
          <div className="bg-gray-800 px-4 py-2 rounded-t-xl text-gray-400 text-sm font-mono border-b border-gray-700">
            {value.filename}
          </div>
        )}
        <pre className={`bg-gray-900 p-4 ${value.filename ? 'rounded-b-xl' : 'rounded-xl'} overflow-x-auto`}>
          <code className="text-green-400 text-sm font-mono">{value.code}</code>
        </pre>
      </div>
    ),
    
    callout: ({ value }: any) => {
      const styles = {
        info: 'bg-blue-500/10 border-blue-500 text-blue-400',
        warning: 'bg-yellow-500/10 border-yellow-500 text-yellow-400',
        success: 'bg-green-500/10 border-green-500 text-green-400',
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
        return <div className="text-center text-gray-600 text-2xl my-12">• • •</div>
      }
      if (value.style === 'stars') {
        return <div className="text-center text-gray-600 text-2xl my-12">✦ ✦ ✦</div>
      }
      return <hr className="border-gray-800 my-12" />
    },
  },
  
  block: {
    h2: ({ children }: any) => (
      <h2 className="text-4xl font-bold text-white mt-12 mb-6">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-3xl font-bold text-white mt-10 mb-5">{children}</h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="text-2xl font-bold text-white mt-8 mb-4">{children}</h4>
    ),
    normal: ({ children }: any) => (
      <p className="text-gray-300 text-lg leading-relaxed mb-6">{children}</p>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-blue-500 pl-6 py-2 italic text-gray-400 text-xl my-8 bg-blue-500/5 rounded-r">
        {children}
      </blockquote>
    ),
  },
  
  list: {
    bullet: ({ children }: any) => (
      <ul className="list-disc list-outside text-gray-300 space-y-3 mb-6 ml-6 text-lg">
        {children}
      </ul>
    ),
    number: ({ children }: any) => (
      <ol className="list-decimal list-outside text-gray-300 space-y-3 mb-6 ml-6 text-lg">
        {children}
      </ol>
    ),
  },
  
  marks: {
    strong: ({ children }: any) => (
      <strong className="font-bold text-white">{children}</strong>
    ),
    em: ({ children }: any) => (
      <em className="italic">{children}</em>
    ),
    code: ({ children }: any) => (
      <code className="bg-gray-800 px-2 py-1 rounded text-green-400 text-base font-mono">
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
        className="text-blue-400 hover:text-blue-300 underline decoration-blue-400/30 hover:decoration-blue-300 transition-colors"
      >
        {children}
      </a>
    ),
  },
}

export default function BlogPostPage() {
  const { slug } = useParams()
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug) {
      getPost(slug).then((data) => {
        setPost(data)
        setLoading(false)
      })
    }
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-2xl animate-pulse">Loading post...</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <p className="text-white text-2xl">Post not found</p>
        <Link to="/blog" className="text-blue-400 hover:text-blue-300 underline">
          ← Back to blog
        </Link>
      </div>
    )
  }

  return (
    <article className="min-h-screen bg-black">
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
          className="absolute top-8 left-8 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-black/70 transition-colors flex items-center gap-2"
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
                className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-sm border border-blue-500/30 backdrop-blur-sm"
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          {post.title}
        </h1>

        {/* Subheader */}
        <p className="text-2xl md:text-3xl text-gray-400 mb-8 leading-relaxed">
          {post.subheader}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-gray-500 mb-8 pb-8 border-b border-gray-800">
          <span className="text-white font-medium">{post.author}</span>
          <span>•</span>
          <span>
            {new Date(post.publishedAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>

        {/* Body Content */}
        <div className="prose prose-invert max-w-none">
          <PortableText value={post.body} components={components} />
        </div>

       

        {/* Back to Blog Link */}
        <div className="mt-12 text-center">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to all posts
          </Link>
        </div>
      </div>
    </article>
  )
}