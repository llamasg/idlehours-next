# Next.js Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate Idle Hours from Vite/React SPA to Next.js 14 (App Router), keeping Sanity content, Pip dashboard, and all visual design intact, while enabling SSR/SSG for SEO.

**Architecture:** Replace Vite/React Router with Next.js App Router under `src/app/`. Server components fetch Sanity data directly via `async/await`. Interactive pages (blog search, game filters) and the entire Pip dashboard use `'use client'`. All existing components carry over with `react-router-dom` imports swapped for `next/link` and `next/navigation`.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, @sanity/client, @portabletext/react, framer-motion, lucide-react

---

## Context: what exists right now

- `src/components/` — Header, SiteFooter, GameTileCard, BlogTileCard, SectionRenderer, Hero, GameReferenceBlock, CdPlayer, ClickSpark, etc.
- `src/lib/sanity.ts` — `createClient` with projectId `ijj3h2lj`, dataset `production`
- `src/lib/queries.ts` — all GROQ fetch functions
- `src/types/index.ts` — full TypeScript types
- `src/pip/` — entire Pip dashboard (components, hooks, views, lib, auth)
- `src/pages/` — Vite pages (to be removed)
- `studio/` — Sanity Studio (untouched — deployed separately via `sanity deploy`)

---

## Task 1: Install Next.js and replace build tooling

**Files:**
- Modify: `package.json`
- Create: `next.config.ts`
- Create: `vercel.json`
- Modify: `tsconfig.json`
- Delete: `vite.config.ts`, `index.html`, `tsconfig.app.json`, `tsconfig.node.json`
- Delete: `src/main.tsx`, `src/App.tsx`
- Delete: removed pages — `src/pages/shoppage.tsx`, `src/pages/disclosurepage.tsx`, `src/pages/privacypage.tsx`, `src/pages/quizpage.tsx`

**Step 1: Install Next.js and uninstall Vite**

```bash
npm install next@14
npm uninstall react-router-dom vite @vitejs/plugin-react basic-ftp ssh2-sftp-client
```

Expected: package-lock.json updates, no errors.

**Step 2: Replace `package.json` scripts and remove dead devDeps**

New scripts block (keep all other fields unchanged):
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "build:studio": "cd studio && npm run build",
  "deploy:studio": "cd studio && npx sanity deploy"
},
```

Also remove from `devDependencies`: `@vitejs/plugin-react`, `vite`.

**Step 3: Create `next.config.ts`**

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
    ],
  },
}

export default nextConfig
```

**Step 4: Create `vercel.json`**

```json
{
  "framework": "nextjs"
}
```

**Step 5: Replace `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Step 6: Delete Vite-specific files**

```bash
rm vite.config.ts index.html tsconfig.app.json tsconfig.node.json
rm src/main.tsx src/App.tsx
rm src/pages/shoppage.tsx src/pages/disclosurepage.tsx src/pages/privacypage.tsx src/pages/quizpage.tsx
```

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: install Next.js 14, remove Vite build tooling"
```

---

## Task 2: Global styles and Tailwind

**Files:**
- Create: `src/app/globals.css`
- Modify: `tailwind.config.js`
- Delete: `src/index.css`

**Step 1: Create `src/app/globals.css`**

Copy the entire content of `src/index.css` verbatim into `src/app/globals.css`. Only change the font import line — replace the Google Fonts `@import` with Next.js font handling (done in layout Task 3), or keep the `@import` line as-is (simpler). Keeping as-is is fine for now.

Full content of `src/app/globals.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600;1,700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 30 47% 93%;
    --foreground: 36 20% 10%;
    --card: 0 0% 100%;
    --card-foreground: 36 20% 10%;
    --popover: 0 0% 100%;
    --popover-foreground: 36 20% 10%;
    --primary: 25 89% 42%;
    --primary-foreground: 0 0% 100%;
    --secondary: 210 20% 98%;
    --secondary-foreground: 36 20% 10%;
    --muted: 30 20% 90%;
    --muted-foreground: 220 9% 46%;
    --accent: 153 39% 52%;
    --accent-foreground: 0 0% 100%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --border: 30 15% 82%;
    --input: 30 15% 82%;
    --ring: 25 89% 42%;
    --radius: 1rem;
    --linen: 30 47% 93%;
    --brand-dark: 36 20% 10%;
    --brand-green: 155 41% 30%;
    --accent-green: 153 39% 52%;
    --burnt-orange: 25 89% 42%;
    --teal: 148 72% 26%;
  }
}

@layer base {
  * { @apply border-border; }
  body {
    @apply bg-background text-foreground;
    font-family: 'Lora', Georgia, serif;
  }
  h1, h2, h3, h4, h5, h6 { font-family: 'Lora', Georgia, serif; }
}

@layer utilities {
  .font-heading { font-family: 'Lora', Georgia, serif; }
  .font-body    { font-family: 'Lora', Georgia, serif; }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar { display: none; }
}
```

**Step 2: Update `tailwind.config.js` content paths**

Change the `content` array from:
```js
content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
```
to:
```js
content: ["./src/**/*.{js,ts,jsx,tsx}"],
```

**Step 3: Delete `src/index.css`**

```bash
rm src/index.css
```

**Step 4: Verify Tailwind still resolves**

```bash
npm run build 2>&1 | grep -i "error\|warning" | head -20
```

