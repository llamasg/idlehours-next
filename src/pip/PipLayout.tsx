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
import { usePipData } from './hooks/usePipData';
import { getLevelInfo } from './lib/pipMockData';

interface PipLayoutProps {
  onLogout: () => void;
}

interface NavItemDef {
  to: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  end?: boolean;
  badge?: number;
}

function NavItem({ to, label, icon: Icon, end, badge, onClose }: NavItemDef & { onClose: () => void }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClose}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
          isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'
        }`
      }
    >
      <Icon size={18} />
      <span>{label}</span>
      {badge ? (
        <span className="ml-auto bg-[#7C9B7A] text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
          {badge}
        </span>
      ) : null}
    </NavLink>
  );
}

export default function PipLayout({ onLogout }: PipLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { streak, xp, ideas } = usePipData();
  const levelInfo = getLevelInfo(xp);

  const navItems: NavItemDef[] = [
    { to: '/pip', label: 'Home', icon: Home, end: true },
    { to: '/pip/ideas', label: 'Ideas', icon: Lightbulb, badge: ideas.length },
    { to: '/pip/clusters', label: 'Clusters', icon: Network },
    { to: '/pip/seo', label: 'SEO Helper', icon: Search },
    { to: '/pip/goals', label: 'Goals', icon: Target },
    { to: '/pip/content', label: 'Content', icon: Film },
    { to: '/pip/calendar', label: 'Calendar', icon: Calendar },
    { to: '/pip/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/pip/achievements', label: 'Achievements', icon: Trophy },
  ];

  // Day dots: Mon=0 … Sun=6
  const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const todayIndex = (new Date().getDay() + 6) % 7;
  const filledDays = streak > 0 ? Math.min(streak, 7) : 0;

  const sidebarContent = (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="p-6 space-y-1 shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold font-serif">
            {'\u{1F916}'} Pip
          </h1>
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

      {/* Streak — day dots */}
      <div className="px-4 pb-4 shrink-0">
        <div className="text-xs text-white/40 mb-2">Writing streak</div>
        <div className="flex gap-1.5 mb-2">
          {DAYS.map((day, i) => {
            const isDone = i < filledDays;
            const isToday = i === todayIndex;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold
                    ${isDone ? 'bg-[#7C9B7A] text-white' : ''}
                    ${isToday && !isDone ? 'bg-[#E8843A] text-white animate-pulse' : ''}
                    ${!isDone && !isToday ? 'bg-white/[0.06] text-white/20' : ''}
                  `}
                />
                <span className="text-[9px] text-white/30">{day}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <span>🔥</span>
          <span className="font-bold text-white">{streak}</span>
          <span className="text-white/40 text-xs">day streak — don't break it!</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto min-h-0">
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} onClose={() => setSidebarOpen(false)} />
        ))}
      </nav>

      {/* XP Section — bottom of sidebar */}
      <div className="px-4 pt-4 pb-2 border-t border-white/5 shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#7C9B7A] text-xs font-bold text-white">
            {levelInfo.level}
          </div>
          <span className="text-xs font-semibold text-white">
            Level {levelInfo.level} · {levelInfo.name}
          </span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#7C9B7A] rounded-full transition-all duration-700"
            style={{ width: `${levelInfo.progress}%` }}
          />
        </div>
        <div className="text-xs text-white/40 mt-1.5">
          {levelInfo.xpToNextLevel > 0
            ? <>{levelInfo.xpToNextLevel.toLocaleString()} XP to <span className="text-purple-300">{levelInfo.nextLevelName}</span></>
            : <span className="text-[#7C9B7A]">Max level reached ✨</span>
          }
        </div>
      </div>

      {/* Logout */}
      <div className="px-4 pb-4 shrink-0">
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
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <aside
            className="relative w-[280px] h-full bg-brand-dark text-white flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main content — full width */}
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

        <div className="p-8 w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
