// src/components/Navbar.tsx

import { Search, ExternalLink, Menu, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Blog", href: "/blog" },
  { label: "Pokémon of the Month", href: "/pokemon-of-the-month" },
  { label: "Quizzes", href: "/quizzes" },
  { label: "Shop", href: "https://etsy.com", external: true },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/blog?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        {/* Wordmark */}
        <a href="/" className="font-heading text-xl font-black tracking-tight text-foreground">
          un un un
        </a>

        {/* Search — desktop */}
        <form onSubmit={handleSearch} className="hidden max-w-xs flex-1 px-8 md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search articles…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 rounded-full border-border/60 bg-muted/40 pl-9 text-sm placeholder:text-muted-foreground"
            />
          </div>
        </form>

        {/* Nav links — desktop */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
              {link.external && <ExternalLink className="h-3 w-3" />}
            </a>
          ))}
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-border/40 bg-background transition-all duration-300 md:hidden",
          mobileOpen ? "max-h-80 py-4" : "max-h-0 py-0"
        )}
      >
        <nav className="flex flex-col gap-1 px-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
            >
              {link.label}
              {link.external && <ExternalLink className="h-3 w-3" />}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}