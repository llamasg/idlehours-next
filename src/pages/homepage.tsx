import ColorBends from '@/components/ColorBends';

export default function HomePage() {
  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      {/* Background - positioned absolutely to cover entire area */}
      <div className="absolute inset-0">
        <ColorBends />
      </div>
      
      {/* Content on top */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <h1 className="text-6xl text-white">Hello</h1>
      </div>
    </div>
  );
}