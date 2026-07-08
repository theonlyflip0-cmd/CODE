import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Autoplay tandır intro — NO scroll interaction.
 *
 * On load the intro is a fixed full-screen overlay: the 360° tandır video
 * autoplays (muted, playsinline) start to finish on its own. When it reaches
 * ~80% of its duration — while it's still finishing the spin — a fiery
 * EXPLOSION bursts from the centre of the screen, fills it completely, then
 * clears away to reveal the menu underneath. The overlay then unmounts.
 *
 * Everything is CSS + one canvas (the explosion). No scroll, no pointer, no
 * libraries. prefers-reduced-motion: skip the video motion + explosion and
 * just cross-fade a static poster straight into the menu.
 *
 * Expects `/tandir-360.mp4` in `public/`. The offline single-file demo injects
 * it as a data URI via `window.__TANDIR_DATA__`. If the video can't play
 * (missing / undecodable), a timer still fires the explosion so the menu is
 * always revealed, and a molten "ember disc" stands in visually.
 */

declare global {
  interface Window {
    __TANDIR_DATA__?: string;
  }
}

const VIDEO_SRC =
  (typeof window !== "undefined" && window.__TANDIR_DATA__) ||
  `${import.meta.env.BASE_URL}tandir-360.mp4`;
const POSTER_SRC = `${import.meta.env.BASE_URL}tandir-poster.jpg`;

const TRANSITION_AT = 0.8; // start exploding at 80% of the video
const EXPLOSION_MS = 1500;
const FALLBACK_MS = 3200; // fire the explosion anyway if the video never plays

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const easeOut = (n: number) => 1 - Math.pow(1 - n, 3);

