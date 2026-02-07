// src/lib/sanity.ts

import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: 'fwup7fag', // Your project ID
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true, // Use CDN for faster loads
})

// Helper to generate image URLs
const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}