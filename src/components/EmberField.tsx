import { useEffect, useRef } from "react";

/**
 * Lightweight canvas particle system: ~60 glowing ember shards drifting
 * upward with a small horizontal sway, fading near the top.
 *
 * PERFORMANCE:
 * • The canvas is a sticky, viewport-sized layer inside its (tall) parent —
 *   NOT a canvas the size of the whole section, which would be enormous.
 * • Glows are pre-rendered radial-gradient sprites drawn with drawImage —
 *   roughly an order of magnitude cheaper than per-particle shadowBlur.
 * • Device-pixel ratio is capped at 1.5 for this decorative layer.
 * • The rAF loop pauses via IntersectionObserver when off-screen and the
 *   whole component is inert under prefers-reduced-motion.
 */
export function EmberField({ count = 60 }: { count?: number } = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (prefersReduced) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    let w = 0;
    let h = 0;

    // Pre-rendered glow sprites (one per ember colour).
    function makeSprite(rgb: string): HTMLCanvasElement {
      const s = document.createElement("canvas");
      const R = 24;
      s.width = s.height = R * 2;
      const c = s.getContext("2d")!;
      const g = c.createRadialGradient(R, R, 0, R, R, R);
      g.addColorStop(0, `rgba(${rgb},1)`);
      g.addColorStop(0.35, `rgba(${rgb},0.5)`);
      g.addColorStop(1, `rgba(${rgb},0)`);
      c.fillStyle = g;
      c.fillRect(0, 0, R * 2, R * 2);
      return s;
    }
    const sprites = [makeSprite("255,77,31"), makeSprite("255,179,71")]; // #ff4d1f, #ffb347

    interface Ember {
      x: number;
      y: number;
      vy: number;
      sway: number;
      swayOffset: number;
      size: number;
      sprite: number;
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
        sprite: Math.random() < 0.6 ? 0 : 1,
        life: 0,
        maxLife: 600 + Math.random() * 900,
      };
    }

    function resize() {
      // The canvas itself is the sticky, viewport-sized box.
      w = canvas!.clientWidth;
      h = canvas!.clientHeight;
      canvas!.width = Math.max(1, Math.floor(w * dpr));
      canvas!.height = Math.max(1, Math.floor(h * dpr));
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

        const r = e.size * 3; // sprite radius incl. glow halo
        ctx!.globalAlpha = alpha * 0.9;
        ctx!.drawImage(sprites[e.sprite], e.x - r, e.y - r, r * 2, r * 2);
      }

      ctx!.globalAlpha = 1;
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
    ro.observe(canvas);

    rafId = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      io.disconnect();
      ro.disconnect();
    };
  }, [count]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Sticky viewport-sized layer: embers ride along while the tall menu
          section scrolls past, at a fraction of the fill cost. */}
      <canvas ref={canvasRef} className="sticky top-0 block h-screen w-full" />
    </div>
  );
}
