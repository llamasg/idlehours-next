

import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'

export const client = createClient({
  projectId: 'ijj3h2lj',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true, // Use CDN for faster loads
})

// Helper to generate image URLs
const builder = createImageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}