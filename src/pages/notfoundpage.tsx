import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Home, Search } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-20 lg:px-8 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Error Code */}
          <h1 className="mb-4 font-heading text-8xl font-black text-primary md:text-9xl">
            404
          </h1>

          {/* Message */}
          <h2 className="mb-4 font-heading text-3xl font-bold text-foreground md:text-4xl">
            Page Not Found
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            This page doesn't exist, or it's been moved somewhere else.
          </p>

          {/* Actions */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href="/">
              <Button className="rounded-full px-6 font-heading text-xs uppercase tracking-wider">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </a>
            <a href="/blog">
              <Button
                variant="outline"
                className="rounded-full px-6 font-heading text-xs uppercase tracking-wider text-foreground hover:bg-secondary"
              >
                <Search className="mr-2 h-4 w-4" />
                Browse Blog
              </Button>
            </a>
          </div>

          {/* Suggested Content */}
          <div className="mt-16">
            <p className="mb-6 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              You might be looking for:
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: "Blog", href: "/blog" },
                { label: "Shop", href: "/shop" },
                { label: "Game Library", href: "/games" },
                { label: "Quizzes", href: "/quizzes" },
                { label: "About", href: "/about" },
                { label: "Contact", href: "/contact" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-xl border border-border/40 bg-card p-4 text-sm font-medium text-foreground transition-all hover:border-primary/40 hover:bg-secondary"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      </main>

      <SiteFooter />
    </div>
  );
}
