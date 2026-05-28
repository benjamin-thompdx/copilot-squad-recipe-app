import { useEffect, useRef } from 'react';

const PIXEL = 3; // CSS pixels per "pixel" cell

// Pixel art food sprites — 7 cols × 7 rows, 1 = filled
const SPRITES: number[][][] = [
  // Fork
  [
    [0, 0, 1, 0, 1, 0, 0],
    [0, 0, 1, 0, 1, 0, 0],
    [0, 0, 1, 0, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
  ],
  // Heart
  [
    [0, 1, 1, 0, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
  ],
  // Star
  [
    [0, 0, 0, 1, 0, 0, 0],
    [0, 1, 0, 1, 0, 1, 0],
    [1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 0],
    [1, 0, 1, 0, 1, 0, 1],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
  ],
  // Pot
  [
    [0, 1, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 1, 0],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [0, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0],
  ],
  // Leaf
  [
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0],
  ],
  // Carrot
  [
    [0, 1, 1, 0, 0, 0, 0],
    [0, 1, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
  ],
  // Diamond
  [
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
  ],
  // Mushroom
  [
    [0, 0, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 0],
    [1, 1, 0, 1, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [0, 0, 1, 0, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
  ],
];

const COLORS = [
  '#e05c5c', // tomato
  '#e09a3c', // carrot
  '#c4a820', // lemon
  '#5a9e52', // herb
  '#5a78c8', // blueberry
  '#c45a8c', // raspberry
  '#c4683a', // terracotta
  '#8c7ae0', // lavender
  '#3aad8c', // mint
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  sprite: number[][];
  color: string;
  alpha: number;
  targetAlpha: number;
  wobbleOffset: number;
  wobbleSpeed: number;
  wobbleAmp: number;
  scale: number;
  age: number;
  maxAge: number;
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function spawnParticle(canvas: HTMLCanvasElement, atBottom = false): Particle {
  const ta = rand(0.1, 0.28);
  return {
    x: rand(0, canvas.width),
    y: atBottom ? canvas.height + rand(10, 40) : rand(0, canvas.height),
    vx: rand(-0.2, 0.2),
    vy: -rand(0.25, 0.55),
    sprite: SPRITES[Math.floor(Math.random() * SPRITES.length)],
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    alpha: atBottom ? 0 : ta,
    targetAlpha: ta,
    wobbleOffset: rand(0, Math.PI * 2),
    wobbleSpeed: rand(0.008, 0.022),
    wobbleAmp: rand(0.4, 1.1),
    scale: rand(0.9, 2.2),
    age: 0,
    maxAge: rand(500, 900),
  };
}

function drawSprite(ctx: CanvasRenderingContext2D, p: Particle) {
  const ps = PIXEL * p.scale;
  const rows = p.sprite.length;
  const cols = p.sprite[0].length;
  const ox = -((cols * ps) / 2);
  const oy = -((rows * ps) / 2);

  ctx.globalAlpha = p.alpha;
  ctx.fillStyle = p.color;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (p.sprite[r][c]) {
        ctx.fillRect(
          Math.round(ox + c * ps),
          Math.round(oy + r * ps),
          Math.ceil(ps),
          Math.ceil(ps),
        );
      }
    }
  }
  ctx.globalAlpha = 1;
}

export function PixelBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    const COUNT = 40;
    const particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    for (let i = 0; i < COUNT; i++) {
      particles.push(spawnParticle(canvas, false));
    }

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const { x: mx, y: my } = mouseRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.age++;

        // Drift + wobble
        p.x +=
          p.vx +
          Math.sin(p.age * p.wobbleSpeed + p.wobbleOffset) * p.wobbleAmp * 0.08;
        p.y += p.vy;

        // Mouse repulsion
        const dx = p.x - mx;
        const dy = p.y - my;
        const d2 = dx * dx + dy * dy;
        const REPEL = 130;
        if (d2 < REPEL * REPEL && d2 > 0) {
          const d = Math.sqrt(d2);
          const f = (1 - d / REPEL) * 3;
          p.x += (dx / d) * f;
          p.y += (dy / d) * f;
        }

        // Fade in on spawn
        if (p.alpha < p.targetAlpha) {
          p.alpha = Math.min(p.alpha + 0.004, p.targetAlpha);
        }

        // Fade out near end of life
        const fadeWindow = 80;
        if (p.age > p.maxAge - fadeWindow) {
          p.alpha -= p.targetAlpha / fadeWindow;
        }

        // Respawn
        if (
          p.age > p.maxAge ||
          p.y < -60 ||
          p.x < -60 ||
          p.x > canvas.width + 60
        ) {
          particles[i] = spawnParticle(canvas, true);
        } else {
          ctx.save();
          ctx.translate(p.x, p.y);
          drawSprite(ctx, p);
          ctx.restore();
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onTouch = (e: TouchEvent) => {
      if (e.touches[0]) {
        mouseRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    };
    const onLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onTouch, { passive: true });
    document.addEventListener('mouseleave', onLeave);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onTouch);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
      aria-hidden='true'
    />
  );
}

export default PixelBackground;
