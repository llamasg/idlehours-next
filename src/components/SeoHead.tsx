/**
 * SeoHead — updates document.title and meta tags for each page.
 *
 * Priority for each field:
 *   1. Page-level prop (from Sanity post/page SEO fields)
 *   2. Site-level fallback (from siteSettings singleton in Sanity)
 *   3. Nothing (no broken or empty tags)
 *
 * Usage:
 *   <SeoHead
 *     title="Spiritfarer Review"
 *     description="A beautiful game about saying goodbye."
 *     imageUrl="https://cdn.sanity.io/..."
 *     imageAlt="Spiritfarer key art"
 *   />
 */

import { useEffect } from 'react'
import { useSiteSettings } from '@/hooks/useSiteSettings'

interface SeoHeadProps {
  /** Page-specific title. Will be appended with " | Site Title" */
  title?: string | null
  /** Page-specific meta description */
  description?: string | null
  /** Page-specific OG image URL */
  imageUrl?: string | null
  /** Alt text for the OG image */
  imageAlt?: string | null
  /** Canonical URL for this page */
  canonicalUrl?: string | null
}

function setOrRemoveMeta(property: string, content: string | null | undefined, isName = false) {
  const attr = isName ? 'name' : 'property'
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${property}"]`)

  if (!content) {
    el?.remove()
    return
  }

  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, property)
    document.head.appendChild(el)
  }
  el.content = content
}

function setOrRemoveLink(rel: string, href: string | null | undefined) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)

  if (!href) {
    el?.remove()
    return
  }

  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}

export default function SeoHead({
  title,
  description,
  imageUrl,
  imageAlt,
  canonicalUrl,
}: SeoHeadProps) {
  const site = useSiteSettings()

  useEffect(() => {
    const siteTitle = site?.siteTitle || 'Idle Hours'
    const resolvedDescription = description || site?.metaDescription || null
    const resolvedImageUrl = imageUrl || site?.defaultSocialImageUrl || null
    const resolvedImageAlt = imageAlt || site?.defaultSocialImageAlt || null

    // ── Document title ──────────────────────────────
    document.title = title ? `${title} | ${siteTitle}` : siteTitle

    // ── Basic meta ──────────────────────────────────
    setOrRemoveMeta('description', resolvedDescription, true)

    // ── Open Graph ──────────────────────────────────
    setOrRemoveMeta('og:title', title ? `${title} | ${siteTitle}` : siteTitle)
    setOrRemoveMeta('og:description', resolvedDescription)
    setOrRemoveMeta('og:type', 'website')

    if (resolvedImageUrl) {
      setOrRemoveMeta('og:image', resolvedImageUrl)
      setOrRemoveMeta('og:image:width', '1200')
      setOrRemoveMeta('og:image:height', '630')
      setOrRemoveMeta('og:image:alt', resolvedImageAlt)
    } else {
      // Remove stale image tags from previous page
      setOrRemoveMeta('og:image', null)
      setOrRemoveMeta('og:image:width', null)
      setOrRemoveMeta('og:image:height', null)
      setOrRemoveMeta('og:image:alt', null)
    }

    // ── Twitter / X ─────────────────────────────────
    setOrRemoveMeta('twitter:card', resolvedImageUrl ? 'summary_large_image' : 'summary', true)
    setOrRemoveMeta('twitter:title', title ? `${title} | ${siteTitle}` : siteTitle, true)
    setOrRemoveMeta('twitter:description', resolvedDescription, true)
    setOrRemoveMeta('twitter:image', resolvedImageUrl, true)
    setOrRemoveMeta('twitter:image:alt', resolvedImageAlt, true)

    // ── Canonical ───────────────────────────────────
    setOrRemoveLink('canonical', canonicalUrl)
  }, [title, description, imageUrl, imageAlt, canonicalUrl, site])

  return null
}