Expected: no Tailwind-related errors (Next.js may error about missing pages — that's fine at this stage).

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: move styles to src/app/globals.css, update Tailwind content paths"
```

---

## Task 3: Adapt shared components for Next.js

**Files:**
- Modify: `src/components/Header.tsx`
- Modify: `src/components/SiteFooter.tsx`
- Modify: `src/components/GameTileCard.tsx`
- Modify: `src/components/BlogTileCard.tsx`
- Modify: `src/components/SectionRenderer.tsx`
- Modify: `src/components/Hero.tsx`
- Modify: `src/components/GameReferenceBlock.tsx`
- Modify: `src/components/RowCarousel.tsx`
- Modify: `src/components/AffiliateCTA.tsx`

**The universal change:** Every component that has `import { Link } from 'react-router-dom'` or `import { useNavigate } from 'react-router-dom'` needs updating.

**Pattern to apply to all components:**

| Old | New |
|-----|-----|
| `import { Link } from 'react-router-dom'` | `import Link from 'next/link'` |
| `import { useNavigate } from 'react-router-dom'` | `import { useRouter } from 'next/navigation'` |
| `<Link to="/games">` | `<Link href="/games">` |
| `const navigate = useNavigate(); navigate('/games')` | `const router = useRouter(); router.push('/games')` |
| `import { useParams } from 'react-router-dom'` | `import { useParams } from 'next/navigation'` |
| `import { useSearchParams } from 'react-router-dom'` | `import { useSearchParams } from 'next/navigation'` |

**Step 1: Add `'use client'` to interactive components**

These components have `useState`/`useEffect`/event handlers and MUST have `'use client'` as their first line:

- `src/components/Header.tsx` — has mobile menu state → add `'use client'`
- `src/components/RowCarousel.tsx` — scroll state → add `'use client'`
- `src/components/GameTileCard.tsx` — uses framer-motion whileHover → add `'use client'`
- `src/components/BlogTileCard.tsx` — uses framer-motion → add `'use client'`
- `src/components/GameReferenceBlock.tsx` — uses Link (next/link fine in server) → no 'use client' needed unless it uses hooks
- `src/components/SectionRenderer.tsx` — renders client components, itself is fine as server component (no hooks)
- `src/components/Hero.tsx` — uses framer-motion → add `'use client'`

**Step 2: Update Header.tsx**

At top of file add `'use client'` directive and update imports:

```tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
// remove: import { Link, useLocation } from 'react-router-dom'
```

Replace all `<Link to="...">` with `<Link href="...">`.

If Header uses `useLocation().pathname` for active link detection, replace with:
```tsx
const pathname = usePathname()
```

**Step 3: Update SiteFooter.tsx**

```tsx
import Link from 'next/link'
// Remove react-router-dom import
```
Replace all `<Link to="...">` with `<Link href="...">`.
SiteFooter has no state — no `'use client'` needed.

**Step 4: Update GameTileCard.tsx**

```tsx
'use client'
import Link from 'next/link'
// Remove: import { Link } from 'react-router-dom'
```
Replace `<Link to={...}>` with `<Link href={...}>`.

**Step 5: Update BlogTileCard.tsx**

```tsx
'use client'
import Link from 'next/link'
```
Replace `to` with `href`.

**Step 6: Update RowCarousel.tsx**

```tsx
'use client'
import Link from 'next/link'
```
Replace `to` with `href` in seeAllLink rendering.

**Step 7: Update GameReferenceBlock.tsx**

```tsx
import Link from 'next/link'
// Remove react-router-dom
```
Replace `<Link to={...}>` with `<Link href={...}>`. GameReferenceBlock has no client hooks so no `'use client'` needed (next/link works in server components).

**Step 8: Update Hero.tsx**

```tsx
'use client'
import Link from 'next/link'
```

**Step 9: Update AffiliateCTA.tsx**

```tsx
import Link from 'next/link'
```

**Step 10: Update SectionRenderer.tsx**

```tsx
import Link from 'next/link'
// If present, remove react-router-dom
```
SectionRenderer itself doesn't need `'use client'` — it only renders other components.

**Step 11: Verify no react-router-dom imports remain in components**

```bash
grep -r "react-router-dom" src/components/
```
Expected: no output.

**Step 12: Commit**

```bash
git add src/components/
git commit -m "feat: adapt shared components for Next.js (Link, usePathname)"
```

---

## Task 4: Add `'use client'` to ClickSpark and CdPlayer, create ClientProviders

**Files:**
- Modify: `src/components/ClickSpark.jsx`
- Modify: `src/components/CdPlayer.tsx`
- Create: `src/components/ClientProviders.tsx`

**Step 1: Add `'use client'` to ClickSpark.jsx**

Add as the very first line of `src/components/ClickSpark.jsx`:
```js
'use client'
```

**Step 2: Add `'use client'` to CdPlayer.tsx**

Add as the very first line of `src/components/CdPlayer.tsx`:
```tsx
'use client'
```

**Step 3: Create `src/components/ClientProviders.tsx`**

This wraps the app shell with interactive client components that must live outside the server layout:

```tsx
'use client'

import ClickSpark from './ClickSpark'
import CdPlayer from './CdPlayer'

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ClickSpark
      sparkColor="#c95d0d"
      sparkSize={10}
      sparkRadius={15}
      sparkCount={8}
      duration={400}
    >
      <CdPlayer />
      {children}
    </ClickSpark>
  )
}
```

**Step 4: Commit**

```bash
git add src/components/ClickSpark.jsx src/components/CdPlayer.tsx src/components/ClientProviders.tsx
git commit -m "feat: add use client to ClickSpark/CdPlayer, create ClientProviders"
```

---

## Task 5: Root layout

**Files:**
- Create: `src/app/layout.tsx`

**Step 1: Create `src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import './globals.css'
import ClientProviders from '@/components/ClientProviders'

