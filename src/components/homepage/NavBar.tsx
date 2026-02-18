import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const navLinks = [
  { label: "Game Library", href: "/games" },
  { label: "Quizzes", href: "/quizzes" },
  { label: "Guides", href: "/blog" },
  { label: "Cosy Corner", href: "/shop" },
  { label: "About", href: "/about" },
];

export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-linen/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-12">
        {/* Wordmark */}
        <Link
          to="/"
          className="text-xl font-semibold tracking-tight text-brand-green"
          style={{ fontFamily: "'Lora', serif" }}
        >
          idle hours
        </Link>

        {/* Centre nav links — hidden on mobile */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="text-sm text-foreground/70 transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side — search + CTA (desktop) and hamburger (mobile) */}
        <div className="flex items-center gap-3">
          {/* Search icon button */}
          <button
            type="button"
            aria-label="Search"
            className="hidden rounded-full p-2 text-foreground/70 transition-colors hover:text-foreground md:inline-flex"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* CTA button — desktop only */}
          <Link
            to="/games"
            className="hidden items-center gap-1.5 rounded-full bg-burnt-orange px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 md:inline-flex"
          >
            <span>🎮</span>
            <span>Find a game</span>
          </Link>

          {/* Mobile hamburger toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
            className="inline-flex rounded-md p-2 text-foreground transition-colors hover:text-foreground/80 md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile slide-down menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-border/40 bg-linen md:hidden"
          >
            <nav className="flex flex-col gap-1 px-6 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}

              {/* Search icon in mobile menu */}
              <button
                type="button"
                aria-label="Search"
                className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                <Search className="h-4 w-4" />
                <span>Search</span>
              </button>

              {/* CTA in mobile menu */}
              <Link
                to="/games"
                onClick={() => setMobileOpen(false)}
                className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-full bg-burnt-orange px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                <span>🎮</span>
                <span>Find a game</span>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
