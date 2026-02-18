import { useState, useEffect } from 'react'
import { getSiteSettings } from '@/lib/queries'

export interface SiteSettings {
  _id: string
  siteTitle: string | null
  siteTagline: string | null
  metaDescription: string | null
  defaultSocialImageUrl: string | null
  defaultSocialImageAlt: string | null
  faviconUrl: string | null
  logo: string | null
  navLinks: Array<{ label: string; linkType: string; href: string }> | null
  socialLinks: Array<{ platform: string; url: string }> | null
}

// Module-level cache — fetched once per session, shared across all hook instances
let cache: SiteSettings | null = null
let fetchPromise: Promise<SiteSettings> | null = null

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(cache)

  useEffect(() => {
    if (cache) return

    if (!fetchPromise) {
      fetchPromise = getSiteSettings().then((data) => {
        cache = data
        return data
      })
    }

    fetchPromise.then((data) => setSettings(data)).catch(() => {
      // Silently fail — site settings are a nice-to-have fallback
    })
  }, [])

  return settings
}
