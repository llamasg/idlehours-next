import { Link } from "react-router-dom";

const exploreLinks = [
  { label: "Game Library", to: "/games" },
  { label: "Guides", to: "/blog" },
  { label: "Quizzes", to: "/quizzes" },
  { label: "Cosy Corner", to: "/shop" },
  { label: "About", to: "/about" },
];

const legalLinks = [
  { label: "Privacy", to: "/privacy" },
  { label: "Disclosure", to: "/disclosure" },
  { label: "Contact", to: "/contact" },
];

const Footer = () => {
  return (
    <footer className="w-full bg-brand-dark">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        {/* 3-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Column 1 — Brand */}
          <div>
            <span className="text-2xl text-white font-bold">idle hours</span>
            <p className="text-white/60 mt-2 text-sm">
              Games worth your idle hours.
            </p>
            <p className="text-white/40 mt-4 text-xs">
              🎵 Music playing: ambient game OSTs
            </p>
          </div>

          {/* Column 2 — Explore */}
          <div>
            <h3 className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-4">
              Explore
            </h3>
            {exploreLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-white/70 text-sm hover:text-white transition-colors block mb-2"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Column 3 — Legal */}
          <div>
            <h3 className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-4">
              Legal
            </h3>
            {legalLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-white/70 text-sm hover:text-white transition-colors block mb-2"
              >
                {link.label}
              </Link>
            ))}
            <p className="text-white/30 text-xs mt-6">Made with 🌿 in the UK</p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-12 pt-6">
          <p className="text-white/30 text-xs text-center">
            © 2026 Idle Hours. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
