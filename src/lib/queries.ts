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
      body[]{
        ...,
        _type == "productCallout" => {
          ...,
          product-> {
            _id,
            name,
            slug,
            "image": image.asset->url,
            shortBlurb,
            etsyUrl,
            badge,
            priceNote
          }
        },
        _type == "inlineImage" => {
          ...,
          "asset": asset->
        }
      },
      seo,
      affiliateDisclosureRequired,
      relatedProducts[]->
    }
  `,
    { slug }
  )
  return post
}

// Search posts by query
export async function searchPosts(query: string) {
  const posts = await client.fetch(
    `
    *[_type == "post" && (
      title match $searchQuery ||
      subheader match $searchQuery ||
      categories[] match $searchQuery
    )] | order(publishedAt desc) {
      _id,
      title,
      slug,
      subheader,
      publishedAt,
      author,
      "headerImage": headerImage.asset->url,
      categories
    }
  `,
    { searchQuery: `*${query}*` }
  )
  return posts
}

// Get posts by category
export async function getPostsByCategory(category: string) {
  const posts = await client.fetch(
    `
    *[_type == "post" && $category in categories] | order(publishedAt desc) {
      _id,
      title,
      slug,
      subheader,
      publishedAt,
      author,
      "headerImage": headerImage.asset->url,
      categories
    }
  `,
    { category }
  )
  return posts
}

// Get all products
export async function getAllProducts() {
  const products = await client.fetch(`
    *[_type == "product"] | order(order asc) {
      _id,
      name,
      slug,
      "image": image.asset->url,
      shortBlurb,
      etsyUrl,
      badge,
      category,
      priceNote,
      featured,
      order
    }
  `)
  return products
}

// Get featured products
export async function getFeaturedProducts() {
  const products = await client.fetch(`
    *[_type == "product" && featured == true] | order(order asc) [0...8] {
      _id,
      name,
      slug,
      "image": image.asset->url,
      shortBlurb,
      etsyUrl,
      badge,
      category,
      priceNote
    }
  `)
  return products
}

// Get products by category
export async function getProductsByCategory(category: string) {
  const products = await client.fetch(
    `
    *[_type == "product" && category == $category] | order(order asc) {
      _id,
      name,
      slug,
      "image": image.asset->url,
      shortBlurb,
      etsyUrl,
      badge,
      category,
      priceNote
    }
  `,
    { category }
  )
  return products
}

// Get all quizzes
export async function getAllQuizzes() {
  const quizzes = await client.fetch(`
    *[_type == "quiz" && published == true] | order(_createdAt desc) {
      _id,
      title,
      slug,
      description,
      emoji,
      "coverImage": coverImage.asset->url,
      "questionCount": count(questions)
    }
  `)
  return quizzes
}

// Get single quiz by slug
export async function getQuiz(slug: string) {
  const quiz = await client.fetch(
    `
    *[_type == "quiz" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      description,
      emoji,
      "coverImage": coverImage.asset->url,
      questions,
      results
    }
  `,
    { slug }
  )
  return quiz
}

// Get homepage config
export async function getHomepageConfig() {
  const config = await client.fetch(`
    *[_type == "homepageConfig"][0] {
      _id,
      "featuredPost": featuredPost->{
        _id,
        title,
        slug,
        subheader,
        "headerImage": headerImage.asset->url,
        categories,
        author,
        publishedAt
      },
      latestPostsCount,
      "featuredProducts": featuredProducts[]-> {
        _id,
        name,
        slug,
        "image": image.asset->url,
        shortBlurb,
        etsyUrl,
        badge,
        category,
        priceNote
      },
      "featuredQuizzes": featuredQuizzes[]-> {
        _id,
        title,
        slug,
        description,
        emoji,
        "questionCount": count(questions)
      },
      displaySections
    }
  `)
  return config
}

// Get active promotional banner
export async function getPromoBanner() {
  const banner = await client.fetch(`
    *[_type == "promoBanner" && isActive == true][0] {
      _id,
      text,
      backgroundColor,
      textColor,
      link
    }
  `)
  return banner
}

// ─── Idle Hours: New queries ──────────────────────────

// Get the modular homepage document with all sections expanded
export async function getHomePage() {
  const homePage = await client.fetch(`
    *[_type == "homePage"][0] {
      _id,
      title,
      sections[] {
        _key,
        _type,
        enabled,
        anchorId,

        // heroSection fields
        _type == "heroSection" => {
          headline,
          subheadline,
          "heroImage": heroImage.asset->url,
          primaryButton,
          secondaryButton,
          tags
        },

        // carouselRowSection fields
        _type == "carouselRowSection" => {
          rowTitle,
          rowSubtitle,
          rowType,
          sourceType,
          "curatedGames": curatedGames[]-> {
            _id, title, slug, "coverImage": coverImage.asset->url,
            shortDescription, platforms, tags, coop,
            ratings, affiliateLinks, featured, publishedAt
          },
          "curatedPosts": curatedPosts[]-> {
            _id, title, slug, excerpt, "mainImage": headerImage.asset->url,
            "category": category->{ _id, title, slug },
            tags, readTime, featured, publishedAt
          },
          "curatedProducts": curatedProducts[]-> {
            _id, name, slug, "image": image.asset->url,
            shortDescription, price, retailerName, affiliateUrl, tags, featured
          },
          dynamicQuery,
          seeAllLink
        },

        // quizCtaSection fields
        _type == "quizCtaSection" => {
          title, description, buttonLabel, link, icon
        },

        // gameOfMonthSection fields
        _type == "gameOfMonthSection" => {
          title,
          "featuredGame": featuredGame-> {
            _id, title, slug, "coverImage": coverImage.asset->url,
            shortDescription, platforms, tags, coop,
            ratings, affiliateLinks, featured, publishedAt
          },
          customBlurb, buttonLabel, link
        },

        // productFeatureSection fields
        _type == "productFeatureSection" => {
          title, subtitle,
          "products": products[]-> {
            _id, name, slug, "image": image.asset->url,
            shortDescription, price, retailerName, affiliateUrl, tags, featured
          },
          cta
        },

        // blogFeatureSection fields
        _type == "blogFeatureSection" => {
          title, subtitle, sourceType,
          "curatedPosts": curatedPosts[]-> {
            _id, title, slug, excerpt, "mainImage": headerImage.asset->url,
            "category": category->{ _id, title, slug },
            tags, readTime, featured, publishedAt
          },
          dynamicQuery
        },

        // newsletterSection fields
        _type == "newsletterSection" => {
          title, copy, placeholderText, buttonLabel, disclaimer
        }
      }
    }
  `)
  return homePage
}

// Get all games
export async function getAllGames() {
  const games = await client.fetch(`
    *[_type == "game"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      "coverImage": coverImage.asset->url,
      shortDescription,
      platforms,
      "genres": genres[]->{ _id, title, slug },
      tags,
      coop,
      ratings,
      affiliateLinks,
      featured,
      publishedAt
    }
  `)
  return games
}

// Get single game by slug
export async function getGame(slug: string) {
  const game = await client.fetch(
    `
    *[_type == "game" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      "coverImage": coverImage.asset->url,
      shortDescription,
      longDescription,
      platforms,
      "genres": genres[]->{ _id, title, slug },
      tags,
      coop,
      ratings,
      affiliateLinks,
      featured,
      publishedAt
    }
  `,
    { slug }
  )
  return game
}

// Get site settings (singleton — document ID: "siteSettings")
export async function getSiteSettings() {
  const settings = await client.fetch(`
    *[_type == "siteSettings"][0] {
      _id,
      siteTitle,
      siteTagline,
      metaDescription,
      "defaultSocialImageUrl": defaultSocialImage.asset->url,
      "defaultSocialImageAlt": defaultSocialImage.alt,
      "faviconUrl": favicon.asset->url,
      "logo": logo.asset->url,
      navLinks,
      socialLinks
    }
  `)
  return settings
}

// Get active music tracks for the CD player
export async function getMusicTracks() {
  const tracks = await client.fetch(`
    *[_type == "musicTrack" && active != false] | order(order asc) {
      _id,
      title,
      artist,
      "audioUrl": audioFile.asset->url,
      "coverArt": coverArt.asset->url,
      order
    }
  `)
  return tracks
}

/*
  ─── GROQ Patterns for Dynamic Row Filtering ───────────

  When connecting dynamic carousel rows to CMS, build GROQ at runtime
  based on the dynamicQuery fields. Example patterns:

  // Filter by tags:
  *[_type == "game" && count((tags[])[@ in $tags]) > 0]

  // Filter by platform:
  *[_type == "game" && $platform in platforms]

  // Filter by co-op:
  *[_type == "game" && coop == true]

  // Sort by cozy rating:
  | order(ratings.cozyPercent desc)

  // Sort by newest:
  | order(publishedAt desc)

  // Trending (published within N days):
  *[_type == "game" && publishedAt > $dateThreshold]

  // Combine them:
  *[_type == "game" && coop == true && "travel" in tags]
    | order(ratings.cozyPercent desc) [0...$limit]

  The frontend will compose these based on the dynamicQuery object
  from the CMS homePage document.
*/