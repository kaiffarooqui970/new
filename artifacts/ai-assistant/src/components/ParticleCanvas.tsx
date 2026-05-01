import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  alphaDir: number;
  hue: number;
  saturation: number;
  lightness: number;
}

function createParticle(width: number, height: number): Particle {
  const isPurple = Math.random() < 0.5;
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
    radius: Math.random() * 1.8 + 0.6,
    alpha: Math.random() * 0.5 + 0.1,
    alphaDir: Math.random() < 0.5 ? 1 : -1,
    hue: isPurple ? 275 + (Math.random() - 0.5) * 20 : 185 + (Math.random() - 0.5) * 15,
    saturation: isPurple ? 75 + Math.random() * 15 : 85 + Math.random() * 10,
    lightness: isPurple ? 60 + Math.random() * 15 : 55 + Math.random() * 15,
  };
}

const PARTICLE_COUNT = 90;
const ALPHA_SPEED = 0.003;
const ALPHA_MIN = 0.05;
const ALPHA_MAX = 0.65;

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const init = () => {
      resize();
      particles = Array.from({ length: PARTICLE_COUNT }, () =>
        createParticle(canvas.width, canvas.height)
      );
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -10) p.x = canvas.width + 10;
        else if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        else if (p.y > canvas.height + 10) p.y = -10;

        p.alpha += ALPHA_SPEED * p.alphaDir;
        if (p.alpha >= ALPHA_MAX) { p.alpha = ALPHA_MAX; p.alphaDir = -1; }
        else if (p.alpha <= ALPHA_MIN) { p.alpha = ALPHA_MIN; p.alphaDir = 1; }

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3.5);
        gradient.addColorStop(0, `hsla(${p.hue}, ${p.saturation}%, ${p.lightness}%, ${p.alpha})`);
        gradient.addColorStop(0.5, `hsla(${p.hue}, ${p.saturation}%, ${p.lightness}%, ${p.alpha * 0.35})`);
        gradient.addColorStop(1, `hsla(${p.hue}, ${p.saturation}%, ${p.lightness}%, 0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    const onResize = () => {
      resize();
      particles = Array.from({ length: PARTICLE_COUNT }, () =>
        createParticle(canvas.width, canvas.height)
      );
    };

    init();
    draw();

    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
