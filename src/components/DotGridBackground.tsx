import { useEffect, useRef } from 'react';

const DotGridBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
      drawDots();
    };

    const drawDots = () => {
      if (!ctx || !canvas) return;

      const width = window.innerWidth;
      const height = window.innerHeight;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      const spacing = 40; // Space between dots
      const maxDotSize = 2.5; // Maximum dot radius in pixels
      const dotColor = '#061C56'; // Navy blue

      // Draw grid of dots
      for (let x = spacing / 2; x < width; x += spacing) {
        for (let y = spacing / 2; y < height; y += spacing) {
          // Calculate gradient factor (0 to 1)
          // 0 = top-left corner, 1 = bottom-right corner
          const gradientX = x / width; // 0 (left) to 1 (right)
          const gradientY = y / height; // 0 (top) to 1 (bottom)

          // Combine: stronger in bottom-right (1,1) weaker in top-left (0,0)
          const gradientFactor = (gradientX + gradientY) / 2;

          // Calculate dot size based on gradient (size varies, not opacity)
          const dotSize = maxDotSize * gradientFactor;

          // Only draw dots that are visible (> 0.2px)
          if (dotSize > 0.2) {
            ctx.fillStyle = dotColor;
            ctx.beginPath();
            ctx.arc(x, y, dotSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    };

    updateSize();

    const handleResize = () => {
      updateSize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-background">
      <canvas ref={canvasRef} className="block" />
    </div>
  );
};

export default DotGridBackground;
