// src/components/Navbar.tsx

import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 flex gap-6">
      <Link 
        to="/" 
        className={`transition-colors font-medium ${
          isActive('/') 
            ? 'text-white' 
            : 'text-white/70 hover:text-white'
        }`}
      >
        Home
      </Link>
      <Link 
        to="/blog" 
        className={`transition-colors font-medium ${
          location.pathname.startsWith('/blog')
            ? 'text-white' 
            : 'text-white/70 hover:text-white'
        }`}
      >
        Blog
      </Link>
    </nav>
  );
}