export const metadata: Metadata = {
  title: {
    default: 'Idle Hours',
    template: '%s | Idle Hours',
  },
  description: 'Cozy game discovery and reviews for the quiet hours',
  metadataBase: new URL('https://idlehours.co.uk'),
  openGraph: {
    siteName: 'Idle Hours',
    locale: 'en_GB',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
```

**Step 2: Run dev server to verify layout loads**

```bash
npm run dev
```

Open http://localhost:3000. Expected: Next.js renders the body (may show 404 — that's fine, no `page.tsx` yet).

**Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: add Next.js root layout with ClientProviders"
```

---

## Task 6: Homepage

**Files:**
- Create: `src/app/page.tsx`
- Note: `src/lib/queries.ts` and `src/components/SectionRenderer.tsx` already exist unchanged

**Step 1: Create `src/app/page.tsx`**

This is a server component — no `'use client'`, no useEffect, data fetched directly:

```tsx
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import SectionRenderer from '@/components/SectionRenderer'
import HomeLoader from '@/components/HomeLoader'
import { getHomePage } from '@/lib/queries'

export default async function HomePage() {
  const homePage = await getHomePage()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl space-y-10 px-4 py-8 lg:px-8 lg:py-12">
        {homePage ? (
          <SectionRenderer sections={homePage.sections} />
        ) : (
          <div className="py-24 text-center text-muted-foreground">
            <p className="font-heading text-lg">Could not load homepage content.</p>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
```

Note: `HomeLoader` (the curtain animation) uses `useState`/`useEffect`. Add `'use client'` to `src/components/HomeLoader.tsx` if it doesn't already have it, then import it. For the homepage, we can omit it for now (SSR pages don't need loading animations — they render instantly). Remove the HomeLoader import entirely from this page.

**Step 2: Add `'use client'` to HomeLoader.tsx (in case it's imported elsewhere)**

Add `'use client'` as first line of `src/components/HomeLoader.tsx`.

**Step 3: Test the homepage loads**

```bash
npm run dev
```

Open http://localhost:3000. Expected: Homepage renders with content from Sanity.

**Step 4: Commit**

```bash
git add src/app/page.tsx src/components/HomeLoader.tsx
git commit -m "feat: add Next.js homepage as server component"
```

---

## Task 7: Blog listing page

**Files:**
- Create: `src/app/blog/page.tsx`

The blog page has search + category filters (useState, useSearchParams) — it must be a client component.

**Step 1: Create `src/app/blog/page.tsx`**

Copy `src/pages/blogpage.tsx`, then make these changes:
1. Add `'use client'` as first line
2. Replace `import { Link, useSearchParams } from 'react-router-dom'` with:
   ```tsx
   import Link from 'next/link'
   import { useSearchParams, useRouter } from 'next/navigation'
   ```
3. The `useSearchParams` from next/navigation returns a read-only `ReadonlyURLSearchParams` object (no `setSearchParams`). Replace the URL update logic:

   ```tsx
   // Old (react-router):
   const [searchParams, setSearchParams] = useSearchParams()
   setSearchParams(params)

   // New (next/navigation):
   const searchParams = useSearchParams()
   const router = useRouter()
   // To update URL:
   router.push(`/blog?${params.toString()}`, { scroll: false })
   ```

4. Replace `<Link to={...}>` with `<Link href={...}>` throughout.

Full file `src/app/blog/page.tsx`:

```tsx
'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
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

const CATEGORIES = ['All', 'Lists', 'Opinions', 'Recommendations']
const POSTS_PER_PAGE = 9

export default function BlogPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') ?? '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') ?? 'All')
  const [visiblePosts, setVisiblePosts] = useState(POSTS_PER_PAGE)

  useEffect(() => {
    getAllPosts().then((data) => { setPosts(data); setLoading(false) })
  }, [])

  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('search', searchQuery)
    if (selectedCategory !== 'All') params.set('category', selectedCategory)
    const qs = params.toString()
    router.replace(qs ? `/blog?${qs}` : '/blog', { scroll: false })
  }, [searchQuery, selectedCategory, router])

  const filteredPosts = useMemo(() => {
    let filtered = posts
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((p) => p.categories?.includes(selectedCategory))
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.subheader?.toLowerCase().includes(q) ||
          p.categories?.some((c) => c.toLowerCase().includes(q))
      )
    }
    return filtered
  }, [posts, selectedCategory, searchQuery])

  const displayed = filteredPosts.slice(0, visiblePosts)
  const hasMore = displayed.length < filteredPosts.length

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-12">
          <div className="h-64 animate-pulse rounded-3xl bg-muted/40" />
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className="mb-4 font-heading text-4xl font-black text-foreground md:text-5xl lg:text-6xl">
            Posts
          </h1>
          <p className="text-lg text-muted-foreground">
            Tips, reviews, and thoughtful takes on the cozy gaming life
          </p>
        </motion.div>

        {/* Search */}
        <div className="mb-8 space-y-4">
          <div className="relative mx-auto max-w-2xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 w-full rounded-full border border-border/60 bg-muted/40 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setVisiblePosts(POSTS_PER_PAGE) }}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-muted/40 text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {(searchQuery || selectedCategory !== 'All') && (
          <p className="mb-6 text-center text-sm text-muted-foreground">
            Found {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
          </p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayed.map((post, i) => (
            <motion.div key={post._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.05 }}>
              <Link href={`/blog/${post.slug.current}`}>
                <motion.article
                  whileHover={{ y: -4 }}
                  className="group h-full overflow-hidden rounded-2xl border border-border/40 bg-card"
                >
                  <div className="aspect-[16/10] w-full overflow-hidden bg-secondary">
                    {post.headerImage && (
                      <img src={post.headerImage} alt={post.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" loading="lazy" />
                    )}
                  </div>
                  <div className="flex flex-col p-5">
                    {post.categories?.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {post.categories.slice(0, 2).map((c) => (
                          <span key={c} className="rounded-full bg-primary/20 px-2.5 py-0.5 font-heading text-[10px] font-bold uppercase tracking-widest text-primary">{c}</span>
                        ))}
                      </div>
                    )}
                    <h2 className="mb-2 font-heading text-lg font-bold leading-snug text-foreground line-clamp-2 group-hover:text-primary">{post.title}</h2>
                    <p className="mb-4 text-sm leading-relaxed text-muted-foreground line-clamp-2">{post.subheader}</p>
                    <div className="mt-auto text-xs text-muted-foreground">
                      {new Date(post.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · {post.author}
                    </div>
                  </div>
                </motion.article>
              </Link>
            </motion.div>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="rounded-2xl border border-border/40 bg-card p-12 text-center">
            <p className="mb-2 text-lg text-foreground">No posts found</p>
            <button onClick={() => { setSearchQuery(''); setSelectedCategory('All') }} className="mt-4 text-sm text-primary hover:underline">Clear filters</button>
          </div>
        )}

        {hasMore && (
          <div className="mt-12 text-center">
            <button onClick={() => setVisiblePosts((n) => n + POSTS_PER_PAGE)} className="rounded-full border border-border px-8 py-2.5 font-heading text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              Load More
            </button>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
```

**Step 2: Test blog page**

```bash
npm run dev
```

Open http://localhost:3000/blog. Expected: blog listing loads with posts from Sanity.

**Step 3: Commit**

```bash
git add src/app/blog/page.tsx
git commit -m "feat: add /blog page as client component with search/filter"
```

---

## Task 8: Blog post page

**Files:**
- Create: `src/app/blog/[slug]/page.tsx`
- Modify: `src/components/DisclosureBanner.tsx` (add `'use client'` if needed)
- Modify: `src/components/ProductCallout.tsx` (add `'use client'` if needed)

**Step 1: Add `'use client'` to PortableText custom components if needed**

Check if `AffiliateCTA`, `ProductCallout`, `DisclosureBanner`, `GameReferenceBlock` use any hooks. If they do, add `'use client'`. If not, they work as server components.

**Step 2: Create `src/app/blog/[slug]/page.tsx`**

Server component — receives `{ params }` from Next.js, fetches data server-side.

```tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { PortableText } from '@portabletext/react'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import DisclosureBanner from '@/components/DisclosureBanner'
import AffiliateCTA from '@/components/AffiliateCTA'
import ProductCallout from '@/components/ProductCallout'
import GameReferenceBlock from '@/components/GameReferenceBlock'
import { urlFor } from '@/lib/sanity'
import { getPost, getAllPosts } from '@/lib/queries'

// ── Read time ────────────────────────────────────────────
function estimateReadTime(body: any[]): string {
  if (!Array.isArray(body)) return '1 min read'
  const words = body.reduce((count, block) => {
    if (block._type === 'block' && Array.isArray(block.children)) {
      return count + block.children.map((c: any) => c.text ?? '').join(' ').split(/\s+/).filter(Boolean).length
    }
    return count
  }, 0)
  return `${Math.max(1, Math.ceil(words / 200))} min read`
}

// ── Portable Text components (identical to Vite version) ─
const ptComponents = {
  types: {
    affiliateCTA: ({ value }: any) => <AffiliateCTA value={value} />,
    productCallout: ({ value }: any) => <ProductCallout value={value} />,
    gameReference: ({ value }: any) => <GameReferenceBlock value={value} />,
    inlineImage: ({ value }: any) => (
      <figure className="my-8">
        <img src={urlFor(value).url()} alt={value.alt || ''} className="w-full rounded-xl" />
        {value.caption && <figcaption className="mt-3 text-center text-sm italic text-muted-foreground">{value.caption}</figcaption>}
      </figure>
    ),
    youtube: ({ value }: any) => {
      const match = value.url?.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/)
      if (!match) return null
      return (
        <div className="my-8 aspect-video overflow-hidden rounded-xl">
          <iframe className="h-full w-full" src={`https://www.youtube.com/embed/${match[1]}`} allowFullScreen />
        </div>
      )
    },
    codeBlock: ({ value }: any) => (
      <pre className="my-8 overflow-x-auto rounded-xl bg-muted p-4">
        <code className="font-mono text-sm text-primary">{value.code}</code>
      </pre>
    ),
    callout: ({ value }: any) => (
      <div className={`my-8 rounded-r-xl border-l-4 p-4 ${value.type === 'warning' ? 'border-yellow-500 bg-yellow-500/10' : 'border-accent bg-accent/10'}`}>
        <p className="text-white/90">{value.text}</p>
      </div>
    ),
    divider: ({ value }: any) => (
      value.style === 'dots' ? <div className="my-12 text-center text-2xl text-muted-foreground">• • •</div>
      : value.style === 'stars' ? <div className="my-12 text-center text-2xl text-muted-foreground">✦ ✦ ✦</div>
      : <hr className="my-12 border-border" />
    ),
  },
  block: {
    h2: ({ children }: any) => <h2 className="mb-6 mt-12 text-4xl font-bold text-foreground">{children}</h2>,
    h3: ({ children }: any) => <h3 className="mb-5 mt-10 text-3xl font-bold text-foreground">{children}</h3>,
    h4: ({ children }: any) => <h4 className="mb-4 mt-8 text-2xl font-bold text-foreground">{children}</h4>,
    normal: ({ children }: any) => <p className="mb-6 text-lg leading-relaxed text-muted-foreground">{children}</p>,
    blockquote: ({ children }: any) => <blockquote className="my-8 rounded-r border-l-4 border-accent bg-accent/5 py-2 pl-6 text-xl italic text-muted-foreground">{children}</blockquote>,
  },
  list: {
    bullet: ({ children }: any) => <ul className="mb-6 ml-6 list-disc space-y-3 text-lg text-muted-foreground">{children}</ul>,
    number: ({ children }: any) => <ol className="mb-6 ml-6 list-decimal space-y-3 text-lg text-muted-foreground">{children}</ol>,
  },
  marks: {
    strong: ({ children }: any) => <strong className="font-bold text-foreground">{children}</strong>,
    em: ({ children }: any) => <em className="italic">{children}</em>,
    code: ({ children }: any) => <code className="rounded bg-muted px-2 py-1 font-mono text-base text-primary">{children}</code>,
    link: ({ value, children }: any) => (
      <a href={value.href} target={value.blank ? '_blank' : '_self'} rel={value.blank ? 'noopener noreferrer' : undefined} className="text-accent underline decoration-accent/30 transition-colors hover:decoration-accent">
        {children}
      </a>
    ),
  },
}

