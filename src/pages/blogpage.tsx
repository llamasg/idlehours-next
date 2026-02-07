// src/pages/BlogPage.tsx

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllPosts } from '@/lib/queries'

interface Post {
  _id: string
  title: string
  slug: { current: string }
  subheader: string
  publishedAt: string
  author: string
  headerImage: string
  categories: string[]
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllPosts().then((data) => {
      setPosts(data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl animate-pulse">Loading posts...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-4">Blog</h1>
          <p className="text-xl text-gray-400">Thoughts, stories and ideas</p>
        </div>
        
        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link
              key={post._id}
              to={`/blog/${post.slug.current}`}
              className="group"
            >
              <article className="bg-gray-900 rounded-2xl overflow-hidden hover:scale-105 transition-transform duration-300 h-full flex flex-col">
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={post.headerImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60" />
                </div>
                
                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* Categories */}
                  {post.categories && post.categories.length > 0 && (
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {post.categories.map((cat) => (
                        <span
                          key={cat}
                          className="text-xs bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/30"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Title */}
                  <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  
                  {/* Subheader */}
                  <p className="text-gray-400 mb-4 line-clamp-3 flex-1">
                    {post.subheader}
                  </p>
                  
                  {/* Meta */}
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-800">
                    <span>{post.author}</span>
                    <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {posts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">No posts yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  )
}