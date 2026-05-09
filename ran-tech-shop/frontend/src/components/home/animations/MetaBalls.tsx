import { useRef, useEffect } from 'react';

interface MetaBallsProps {
  color?: string;
  cursorBallColor?: string;
  cursorBallSize?: number;
  ballCount?: number;
  animationSize?: number;
  enableMouseInteraction?: boolean;
  hoverSmoothness?: number;
  clumpFactor?: number;
  speed?: number;
}

const MetaBalls: React.FC<MetaBallsProps> = ({
  color = '#B19EEF',
  cursorBallColor = '#ffffff',
  cursorBallSize = 2,
  ballCount = 15,
  animationSize = 0.8,
  enableMouseInteraction = true,
  hoverSmoothness = 0.05,
  clumpFactor = 1,
  speed = 3
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const balls = useRef<{ x: number; y: number; vx: number; vy: number; radius: number }[]>([]);
  const mouse = useRef({ x: 0, y: 0 });
  const smoothMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initBalls();
    };

    const initBalls = () => {
      balls.current = Array.from({ length: ballCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        radius: 30 + Math.random() * 50 * animationSize
      }));
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    resize();
    window.addEventListener('resize', resize);
    if (enableMouseInteraction) {
      canvas.addEventListener('mousemove', handleMouseMove);
    }

    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '177, 158, 239';
    };

    const colorRgb = hexToRgb(color);
    const cursorRgb = hexToRgb(cursorBallColor);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Smooth mouse follow
      smoothMouse.current.x += (mouse.current.x - smoothMouse.current.x) * hoverSmoothness;
      smoothMouse.current.y += (mouse.current.y - smoothMouse.current.y) * hoverSmoothness;

      // Update ball positions
      balls.current.forEach(ball => {
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Bounce off walls
        if (ball.x < 0 || ball.x > canvas.width) ball.vx *= -1;
        if (ball.y < 0 || ball.y > canvas.height) ball.vy *= -1;

        // Clumping effect
        if (clumpFactor > 0) {
          balls.current.forEach(other => {
            if (ball === other) return;
            const dx = other.x - ball.x;
            const dy = other.y - ball.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 200) {
              ball.vx += (dx / dist) * clumpFactor * 0.01;
              ball.vy += (dy / dist) * clumpFactor * 0.01;
            }
          });
        }

        // Limit velocity
        const maxSpeed = speed * 2;
        const currentSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
        if (currentSpeed > maxSpeed) {
          ball.vx = (ball.vx / currentSpeed) * maxSpeed;
          ball.vy = (ball.vy / currentSpeed) * maxSpeed;
        }
      });

      // Draw metaballs using a radial gradient approach
      balls.current.forEach(ball => {
        const gradient = ctx.createRadialGradient(
          ball.x, ball.y, 0,
          ball.x, ball.y, ball.radius
        );
        gradient.addColorStop(0, `rgba(${colorRgb}, 0.8)`);
        gradient.addColorStop(0.5, `rgba(${colorRgb}, 0.4)`);
        gradient.addColorStop(1, `rgba(${colorRgb}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw cursor ball
      if (enableMouseInteraction) {
        const cursorGradient = ctx.createRadialGradient(
          smoothMouse.current.x, smoothMouse.current.y, 0,
          smoothMouse.current.x, smoothMouse.current.y, cursorBallSize * 30
        );
        cursorGradient.addColorStop(0, `rgba(${cursorRgb}, 0.9)`);
        cursorGradient.addColorStop(0.5, `rgba(${cursorRgb}, 0.4)`);
        cursorGradient.addColorStop(1, `rgba(${cursorRgb}, 0)`);
        
        ctx.fillStyle = cursorGradient;
        ctx.beginPath();
        ctx.arc(smoothMouse.current.x, smoothMouse.current.y, cursorBallSize * 30, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (enableMouseInteraction) {
        canvas.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [color, cursorBallColor, cursorBallSize, ballCount, animationSize, enableMouseInteraction, hoverSmoothness, clumpFactor, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ filter: 'blur(40px) contrast(20)' }}
    />
  );
};

export default MetaBalls;