export function CinematicIntro() {
  const [done, setDone] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Detect reduced motion up front.
  useEffect(() => {
    setReducedMotion(
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    );
  }, []);

  // Lock scrolling while the intro plays; always restore on unmount.
  useEffect(() => {
    if (done) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    window.scrollTo(0, 0);
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, [done]);

  // Main driver: autoplay → detect 80% → explode → reveal.
  useEffect(() => {
    if (done) return;

    let raf = 0;
    let fallback = 0;
    let exploded = false;

    function finish() {
      document.documentElement.style.overflow = "";
      setDone(true);
    }

    // ── Reduced motion: just cross-fade the static poster into the menu ────
    if (reducedMotion) {
      const t = window.setTimeout(() => {
        if (rootRef.current) {
          rootRef.current.style.transition = "opacity 700ms ease";
          rootRef.current.style.opacity = "0";
        }
      }, 600);
      const d = window.setTimeout(finish, 1400);
      return () => {
        window.clearTimeout(t);
        window.clearTimeout(d);
      };
    }

    // ── The explosion ──────────────────────────────────────────────────────
    function explode() {
      if (exploded) return;
      exploded = true;
      window.clearTimeout(fallback);

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      let w = 0;
      let h = 0;

      // Pre-render one warm glow sprite for the flying embers.
      const sprite = document.createElement("canvas");
      {
        const R = 32;
        sprite.width = sprite.height = R * 2;
        const c = sprite.getContext("2d")!;
        const g = c.createRadialGradient(R, R, 0, R, R, R);
        g.addColorStop(0, "rgba(255,244,214,1)");
        g.addColorStop(0.3, "rgba(255,170,60,0.85)");
        g.addColorStop(1, "rgba(150,30,6,0)");
        c.fillStyle = g;
        c.fillRect(0, 0, R * 2, R * 2);
      }

      interface P {
        x: number;
        y: number;
        vx: number;
        vy: number;
        size: number;
      }
      const parts: P[] = [];

      function size() {
        if (!canvas) return;
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      size();

      const cx = w / 2;
      const cy = h / 2;
      const maxR = Math.hypot(w, h) / 2;
      const N = Math.round(clamp01(Math.min(w, h) / 900) * 70) + 90; // ~90–160
      for (let i = 0; i < N; i++) {
        const a = Math.random() * Math.PI * 2;
        const spd = 6 + Math.random() * (maxR / 26);
        parts.push({
          x: cx,
          y: cy,
          vx: Math.cos(a) * spd,
          vy: Math.sin(a) * spd,
          size: 4 + Math.random() * 10,
        });
      }

      const start = performance.now();

      function frame(now: number) {
        const e = clamp01((now - start) / EXPLOSION_MS);

        // Reveal the menu: fade the hero (black + video) out fast.
        if (heroRef.current) {
          heroRef.current.style.opacity = String(1 - clamp01(e / 0.35));
        }

        if (ctx) {
          ctx.clearRect(0, 0, w, h);

          // Central flash: expands to fill the screen, then fades out.
          const fr = easeOut(clamp01(e / 0.28)) * maxR * 1.15;
          const fa = e < 0.28 ? 1 : Math.max(0, 1 - (e - 0.28) / 0.72);
          if (fa > 0.001 && fr > 1) {
            const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, fr);
            g.addColorStop(0, `rgba(255,250,235,${fa})`);
            g.addColorStop(0.28, `rgba(255,196,96,${fa})`);
            g.addColorStop(0.6, `rgba(255,96,28,${fa * 0.9})`);
            g.addColorStop(1, "rgba(90,18,4,0)");
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, w, h);
          }

          // Flying embers.
          ctx.globalCompositeOperation = "lighter";
          const pa = Math.max(0, 1 - clamp01((e - 0.15) / 0.85));
          for (const p of parts) {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05;
            p.vx *= 0.99;
            const r = p.size * (1 + e * 1.5);
            ctx.globalAlpha = pa;
            ctx.drawImage(sprite, p.x - r, p.y - r, r * 2, r * 2);
          }
          ctx.globalAlpha = 1;
          ctx.globalCompositeOperation = "source-over";
        }

        if (e >= 1) {
          finish();
          return;
        }
        raf = requestAnimationFrame(frame);
      }
      raf = requestAnimationFrame(frame);
    }

    // Autoplay the video and watch for the 80% mark.
    const v = videoRef.current;
    function onTime() {
      if (!v || !Number.isFinite(v.duration) || v.duration <= 0) return;
      if (v.currentTime / v.duration >= TRANSITION_AT) explode();
    }
    if (v) {
      v.muted = true;
      v.addEventListener("timeupdate", onTime);
      v.addEventListener("ended", explode);
      v.play().catch(() => {
        /* autoplay blocked / codec issue — the fallback timer covers us */
      });
    }
    // Safety net: if the video never reaches 80% (blocked, undecodable…),
    // explode anyway so the menu is always revealed with no input required.
    fallback = window.setTimeout(explode, FALLBACK_MS);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(fallback);
      if (v) {
        v.removeEventListener("timeupdate", onTime);
        v.removeEventListener("ended", explode);
      }
    };
  }, [reducedMotion, done]);

  if (done) return null;

  return (
    <div
      ref={rootRef}
      aria-label="Kral Durum tandır intro"
      className="fixed inset-0 z-[60] overflow-hidden"
    >
      {/* Hero layer (black + video + tagline) — fades out during the blast */}
      <div ref={heroRef} className="absolute inset-0 bg-black">
        <FireGlow />

        <div className="absolute inset-0 flex items-center justify-center">
          {!reducedMotion ? (
            <video
              ref={videoRef}
              src={VIDEO_SRC}
              poster={POSTER_SRC}
              autoPlay
              muted
              playsInline
              preload="auto"
              onLoadedMetadata={() => setVideoReady(true)}
              onError={() => setVideoReady(false)}
              className={cn(
                "max-h-[85vh] max-w-[92vw] object-contain",
                !videoReady && "hidden",
              )}
              aria-hidden
            />
          ) : (
            <img
              src={POSTER_SRC}
              alt=""
              className="max-h-[85vh] max-w-[92vw] object-contain"
              aria-hidden
            />
          )}

          {/* Molten stand-in until/unless the video paints */}
          {!reducedMotion && !videoReady && (
            <div
              className="pointer-events-none aspect-square w-[60vh] max-w-[82vw] rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 50% 42%, #ffb347 0%, #ff6a20 22%, #b73513 45%, #3a1005 74%, #000 100%)",
                boxShadow:
                  "0 0 60px 10px rgba(255,120,40,0.35), inset 0 0 60px rgba(0,0,0,0.55)",
                filter: "blur(0.5px)",
              }}
              aria-hidden
            />
          )}
        </div>

        {/* Tagline */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <p
            className="mb-4 text-[11px] font-semibold uppercase tracking-[0.35em] text-royal-red"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}
          >
            Kral Durum · To Go
          </p>
          <h1
            className="max-w-4xl font-serif text-4xl leading-tight text-white sm:text-6xl md:text-7xl"
            style={{ textShadow: "0 2px 24px rgba(0,0,0,0.75)" }}
          >
            <span className="italic">Traditie</span> uit de{" "}
            <span className="italic text-royal-gold">tandır</span>,<br />
            vers van het <span className="italic text-royal-gold">vuur</span>.
          </h1>
        </div>
      </div>

      {/* Explosion canvas — draws only during the blast, above the hero layer */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden
      />
    </div>
  );
}

function FireGlow() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          "radial-gradient(ellipse at 50% 62%, rgba(255,140,50,0.28), transparent 55%), radial-gradient(circle at 50% 100%, rgba(255,77,31,0.35), transparent 60%)",
      }}
      aria-hidden
    />
  );
}
