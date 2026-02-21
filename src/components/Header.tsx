import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Menu, X, Sparkles } from 'lucide-react'

const navLinks = [
  { label: 'Game Library', href: '/games' },
  { label: 'Quizzes', href: '/quizzes' },
  { label: 'Posts', href: '/blog' },
  { label: 'Desk Setup', href: '/shop' },
  { label: 'About', href: '/about' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        {/* Logo */}
        <Link to="/" className="font-heading text-xl font-bold tracking-tight text-foreground">
          idle hours
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="rounded-full px-4 py-2 font-heading text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <button
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Search"
          >
            <Search size={18} />
          </button>

          <Link
            to="/quizzes"
            className="hidden items-center gap-1.5 rounded-full bg-primary px-4 py-2 font-heading text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:flex"
          >
            <Sparkles size={14} />
            Find a game
          </Link>

          {/* Mobile menu toggle */}
          <button
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/40 md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 font-heading text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/quizzes"
                onClick={() => setMobileOpen(false)}
                className="mt-2 flex items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2.5 font-heading text-sm font-semibold text-primary-foreground"
              >
                <Sparkles size={14} />
                Find a game for my mood
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
