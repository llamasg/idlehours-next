import { useEffect, useRef } from 'react';
import './DotGrid.css';

const DotGridBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawDots();
    };

    const drawDots = () => {
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const spacing = 40; // Space between dots
      const maxSize = 3; // Maximum dot size
      const dotColor = '#061C56'; // Navy blue dots

      // Draw dots
      for (let x = 0; x < canvas.width; x += spacing) {
        for (let y = 0; y < canvas.height; y += spacing) {
          // Calculate gradient factor (0 to 1)
          // Bottom-right = 1 (full size), Top-left = 0 (invisible)
          const gradientX = x / canvas.width; // 0 (left) to 1 (right)
          const gradientY = y / canvas.height; // 0 (top) to 1 (bottom)

          // Combine both gradients (stronger in bottom-right)
          const gradientFactor = (gradientX + gradientY) / 2;

          // Calculate dot size based on gradient
          const dotSize = maxSize * gradientFactor;

          // Only draw if size is significant
          if (dotSize > 0.1) {
            ctx.fillStyle = dotColor;
            ctx.beginPath();
            ctx.arc(x, y, dotSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  return (
    <div className="dot-grid-background">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default DotGridBackground;
