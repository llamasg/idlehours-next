import { Link } from 'react-router-dom'
import { Separator } from '@/components/ui/separator'

const footerColumns = [
  {
    title: 'Explore',
    links: [
      { label: 'Game Library', href: '/games' },
      { label: 'Guides', href: '/blog' },
      { label: 'Quizzes', href: '/quizzes' },
      { label: 'Desk Setup', href: '/shop' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Disclosure', href: '/disclosure' },
    ],
  },
]

export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border/60">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link to="/" className="font-heading text-lg font-bold tracking-tight text-foreground">
              idle hours
            </Link>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Cozy game discovery, honest reviews, and everything you need for a calmer kind of play.
            </p>
          </div>

          {/* Link columns */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-foreground/70 transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8 bg-border/40" />

        <p className="text-center text-xs text-muted-foreground/60">
          &copy; {new Date().getFullYear()} Idle Hours. Gently obsessive since forever.
        </p>
      </div>
    </footer>
  )
}
