import { useEffect, useRef, useState } from 'react';
import { useMouse } from 'react-use';

export default function PortfolioHero() {
  const ref = useRef<HTMLDivElement>(null);
  const { docX, docY } = useMouse(ref as React.RefObject<Element>);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [echoes, setEchoes] = useState<{ id: number; x: number; y: number }[]>([]);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [lastEchoTime, setLastEchoTime] = useState(0);

  // Smooth cursor follow
  useEffect(() => {
    const animate = () => {
      setCursorPos(prev => ({
        x: prev.x + (docX - prev.x) * 0.15,
        y: prev.y + (docY - prev.y) * 0.15,
      }));
      requestAnimationFrame(animate);
    };
    animate();
  }, [docX, docY]);

  // Create echoes on fast movement
  useEffect(() => {
    const speed = Math.sqrt(
      Math.pow(docX - lastMousePos.x, 2) + Math.pow(docY - lastMousePos.y, 2)
    );
    const currentTime = Date.now();

    if (speed > 10 && currentTime - lastEchoTime > 100) {
      const newEcho = { id: Date.now(), x: docX, y: docY };
      setEchoes(prev => [...prev, newEcho]);
      setLastEchoTime(currentTime);

      setTimeout(() => {
        setEchoes(prev => prev.filter(echo => echo.id !== newEcho.id));
      }, 600);
    }

    setLastMousePos({ x: docX, y: docY });
  }, [docX, docY]);

  const parallaxX = (docX / window.innerWidth - 0.5) * 20;
  const parallaxY = (docY / window.innerHeight - 0.5) * 20;

  const isOverElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return docX > rect.left && docX < rect.right && docY > rect.top && docY < rect.bottom;
  };

  return (
    <div ref={ref} className="relative w-screen h-screen overflow-hidden bg-white cursor-none">
      {/* Grid Background */}
      <div
        className="absolute inset-0 opacity-50 transition-transform duration-300"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          transform: `translate(${-parallaxX * 0.3}px, ${-parallaxY * 0.3}px)`,
        }}
      />

      {/* Base Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-300"
        style={{
          backgroundImage: "url('https://picsum.photos/id/64/1200/1600')",
          transform: `translate(${parallaxX}px, ${parallaxY}px) scale(1.05)`,
        }}
      />

      {/* Reveal Image (with cursor spotlight) */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-300"
        style={{
          backgroundImage: "url('https://picsum.photos/id/91/1200/1600')",
          clipPath: `circle(100px at ${cursorPos.x}px ${cursorPos.y}px)`,
          transform: `translate(${parallaxX}px, ${parallaxY}px) scale(1.05)`,
        }}
      />

      {/* Name (Top Left) */}
      <div
        id="name"
        className={`fixed top-10 left-10 z-10 font-serif text-5xl font-semibold uppercase tracking-wider leading-tight transition-all duration-300 ${
          isOverElement('name') ? 'text-white' : 'text-black'
        }`}
        style={{
          fontFamily: "'Playfair Display', serif",
          transform: `translate(${parallaxX * 0.5}px, ${parallaxY * 0.5}px)`,
        }}
      >
        <span className="block">ALFIE</span>
        <span className="block">EYDEN</span>
      </div>

      {/* F1 Records Link (Top Right) */}
      <a
        id="navLink"
        href="#records"
        className={`fixed top-10 right-10 z-10 text-sm font-light tracking-widest uppercase transition-all duration-300 hover:opacity-70 ${
          isOverElement('navLink') ? 'text-white' : 'text-black'
        }`}
        style={{
          transform: `translate(${-parallaxX * 0.5}px, ${parallaxY * 0.5}px)`,
        }}
      >
        F1 Records
      </a>

      {/* Social Links (Bottom Right) */}
      <div
        className="fixed bottom-10 right-10 z-10 flex gap-5 transition-transform duration-300"
        style={{
          transform: `translate(${-parallaxX * 0.5}px, ${-parallaxY * 0.5}px)`,
        }}
      >
        <a
          id="instagram"
          href="https://instagram.com"
          target="_blank"
          rel="noopener"
          className="w-6 h-6 transition-all duration-300 hover:opacity-70 hover:scale-110"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={`w-full h-full transition-all duration-300 ${
              isOverElement('instagram') ? 'fill-white' : 'fill-black'
            }`}
          >
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        </a>

        <a
          id="twitter"
          href="https://twitter.com"
          target="_blank"
          rel="noopener"
          className="w-6 h-6 transition-all duration-300 hover:opacity-70 hover:scale-110"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={`w-full h-full transition-all duration-300 ${
              isOverElement('twitter') ? 'fill-white' : 'fill-black'
            }`}
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
      </div>

      {/* Custom Cursor */}
      <div
        className="fixed w-[200px] h-[200px] border-2 border-white/60 rounded-full pointer-events-none z-50 transition-transform duration-150"
        style={{
          left: cursorPos.x - 100,
          top: cursorPos.y - 100,
          mixBlendMode: 'difference',
        }}
      />

      {/* Cursor Echoes */}
      {echoes.map(echo => (
        <div
          key={echo.id}
          className="fixed w-[200px] h-[200px] border-2 border-white/30 rounded-full pointer-events-none z-40 animate-echo"
          style={{
            left: echo.x - 100,
            top: echo.y - 100,
          }}
        />
      ))}
    </div>
  );
}
