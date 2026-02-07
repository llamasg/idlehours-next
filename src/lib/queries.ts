// src/lib/queries.ts

import { client } from './sanity'

// Get all blog posts
export async function getAllPosts() {
  const posts = await client.fetch(`
    *[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      subheader,
      publishedAt,
      author,
      "headerImage": headerImage.asset->url,
      categories
    }
  `)
  return posts
}

// Get single post by slug
export async function getPost(slug: string) {
  const post = await client.fetch(
    `
    *[_type == "post" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      subheader,
      author,
      publishedAt,
      categories,
      "headerImage": headerImage.asset->url,
      body,
      seo
    }
  `,
    { slug }
  )
  return post
}