// ── generateMetadata ─────────────────────────────────────
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.subheader,
    openGraph: {
      title: post.title,
      description: post.subheader,
      images: post.headerImage ? [{ url: post.headerImage }] : [],
      type: 'article',
      publishedTime: post.publishedAt,
    },
  }
}

// ── generateStaticParams ─────────────────────────────────
export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((p: any) => ({ slug: p.slug.current }))
}

// ── Page ─────────────────────────────────────────────────
export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const [post, allPosts] = await Promise.all([getPost(params.slug), getAllPosts()])
  if (!post) notFound()

  const otherPosts = allPosts.filter((p: any) => p.slug.current !== params.slug).slice(0, 4)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <article>
        <div className="w-full">
          <img src={post.headerImage} alt={post.title} className="max-h-[70vh] w-full object-cover" />
        </div>
        <div className="mx-auto max-w-5xl px-4 py-8 pb-20">
          <Link href="/blog" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            ← Back to Blog
          </Link>
          {post.categories?.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {post.categories.map((cat: string) => (
                <span key={cat} className="rounded-full border border-accent/30 bg-accent/20 px-3 py-1 text-xs text-accent">{cat}</span>
              ))}
            </div>
          )}
          <h1 className="mb-4 text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">{post.title}</h1>
          <p className="mb-6 text-xl leading-relaxed text-muted-foreground md:text-2xl">{post.subheader}</p>
          <div className="mb-8 flex items-center gap-2 border-b border-border pb-8 text-sm text-muted-foreground">
            <span>{estimateReadTime(post.body)}</span>
            <span>·</span>
            <span>{new Date(post.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
          {post.affiliateDisclosureRequired && <DisclosureBanner />}
          <div className="prose max-w-none">
            <PortableText value={post.body} components={ptComponents} />
          </div>
          {otherPosts.length > 0 && (
            <div className="mt-16 border-t border-border pt-12">
              <h2 className="mb-6 font-heading text-2xl font-bold text-foreground">Other Posts You Might Like</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {otherPosts.map((p: any) => (
                  <Link key={p._id} href={`/blog/${p.slug.current}`}>
                    <article className="group overflow-hidden rounded-2xl border border-border/40 bg-card">
                      <div className="aspect-[16/10] overflow-hidden bg-secondary">
                        {p.headerImage && <img src={p.headerImage} alt={p.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" loading="lazy" />}
                      </div>
                      <div className="p-4">
                        <h3 className="mb-2 line-clamp-2 font-heading text-sm font-bold leading-snug text-foreground group-hover:text-primary">{p.title}</h3>
                        <p className="text-[11px] text-muted-foreground">{p.author}</p>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
      <SiteFooter />
    </div>
  )
}
```

**Step 3: Test blog post**

```bash
npm run dev
```

Open http://localhost:3000/blog, click a post. Expected: full blog post renders with Portable Text blocks.

**Step 4: Commit**

```bash
git add src/app/blog/
git commit -m "feat: add /blog/[slug] server component with generateMetadata + generateStaticParams"
```

---

## Task 9: Games library and game detail pages

**Files:**
- Create: `src/app/games/page.tsx`
- Create: `src/app/games/[slug]/page.tsx`

**Step 1: Create `src/app/games/page.tsx`**

The games library has filters and sort — must be `'use client'`. Copy `src/pages/gamespage.tsx` and make these changes:
1. Add `'use client'` as first line
2. Replace `import { Link } from 'react-router-dom'` → `import Link from 'next/link'`
3. Replace `import { useSearchParams } from 'react-router-dom'` with `import { useSearchParams, useRouter } from 'next/navigation'`
4. Update URL sync pattern (same as blog page: use `router.replace` instead of `setSearchParams`)
5. Replace `<Link to={...}>` → `<Link href={...}>`

The gamespage fetches `getAllGames()` in a useEffect on mount. This approach still works for a client component — no change needed to the fetch logic.

Ensure the file starts with:
```tsx
'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
// ... rest of imports unchanged
```

**Step 2: Create `src/app/games/[slug]/page.tsx`**

Server component. Copy `src/pages/gamedetailpage.tsx` and convert:
1. Remove `'use client'` (it's a server component)
2. Remove `useParams`, `useEffect`, `useState`
3. Add `generateMetadata` and `generateStaticParams`
4. Replace react-router-dom imports with next/link and next/navigation

```tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import { getGame, getAllGames } from '@/lib/queries'
import { Disc3 } from 'lucide-react'
// ... keep all other imports from the existing gamedetailpage

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const game = await getGame(params.slug)
  if (!game) return {}
  return {
    title: game.title,
    description: game.shortDescription,
    openGraph: {
      title: game.title,
      description: game.shortDescription,
      images: game.coverImage ? [{ url: game.coverImage }] : [],
    },
  }
}

export async function generateStaticParams() {
  const games = await getAllGames()
  return games.map((g: any) => ({ slug: g.slug.current }))
}

export default async function GameDetailPage({ params }: { params: { slug: string } }) {
  const game = await getGame(params.slug)
  if (!game) notFound()

  // Copy all the JSX from the existing gamedetailpage.tsx verbatim from here,
  // removing the loading state and replacing useParams with the `params` prop.
  // The page renders directly with the `game` object.

  return (
    // ... copy entire return from existing gamedetailpage.tsx
  )
}
```

**Important**: The `gamedetailpage.tsx` has `ocColor` and other helper functions — keep all of them, just paste them above the exported function.

**Step 3: Test games pages**

```bash
npm run dev
```

Open http://localhost:3000/games. Expected: game library grid with filters.
Click a game. Expected: game detail page renders.

**Step 4: Commit**

```bash
git add src/app/games/
git commit -m "feat: add /games and /games/[slug] pages"
```

---

## Task 10: Simple pages (quizzes, about, contact, not-found)

**Files:**
- Create: `src/app/quizzes/page.tsx`
- Create: `src/app/about/page.tsx`
- Create: `src/app/contact/page.tsx`
- Create: `src/app/not-found.tsx`

**Step 1: Create `src/app/quizzes/page.tsx`**

The quizzes page fetches data and shows a grid — server component:

```tsx
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import { getAllQuizzes } from '@/lib/queries'

export const metadata = { title: 'Quizzes' }

export default async function QuizzesPage() {
  const quizzes = await getAllQuizzes()
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-heading text-4xl font-black text-foreground md:text-5xl">Quizzes</h1>
          <p className="text-lg text-muted-foreground">Find your cozy gaming match</p>
        </div>
        {quizzes.length === 0 ? (
          <div className="rounded-2xl border border-border/40 bg-card p-16 text-center">
            <p className="text-2xl text-muted-foreground">Quizzes coming soon</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz: any) => (
              <div key={quiz._id} className="overflow-hidden rounded-2xl border border-border/40 bg-card p-6">
                <div className="mb-3 text-4xl">{quiz.emoji ?? '🎮'}</div>
                <h2 className="mb-2 font-heading text-lg font-bold text-foreground">{quiz.title}</h2>
                <p className="text-sm text-muted-foreground">{quiz.description}</p>
              </div>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
```

**Step 2: Create `src/app/about/page.tsx`**

Copy `src/pages/aboutpage.tsx`, convert to server component:
1. Remove `useState`/`useEffect`
2. Replace react-router imports with next/link
3. Add `export const metadata = { title: 'About' }`
4. Make function async (no data fetching needed — it's static content)

```tsx
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'

export const metadata = { title: 'About' }

export default function AboutPage() {
  // Copy JSX from src/pages/aboutpage.tsx verbatim
  return ( /* ... existing JSX ... */ )
}
```

**Step 3: Create `src/app/contact/page.tsx`**

The contact page likely has a form with useState — add `'use client'` if so.
Copy `src/pages/contactpage.tsx`, add `'use client'` if it has form state, replace react-router imports.

```tsx
'use client'  // only if ContactForm uses useState

import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import ContactForm from '@/components/ContactForm'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-12 lg:py-16">
        <h1 className="mb-8 font-heading text-4xl font-bold text-foreground">Get in touch</h1>
        <ContactForm />
      </main>
      <SiteFooter />
    </div>
  )
}
```

Note: `src/components/ContactForm.tsx` almost certainly uses useState — add `'use client'` to it.

**Step 4: Create `src/app/not-found.tsx`**

```tsx
import Link from 'next/link'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-4 font-heading text-6xl font-black text-foreground">404</h1>
        <p className="mb-8 text-xl text-muted-foreground">This page has wandered off somewhere cozy.</p>
        <Link href="/" className="rounded-full bg-primary px-8 py-3 font-heading text-sm font-semibold text-white transition-colors hover:bg-primary/90">
          Go home
        </Link>
      </main>
      <SiteFooter />
    </div>
  )
}
```

**Step 5: Add `'use client'` to ContactForm.tsx**

```tsx
'use client'
// ... rest of file
```

**Step 6: Test all pages**

```bash
npm run dev
```

Check: /quizzes, /about, /contact, navigate to /nonexistent (should show 404).

**Step 7: Commit**

```bash
git add src/app/quizzes/ src/app/about/ src/app/contact/ src/app/not-found.tsx src/components/ContactForm.tsx
git commit -m "feat: add quizzes, about, contact pages and 404"
```

---

## Task 11: Pip dashboard

**Files:**
- Create: `src/app/pip/layout.tsx`
- Create: `src/app/pip/page.tsx`
- Create: `src/app/pip/home/page.tsx`
- Create: `src/app/pip/ideas/page.tsx`
- Create: `src/app/pip/clusters/page.tsx`
- Create: `src/app/pip/content/page.tsx`
- Create: `src/app/pip/goals/page.tsx`
- Create: `src/app/pip/analytics/page.tsx`
- Create: `src/app/pip/calendar/page.tsx`
- Create: `src/app/pip/achievements/page.tsx`
- Create: `src/app/pip/seo/page.tsx`
- Modify: `src/pip/PipLayout.tsx`
- Modify: `src/pip/auth/PipAuthGate.tsx` and `src/pip/auth/usePipAuth.ts`
- Modify: All files in `src/pip/` (add `'use client'` where needed)

**The big picture for Pip:** The current `PipApp.tsx` uses React Router `<Routes>` internally. In Next.js, we replace that with actual Next.js routes under `src/app/pip/`. The `PipLayout.tsx` becomes the `src/app/pip/layout.tsx`.

**Step 1: Add `'use client'` to all pip files**

Every file in `src/pip/` uses hooks (useState, useEffect, custom hooks). Run:

```bash
# Check which pip files lack 'use client'
grep -rL "'use client'" src/pip/
```

For each file listed, add `'use client'` as the first line.

Specifically these definitely need it:
- `src/pip/PipLayout.tsx`
- `src/pip/auth/PipAuthGate.tsx`
- `src/pip/auth/usePipAuth.ts`
- All files in `src/pip/components/`
- All files in `src/pip/hooks/`
- All files in `src/pip/views/`
- All files in `src/pip/lib/`

**Step 2: Update PipLayout.tsx for Next.js navigation**

PipLayout currently uses React Router's `useLocation`/`NavLink`. Replace:

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
// Remove: import { NavLink, useLocation, useNavigate } from 'react-router-dom'
```

For active link detection, replace `useLocation().pathname` with `usePathname()`.

For NavLink active styling, replace:
```tsx
// Old:
<NavLink to="home" className={({ isActive }) => isActive ? 'active-class' : 'normal-class'}>

// New:
<Link href="/pip/home" className={pathname === '/pip/home' ? 'active-class' : 'normal-class'}>
```

Apply this pattern to every navigation link in PipLayout's sidebar/navbar.

**Step 3: Create `src/app/pip/layout.tsx`**

```tsx
import PipAuthGate from '@/pip/auth/PipAuthGate'
import PipLayout from '@/pip/PipLayout'

export default function PipRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <PipAuthGate>
      <PipLayout>
        {children}
      </PipLayout>
    </PipAuthGate>
  )
}
```

Note: Since `PipAuthGate` and `PipLayout` are `'use client'` components, Next.js will automatically treat this layout as a client component. No `'use client'` needed on the layout file itself.

**Step 4: Create `src/app/pip/page.tsx`** (redirect to /pip/home)

```tsx
import { redirect } from 'next/navigation'

export default function PipIndexPage() {
  redirect('/pip/home')
}
```

**Step 5: Create individual Pip view pages**

Each one is trivial — just renders the view component:

```tsx
// src/app/pip/home/page.tsx
import PipHome from '@/pip/views/PipHome'
export default function Page() { return <PipHome /> }

// src/app/pip/ideas/page.tsx
import PipIdeas from '@/pip/views/PipIdeas'
export default function Page() { return <PipIdeas /> }

// src/app/pip/clusters/page.tsx
import PipClusters from '@/pip/views/PipClusters'
export default function Page() { return <PipClusters /> }

// src/app/pip/content/page.tsx
import PipContentCreation from '@/pip/views/PipContentCreation'
export default function Page() { return <PipContentCreation /> }

// src/app/pip/goals/page.tsx
import PipGoals from '@/pip/views/PipGoals'
export default function Page() { return <PipGoals /> }

// src/app/pip/analytics/page.tsx
import PipAnalytics from '@/pip/views/PipAnalytics'
export default function Page() { return <PipAnalytics /> }

// src/app/pip/calendar/page.tsx
import PipCalendar from '@/pip/views/PipCalendar'
export default function Page() { return <PipCalendar /> }

// src/app/pip/achievements/page.tsx
import PipAchievements from '@/pip/views/PipAchievements'
export default function Page() { return <PipAchievements /> }

// src/app/pip/seo/page.tsx
import PipSeoHelper from '@/pip/views/PipSeoHelper'
export default function Page() { return <PipSeoHelper /> }
```

**Step 6: Update PipAuthGate for Next.js**

`PipAuthGate` uses `localStorage` — that's fine with `'use client'`. No major changes needed beyond adding the directive. If it uses `useNavigate` to redirect, replace with `useRouter` from next/navigation.

**Step 7: Test Pip dashboard**

```bash
npm run dev
```

Open http://localhost:3000/pip. Expected: redirects to /pip/home, shows auth gate, then dashboard on correct password.

**Step 8: Commit**

```bash
git add src/app/pip/ src/pip/
git commit -m "feat: migrate Pip dashboard to Next.js App Router routes"
```

---

## Task 12: Environment variables and final cleanup

**Files:**
- Modify: `.env.local`
- Delete: `src/pages/` (entire directory — all Vite pages now replaced)
- Create: `src/app/sitemap.ts` (optional but good for SEO)

**Step 1: Update `.env.local` variable names**

In `.env.local`, rename the Vite-prefixed vars to Next.js equivalents:

```bash
# Old → New
VITE_ANTHROPIC_API_KEY  → NEXT_PUBLIC_ANTHROPIC_API_KEY
VITE_GA_MEASUREMENT_ID  → NEXT_PUBLIC_GA_MEASUREMENT_ID
```

Any var that needs to be accessible in the browser must be prefixed `NEXT_PUBLIC_`. Server-only vars (like `SANITY_TOKEN`, `SANITY_WRITE_TOKEN`) can stay without prefix.

Update all references in `src/pip/lib/pipClaude.ts` and other files:
```ts
// Old:
import.meta.env.VITE_ANTHROPIC_API_KEY
// New:
process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY
```

Search for all `import.meta.env.VITE_` references:
```bash
grep -r "import.meta.env" src/
```

Replace each with `process.env.NEXT_PUBLIC_` (for browser-exposed vars) or `process.env.` (for server-only vars).

**Step 2: Delete old Vite pages directory**

```bash
rm -rf src/pages/
```

**Step 3: Run the production build**

```bash
npm run build
```

Expected: `✓ Compiled successfully`. Fix any TypeScript errors that appear.

Common issues and fixes:
- `'x' is possibly 'undefined'` — add null checks
- Missing `'use client'` on a component that uses hooks — add it
- `import.meta.env` remaining — replace with `process.env`

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: update env vars from VITE_ to NEXT_PUBLIC_, delete old Vite pages"
```

---

## Task 13: Verify, push, and confirm Vercel deployment

**Step 1: Run full build one final time**

```bash
npm run build
```

Expected output ends with:
```
✓ Compiled successfully
Route (app)                Size     First Load JS
┌ ○ /                      ...
├ ○ /about
├ ● /blog
├ ● /blog/[slug]
├ ● /games
├ ● /games/[slug]
├ ○ /quizzes
├ ○ /contact
└ ○ /pip/...
```

**Step 2: Run dev and manually test all routes**

```bash
npm run dev
```

Checklist:
- [ ] `/` — homepage loads with Sanity sections
- [ ] `/blog` — blog grid, search works, filter works
- [ ] `/blog/some-slug` — post content renders with Portable Text
- [ ] `/games` — game library loads, filters work
- [ ] `/games/some-slug` — game detail page renders
- [ ] `/quizzes` — quizzes shell loads
- [ ] `/about` — about page loads
- [ ] `/contact` — contact form renders
- [ ] `/pip` — redirects to /pip/home, auth gate appears
- [ ] `/pip/home` — Pip dashboard loads after auth
- [ ] `/nonexistent` — 404 page shows
- [ ] ClickSpark fires on clicks
- [ ] CdPlayer widget appears

**Step 3: Push to GitHub and verify Vercel**

```bash
git push origin main
```

Expected: Vercel detects Next.js automatically (via `vercel.json`), triggers a deployment.

Monitor at: https://vercel.com/dashboard

**Step 4: Final commit if any last fixes**

```bash
git add -A
git commit -m "chore: final Next.js migration cleanup"
git push origin main
```

---

## Summary of file structure after migration

```
src/
  app/
    layout.tsx          ← root layout (server, imports ClientProviders)
    page.tsx            ← / homepage (server component)
    globals.css         ← was src/index.css
    not-found.tsx       ← 404 page
    blog/
      page.tsx          ← client component (search/filter)
      [slug]/
        page.tsx        ← server component + generateMetadata
    games/
      page.tsx          ← client component (filter/sort)
      [slug]/
        page.tsx        ← server component + generateMetadata
    quizzes/
      page.tsx          ← server component
    about/
      page.tsx          ← server component
    contact/
      page.tsx          ← client component (form)
    pip/
      layout.tsx        ← wraps PipAuthGate + PipLayout
      page.tsx          ← redirect → /pip/home
      home/page.tsx
      ideas/page.tsx
      clusters/page.tsx
      content/page.tsx
      goals/page.tsx
      analytics/page.tsx
      calendar/page.tsx
      achievements/page.tsx
      seo/page.tsx
  components/           ← adapted (Link, 'use client' where needed)
    ClientProviders.tsx ← NEW: wraps ClickSpark + CdPlayer
    Header.tsx          ← 'use client', next/link
    SiteFooter.tsx      ← next/link (no 'use client')
    GameTileCard.tsx    ← 'use client', next/link
    BlogTileCard.tsx    ← 'use client', next/link
    ... (all others adapted)
  pip/                  ← unchanged logic, 'use client' added everywhere
  lib/
    sanity.ts           ← unchanged
    queries.ts          ← unchanged
  types/
    index.ts            ← unchanged
```
