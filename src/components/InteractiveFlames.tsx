import { useEffect, useRef } from "react";

/**
 * Interactive flame layer for the black hero background. Ambient flames rise
 * from the bottom; the cursor acts as a torch / heat source — it spawns a
 * plume of fire that follows the pointer and stirs (pushes up + brightens)
 * nearby ambient embers. A click sends out a small flare.
 *
 * Drawn additively *inside* the canvas (globalCompositeOperation "lighter")
 * on a transparent background, so over the black hero it reads like glowing
 * fire and softly over the tandır — without a CSS blend mode (those force a
 * full-viewport backdrop composite every frame, which measurably hurt scroll).
 *
 * PERFORMANCE (kept in mind after the smoothness pass):
 * • Pre-rendered radial-gradient sprites drawn with drawImage (no per-frame
 *   shadowBlur), additive blend, dpr capped at 1.5.
 * • The rAF loop pauses via IntersectionObserver when off-screen.
 * • prefers-reduced-motion: a single static glow, no animation, no pointer.
 */
export function InteractiveFlames({ density = 52 }: { density?: number } = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Decorative layer → cap dpr low; the glow hides any softness.
    const dpr = Math.min(1.25, window.devicePixelRatio || 1);
    let w = 0;
    let h = 0;

    function makeSprite(stops: [number, string][]): HTMLCanvasElement {
      const s = document.createElement("canvas");
      const R = 32;
      s.width = s.height = R * 2;
      const c = s.getContext("2d")!;
      const g = c.createRadialGradient(R, R, 0, R, R, R);
      for (const [o, col] of stops) g.addColorStop(o, col);
      c.fillStyle = g;
      c.fillRect(0, 0, R * 2, R * 2);
      return s;
    }
    // Flame: white-hot core → amber → deep red → transparent.
    const flameSprite = makeSprite([
      [0, "rgba(255,244,214,1)"],
      [0.22, "rgba(255,178,64,0.9)"],
      [0.5, "rgba(255,86,26,0.5)"],
      [1, "rgba(120,20,5,0)"],
    ]);
    // Ember: softer orange glow.
    const emberSprite = makeSprite([
      [0, "rgba(255,170,70,0.95)"],
      [0.4, "rgba(255,90,25,0.45)"],
      [1, "rgba(110,18,4,0)"],
    ]);

    const reduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    function resize() {
      w = canvas!.clientWidth;
      h = canvas!.clientHeight;
      canvas!.width = Math.max(1, Math.floor(w * dpr));
      canvas!.height = Math.max(1, Math.floor(h * dpr));
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // ── Reduced motion: one static warm glow, then bail. ────────────────────
    if (reduced) {
      resize();
      ctx.globalCompositeOperation = "lighter";
      const g = ctx.createRadialGradient(w / 2, h, 0, w / 2, h, h * 0.9);
      g.addColorStop(0, "rgba(255,110,40,0.28)");
      g.addColorStop(0.5, "rgba(200,60,20,0.12)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      const ro = new ResizeObserver(() => {
        resize();
        ctx!.globalCompositeOperation = "lighter";
        const gg = ctx!.createRadialGradient(w / 2, h, 0, w / 2, h, h * 0.9);
        gg.addColorStop(0, "rgba(255,110,40,0.28)");
        gg.addColorStop(0.5, "rgba(200,60,20,0.12)");
        gg.addColorStop(1, "rgba(0,0,0,0)");
        ctx!.fillStyle = gg;
        ctx!.fillRect(0, 0, w, h);
      });
      ro.observe(canvas);
      return () => ro.disconnect();
    }

    interface P {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      life: number;
      maxLife: number;
      heat: number; // 0..1 brightness boost
      flame: boolean; // torch particle vs ambient ember
    }

    const parts: P[] = [];
    const pointer = { x: -9999, y: -9999, px: -9999, py: -9999, active: false, speed: 0 };

    function ambient(seedAcross = false): P {
      return {
        x: Math.random() * w,
        y: seedAcross ? Math.random() * h : h + Math.random() * 40,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -(0.3 + Math.random() * 0.8),
        size: 2 + Math.random() * 4,
        life: 0,
        maxLife: 260 + Math.random() * 320,
        heat: 0,
        flame: false,
      };
    }

    function torch(x: number, y: number, spread = 6): P {
      return {
        x: x + (Math.random() - 0.5) * spread,
        y: y + (Math.random() - 0.5) * spread,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -(0.8 + Math.random() * 1.6),
        size: 5 + Math.random() * 9,
        life: 0,
        maxLife: 34 + Math.random() * 40,
        heat: 1,
        flame: true,
      };
    }

    resize();
    for (let i = 0; i < density; i++) parts.push(ambient(true));

    let running = false;
    let rafId = 0;
    let t = 0;

    const MAX = density + 180;
    const R = 175;
    const R2 = R * R;

    function frame() {
      if (!running) return;
      t += 0.016;

      pointer.speed = Math.hypot(pointer.x - pointer.px, pointer.y - pointer.py);
      pointer.px = pointer.x;
      pointer.py = pointer.y;

      // Torch plume: spawn fire at the cursor (more when moving fast).
      if (pointer.active) {
        const n = 1 + Math.min(4, Math.floor(pointer.speed / 7));
        for (let i = 0; i < n; i++) parts.push(torch(pointer.x, pointer.y));
        if (parts.length > MAX) parts.splice(0, parts.length - MAX);
      }

      ctx!.clearRect(0, 0, w, h);
      ctx!.globalCompositeOperation = "lighter";

      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life++;

        // Cursor heat: push away + upward and brighten within radius.
        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < R2) {
            const d = Math.sqrt(d2) || 1;
            const f = (1 - d / R) * 0.6;
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f - f * 0.8; // bias upward
            p.heat = Math.min(1, p.heat + f * 0.5);
          }
        }

        // Buoyancy + drag + gentle sway.
        p.vy -= 0.008;
        p.vx += Math.sin(t * 2 + p.y * 0.01) * 0.02;
        p.vx *= 0.96;
        p.vy *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.heat *= 0.94;

        const dead = p.life > p.maxLife || p.y < -40;
        if (dead) {
          if (p.flame) {
            parts.splice(i, 1);
          } else {
            Object.assign(p, ambient(false));
          }
          continue;
        }

        // Alpha: fade near top + across life; flames fade fast.
        const lifeF = 1 - p.life / p.maxLife;
        const topF = p.flame ? 1 : Math.min(1, p.y / (h * 0.85));
        const alpha = Math.max(0, lifeF * topF * (p.flame ? 0.9 : 0.7));
        if (alpha <= 0.01) continue;

        const sprite = p.flame ? flameSprite : emberSprite;
        const r = p.size * (2.4 + p.heat * 1.6);
        ctx!.globalAlpha = Math.min(1, alpha * (0.7 + p.heat * 0.6));
        ctx!.drawImage(sprite, p.x - r, p.y - r, r * 2, r * 2);
      }

      ctx!.globalAlpha = 1;
      ctx!.globalCompositeOperation = "source-over";
      rafId = requestAnimationFrame(frame);
    }

    function start() {
      if (running) return;
      running = true;
      rafId = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(rafId);
    }

    // Pointer tracking (window-level so it works over the whole hero even
    // though the canvas is pointer-events-none).
    let rect = canvas.getBoundingClientRect();
    function refreshRect() {
      rect = canvas!.getBoundingClientRect();
    }
    function onMove(e: PointerEvent) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Only "active" while the pointer is actually over the hero canvas.
      pointer.active = x >= 0 && y >= 0 && x <= w && y <= h;
      pointer.x = x;
      pointer.y = y;
    }
    function onDown(e: PointerEvent) {
      refreshRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < 0 || y < 0 || x > w || y > h) return;
      for (let i = 0; i < 18; i++) {
        const p = torch(x, y, 4);
        const a = (i / 18) * Math.PI * 2;
        p.vx = Math.cos(a) * (1.5 + Math.random());
        p.vy = Math.sin(a) * (1.5 + Math.random()) - 1;
        parts.push(p);
      }
      if (parts.length > MAX) parts.splice(0, parts.length - MAX);
    }
    function onLeave() {
      pointer.active = false;
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    window.addEventListener("scroll", refreshRect, { passive: true });

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) (e.isIntersecting ? start() : stop());
    });
    io.observe(canvas);

    const ro = new ResizeObserver(() => {
      resize();
      refreshRect();
    });
    ro.observe(canvas);

    start();

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("scroll", refreshRect);
    };
  }, [density]);

  return (
    // No CSS blend mode: the canvas draws its embers additively *internally*
    // (globalCompositeOperation "lighter") on a transparent background, so
    // over the black hero it reads exactly like screen-blended fire — but it
    // composites as a plain source-over layer, which is far cheaper (no
    // full-viewport backdrop blend every frame).
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-[5] h-full w-full"
      aria-hidden
    />
  );
}
