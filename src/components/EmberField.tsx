import { useEffect, useRef } from "react";

/**
 * Lightweight canvas particle system: ~60 glowing ember shards drifting
 * upward with a small horizontal sway, fading near the top. Paints itself
 * absolutely inside its parent (which must be `position: relative`).
 *
 * • Paused via IntersectionObserver when off-screen.
 * • Disabled entirely under prefers-reduced-motion.
 * • DPR-aware and resizes with its parent (ResizeObserver).
 */
export function EmberField({ count = 60 }: { count?: number } = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (prefersReduced) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0;
    let h = 0;

    interface Ember {
      x: number;
      y: number;
      vy: number;
      sway: number;
      swayOffset: number;
      size: number;
      color: string;
      life: number;
      maxLife: number;
    }

    const embers: Ember[] = [];

    function spawn(seedYAcrossHeight = false): Ember {
      return {
        x: Math.random() * w,
        y: seedYAcrossHeight ? Math.random() * h : h + Math.random() * 60,
        vy: 0.25 + Math.random() * 0.85, // px per frame upward
        sway: 0.3 + Math.random() * 0.9,
        swayOffset: Math.random() * Math.PI * 2,
        size: 2 + Math.random() * 4,
        color: Math.random() < 0.6 ? "#ff4d1f" : "#ffb347",
        life: 0,
        maxLife: 600 + Math.random() * 900,
      };
    }

    function resize() {
      w = parent!.clientWidth;
      h = parent!.clientHeight;
      canvas!.width = Math.max(1, Math.floor(w * dpr));
      canvas!.height = Math.max(1, Math.floor(h * dpr));
      canvas!.style.width = w + "px";
      canvas!.style.height = h + "px";
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.scale(dpr, dpr);
    }

    function seed() {
      embers.length = 0;
      for (let i = 0; i < count; i++) {
        const e = spawn(true);
        e.life = Math.random() * e.maxLife;
        embers.push(e);
      }
    }

    resize();
    seed();

    let running = true;
    let rafId = 0;
    let t = 0;

    function frame() {
      t += 0.016;
      ctx!.clearRect(0, 0, w, h);
      ctx!.globalCompositeOperation = "lighter";

      for (let i = 0; i < embers.length; i++) {
        const e = embers[i];
        e.life += 1;
        e.y -= e.vy;
        e.x += Math.sin(t + e.swayOffset) * e.sway * 0.4;

        if (e.y < -30 || e.life > e.maxLife) {
          Object.assign(e, spawn(false));
          continue;
        }

        // Fade near top and at the end of life.
        const topFactor = Math.min(1, e.y / (h * 0.85));
        const lifeFactor = 1 - e.life / e.maxLife;
        const alpha = Math.max(0, topFactor * lifeFactor);
        if (alpha <= 0.01) continue;

        ctx!.beginPath();
        ctx!.fillStyle = e.color;
        ctx!.globalAlpha = alpha * 0.85;
        ctx!.shadowColor = e.color;
        ctx!.shadowBlur = 14;
        ctx!.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx!.fill();
      }

      ctx!.globalAlpha = 1;
      ctx!.shadowBlur = 0;
      ctx!.globalCompositeOperation = "source-over";

      if (running) rafId = requestAnimationFrame(frame);
    }

    // Pause when off-screen to keep this genuinely lightweight.
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting && !running) {
            running = true;
            rafId = requestAnimationFrame(frame);
          } else if (!en.isIntersecting) {
            running = false;
            cancelAnimationFrame(rafId);
          }
        }
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    const ro = new ResizeObserver(() => {
      resize();
      seed();
    });
    ro.observe(parent);

    rafId = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      io.disconnect();
      ro.disconnect();
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}
