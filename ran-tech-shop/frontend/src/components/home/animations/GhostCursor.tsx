import { useEffect, useRef } from 'react';

interface GhostCursorProps {
  trailLength?: number;
  inertia?: number;
  grainIntensity?: number;
  bloomStrength?: number;
  bloomRadius?: number;
  brightness?: number;
  color?: string;
}

const GhostCursor: React.FC<GhostCursorProps> = ({
  trailLength = 50,
  inertia = 0.5,
  grainIntensity = 0.05,
  bloomStrength = 0.1,
  bloomRadius = 1,
  brightness = 2,
  color = '#B19EEF'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailRef = useRef<{ x: number; y: number }[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 177, g: 158, b: 239 };
    };

    const rgb = hexToRgb(color);

    const animate = () => {
      ctx.fillStyle = `rgba(0, 0, 0, ${1 - inertia})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update trail
      trailRef.current.unshift({ ...mouseRef.current });
      if (trailRef.current.length > trailLength) {
        trailRef.current.pop();
      }

      // Draw trail
      trailRef.current.forEach((point, index) => {
        const progress = index / trailRef.current.length;
        const size = (1 - progress) * 20;
        const alpha = (1 - progress) * brightness;

        // Bloom effect
        if (bloomStrength > 0) {
          const gradient = ctx.createRadialGradient(
            point.x, point.y, 0,
            point.x, point.y, size * (1 + bloomRadius)
          );
          gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha * bloomStrength})`);
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(point.x, point.y, size * (1 + bloomRadius), 0, Math.PI * 2);
          ctx.fill();
        }

        // Main dot
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Grain effect
      if (grainIntensity > 0) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const noise = (Math.random() - 0.5) * grainIntensity * 255;
          data[i] += noise;
          data[i + 1] += noise;
          data[i + 2] += noise;
        }
        ctx.putImageData(imageData, 0, 0);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [trailLength, inertia, grainIntensity, bloomStrength, bloomRadius, brightness, color]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default GhostCursor;
