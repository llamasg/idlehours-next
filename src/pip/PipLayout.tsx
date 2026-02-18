import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  Home,
  Lightbulb,
  Network,
  Search,
  Target,
  Film,
  Calendar,
  BarChart3,
  Trophy,
  Menu,
  X,
} from 'lucide-react';
import { StreakBar } from './components/StreakBar';
import { XpBar } from './components/XpBar';
import { usePipData } from './hooks/usePipData';

interface PipLayoutProps {
  onLogout: () => void;
}

const navItems = [
  { to: '/pip', label: 'Home', icon: Home, end: true },
  { to: '/pip/ideas', label: 'Ideas', icon: Lightbulb },
  { to: '/pip/clusters', label: 'Clusters', icon: Network },
  { to: '/pip/seo', label: 'SEO Helper', icon: Search },
  { to: '/pip/goals', label: 'Goals', icon: Target },
  { to: '/pip/content', label: 'Content', icon: Film },
  { to: '/pip/calendar', label: 'Calendar', icon: Calendar },
  { to: '/pip/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/pip/achievements', label: 'Achievements', icon: Trophy },
] as const;

export default function PipLayout({ onLogout }: PipLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { streak, xp, level } = usePipData();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 space-y-1">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold font-serif">
            {'\u{1F916}'} Pip
          </h1>
          {/* Close button on mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-white/40 hover:text-white"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-white/60">Hey Beth {'\u{1F44B}'}</p>
      </div>

      {/* Streak & XP */}
      <div className="px-6 space-y-3 mb-4">
        <StreakBar streak={streak} />
        <XpBar xp={xp} level={level} />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, ...rest }) => (
          <NavLink
            key={to}
            to={to}
            end={'end' in rest}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 mt-auto">
        <button
          onClick={onLogout}
          className="text-sm text-white/40 hover:text-white transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[280px] shrink-0 bg-brand-dark text-white flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          {/* Sidebar panel */}
          <aside
            className="relative w-[280px] h-full bg-brand-dark text-white flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 bg-background overflow-y-auto">
        {/* Mobile hamburger */}
        <div className="md:hidden p-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-foreground"
            aria-label="Open sidebar"
          >
            <Menu size={24} />
          </button>
        </div>

        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
