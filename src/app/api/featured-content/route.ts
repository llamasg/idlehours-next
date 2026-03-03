import { NextResponse } from 'next/server'
import { client } from '@/lib/sanity'

// Revalidate every hour
export const revalidate = 3600

export async function GET() {
  try {
    const posts = await client.fetch(`
      *[_type == "post"] | order(publishedAt desc) [0...2] {
        title,
        "slug": slug.current,
        "image": headerImage.asset->url,
        "category": categories[0]
      }
    `)
    return NextResponse.json({ posts })
  } catch {
    return NextResponse.json({ posts: [] })
  }
}
