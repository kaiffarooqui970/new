import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  pullVx: number;
  pullVy: number;
  radius: number;
  alpha: number;
  alphaDir: number;
  hue: number;
  saturation: number;
  lightness: number;
}

function createParticle(width: number, height: number): Particle {
  const isPurple = Math.random() < 0.5;
  const baseVx = (Math.random() - 0.5) * 0.25;
  const baseVy = (Math.random() - 0.5) * 0.25;
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: baseVx,
    vy: baseVy,
    baseVx,
    baseVy,
    pullVx: 0,
    pullVy: 0,
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
const MOUSE_INFLUENCE_RADIUS = 220;
const MOUSE_ATTRACTION_STRENGTH = 0.022;
const MAX_PULL_SPEED = 0.7;
const PULL_DAMPING = 0.96;

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number | null = null;
    let particles: Particle[] = [];
    let mouseX = 0;
    let mouseY = 0;
    let mouseActive = false;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const renderStatic = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3.5);
        gradient.addColorStop(0, `hsla(${p.hue}, ${p.saturation}%, ${p.lightness}%, ${p.alpha})`);
        gradient.addColorStop(0.5, `hsla(${p.hue}, ${p.saturation}%, ${p.lightness}%, ${p.alpha * 0.35})`);
        gradient.addColorStop(1, `hsla(${p.hue}, ${p.saturation}%, ${p.lightness}%, 0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        if (mouseActive) {
          const dx = mouseX - p.x;
          const dy = mouseY - p.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < MOUSE_INFLUENCE_RADIUS * MOUSE_INFLUENCE_RADIUS && distSq > 0.0001) {
            const dist = Math.sqrt(distSq);
            const falloff = 1 - dist / MOUSE_INFLUENCE_RADIUS;
            const force = MOUSE_ATTRACTION_STRENGTH * falloff * falloff;
            p.pullVx += (dx / dist) * force;
            p.pullVy += (dy / dist) * force;
          }
        }

        const pullSpeedSq = p.pullVx * p.pullVx + p.pullVy * p.pullVy;
        if (pullSpeedSq > MAX_PULL_SPEED * MAX_PULL_SPEED) {
          const pullSpeed = Math.sqrt(pullSpeedSq);
          p.pullVx = (p.pullVx / pullSpeed) * MAX_PULL_SPEED;
          p.pullVy = (p.pullVy / pullSpeed) * MAX_PULL_SPEED;
        }

        p.pullVx *= PULL_DAMPING;
        p.pullVy *= PULL_DAMPING;

        p.vx = p.baseVx + p.pullVx;
        p.vy = p.baseVy + p.pullVy;

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

    const stopLoop = () => {
      if (animId !== null) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    };

    const seedParticles = () => {
      particles = Array.from({ length: PARTICLE_COUNT }, () =>
        createParticle(canvas.width, canvas.height)
      );
    };

    const start = () => {
      stopLoop();
      resize();
      seedParticles();
      if (motionQuery.matches) {
        renderStatic();
      } else {
        draw();
      }
    };

    const onResize = () => {
      resize();
      seedParticles();
      if (motionQuery.matches) {
        renderStatic();
      }
    };

    const onMotionChange = () => {
      stopLoop();
      if (motionQuery.matches) {
        renderStatic();
      } else {
        draw();
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (motionQuery.matches) return;
      mouseX = e.clientX;
      mouseY = e.clientY;
      mouseActive = true;
    };

    const onPointerLeave = (e: PointerEvent) => {
      if (e.relatedTarget === null) {
        mouseActive = false;
      }
    };

    const onWindowBlur = () => {
      mouseActive = false;
    };

    start();

    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("blur", onWindowBlur);
    motionQuery.addEventListener("change", onMotionChange);
    return () => {
      stopLoop();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("blur", onWindowBlur);
      motionQuery.removeEventListener("change", onMotionChange);
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
