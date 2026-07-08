import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Full-viewport pinned scroll hero, in three acts:
 *
 * 1. SPIN (0–55%): scroll scrubs the 360° tandır video via currentTime with
 *    rAF + lerp smoothing while restaurant story panels pass by in 3D.
 * 2. DIVE (55–92%): the whole page flies INTO the oven mouth — the video
 *    scales 1→9 around the mouth's position (60% 51% in the final frame),
 *    which fills the screen with fire; a fire-flash overlay ramps in.
 * 3. LANDING (86–100%): the flash settles into the menu section's dark
 *    charcoal (#0d0a08) so the unpin hands off seamlessly — the menu
 *    "appears out of the fire".
 *
 * PERFORMANCE: all scroll-driven styling is written straight to the DOM
 * inside a single rAF loop — React does NOT re-render during scrolling.
 * The loop pauses entirely (IntersectionObserver) when the section is
 * off-screen, and skips DOM writes when progress hasn't changed. The video
 * asset is encoded all-intra (`ffmpeg -g 1`) so currentTime seeks decode
 * exactly one frame.
 *
 * Section is 300vh tall (200vh on mobile) with a sticky child.
 * prefers-reduced-motion: a static stacked story list, no scrub, no dive.
 *
 * Expects `/tandir-360.mp4` in `public/`. The offline single-file demo
 * injects the video as a data URI via `window.__TANDIR_DATA__` so no
 * separate file is needed. If neither exists, an ember-glow fallback
 * keeps the section looking intentional.
 */

declare global {
  interface Window {
    __TANDIR_DATA__?: string;
  }
}

// Preference order: inlined data URI (single-file demo) → static file.
// `BASE_URL` resolves to "/" in a normal build and "./" in the offline demo.
const VIDEO_SRC =
  (typeof window !== "undefined" && window.__TANDIR_DATA__) ||
  `${import.meta.env.BASE_URL}tandir-360.mp4`;
const POSTER_SRC = `${import.meta.env.BASE_URL}tandir-poster.jpg`;

// Scroll-progress keyframes for the three acts.
const SPIN_END = 0.55; // video scrub completes here (mouth faces camera)
const DIVE_END = 0.92; // scale/zoom into the mouth completes here
// Oven-mouth position in the video's final frame (measured from the asset).
const MOUTH_X = 60; // %
const MOUTH_Y = 51; // %

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (n: number) => n * n * (3 - 2 * n); // smoothstep

export function CinematicIntro() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fallbackRef = useRef<HTMLDivElement>(null);
  const storyWrapRef = useRef<HTMLDivElement>(null);
  const chevronRef = useRef<HTMLDivElement>(null);
  const fireRef = useRef<HTMLDivElement>(null);
  const darkRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [reducedMotion, setReducedMotion] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  // Detect reduced-motion preference once.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const listener = () => setReducedMotion(mq.matches);
    mq.addEventListener?.("change", listener);
    return () => mq.removeEventListener?.("change", listener);
  }, []);

  // One rAF loop drives everything: video scrub (lerped) + all transforms
  // and opacities, written directly to the DOM. No setState in the hot path.
  useEffect(() => {
    if (reducedMotion) return;
    const section = sectionRef.current;
    if (!section) return;

    let rafId = 0;
    let running = false;
    let currentTime = 0;
    let targetTime = 0;
    let latestProgress = 0;
    let appliedProgress = -1;

    function readScroll() {
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const totalScroll = section.offsetHeight - window.innerHeight;
      const scrolled = Math.max(0, -rect.top);
      const p = totalScroll > 0 ? Math.min(1, scrolled / totalScroll) : 0;
      latestProgress = p;
      const v = videoRef.current;
      if (v && Number.isFinite(v.duration) && v.duration > 0) {
        // Full rotation completes by SPIN_END; during the dive the video
        // holds its final frame (mouth facing the camera, fire visible).
        targetTime = clamp01(p / SPIN_END) * (v.duration - 0.05);
      }
    }

    /** Write every scroll-driven style for progress `p` straight to the DOM. */
    function apply(p: number) {
      const d = smooth(clamp01((p - SPIN_END) / (DIVE_END - SPIN_END)));
      const scale = 1 + d * 8;

      const v = videoRef.current;
      if (v) {
        v.style.transform = `translate(${(50 - MOUTH_X) * d}%, ${(50 - MOUTH_Y) * d}%) scale(${scale})`;
      }
      const fb = fallbackRef.current;
      if (fb) {
        fb.style.transform = `translate(0%, ${10 * d}%) scale(${scale})`;
      }
      if (fireRef.current) {
        fireRef.current.style.opacity = String(smooth(clamp01((p - 0.68) / 0.2)));
      }
      if (darkRef.current) {
        darkRef.current.style.opacity = String(smooth(clamp01((p - 0.86) / 0.14)));
      }

      const story = 1 - clamp01((p - 0.48) / 0.08);
      if (storyWrapRef.current) storyWrapRef.current.style.opacity = String(story);
      if (chevronRef.current) {
        chevronRef.current.style.opacity = String(Math.max(0, 1 - p / 0.1) * story);
      }

      for (let i = 0; i < STORY_PANELS.length; i++) {
        const el = panelRefs.current[i];
        if (!el) continue;
        const panel = STORY_PANELS[i];
        const signed = (p - panel.center) / panel.half;
        const abs = Math.min(1, Math.abs(signed));
        const opacity = 1 - abs * abs * (3 - 2 * abs); // smoothstep falloff
        if (opacity <= 0.001) {
          if (el.style.visibility !== "hidden") el.style.visibility = "hidden";
          continue;
        }
        const clamped = Math.max(-1, Math.min(1, signed));
        el.style.visibility = "visible";
        el.style.opacity = String(opacity);
        el.style.transform = `translateZ(${-140 * abs}px) rotateY(${clamped * -22}deg)`;
      }
    }

    function tick() {
      if (!running) return;
      const v = videoRef.current;
      if (v && Number.isFinite(v.duration) && v.duration > 0) {
        // Lerp toward the target — smooth across trackpad, wheel and touch.
        currentTime += (targetTime - currentTime) * 0.18;
        // All-intra encode makes seeks cheap, but still skip sub-frame deltas.
        if (Math.abs(v.currentTime - currentTime) > 1 / 48) {
          try {
            v.currentTime = currentTime;
          } catch {
            /* ignore — happens briefly when metadata isn't ready */
          }
        }
      }
      // Only touch the DOM when scroll progress actually moved.
      if (Math.abs(latestProgress - appliedProgress) > 0.0004) {
        appliedProgress = latestProgress;
        apply(latestProgress);
      }
      rafId = requestAnimationFrame(tick);
    }

    function start() {
      if (running) return;
      running = true;
      readScroll();
      rafId = requestAnimationFrame(tick);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(rafId);
    }

    // The loop only runs while the pinned section is actually on screen.
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) start();
        else stop();
      }
    });
    io.observe(section);

    readScroll();
    appliedProgress = latestProgress;
    apply(latestProgress);
    start();
    window.addEventListener("scroll", readScroll, { passive: true });
    window.addEventListener("resize", readScroll);

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener("scroll", readScroll);
      window.removeEventListener("resize", readScroll);
    };
  }, [reducedMotion]);

  // ── Reduced motion: same story, no scrubbing — a static stacked list ────
  if (reducedMotion) {
    return (
      <section className="relative overflow-hidden bg-black text-white">
        <FireGlow />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-14 px-6 py-24 text-center sm:gap-20 sm:py-28">
          {STORY_PANELS.map((panel, i) => (
            <div key={i} className="flex flex-col items-center">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-royal-red">
                {panel.eyebrow}
              </p>
              <h2 className="max-w-3xl font-serif text-3xl leading-tight sm:text-5xl">
                {panel.headline}
              </h2>
              <p className="mt-4 max-w-md text-sm text-white/80 sm:text-base">{panel.sub}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // ── Cinematic scrub hero ──────────────────────────────────────────────────
  return (
    <section
      ref={sectionRef}
      aria-label="Kral Durum tandır intro"
      className="relative bg-black h-[200vh] md:h-[300vh]"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
        {/* Ember glow behind the video/fallback */}
        <FireGlow />

        {/* Video + fallback: flex-centered wrapper so the transform-scale
            doesn't fight Tailwind translate utilities. During the dive the
            transform-origin sits on the oven mouth and the translate pulls
            that point to the middle of the screen — flying INTO the fire. */}
        <div className="absolute inset-0 flex items-center justify-center">
          <video
            ref={videoRef}
            src={VIDEO_SRC}
            poster={POSTER_SRC}
            muted
            playsInline
            preload="auto"
            onLoadedMetadata={() => setVideoReady(true)}
            onError={() => setVideoReady(false)}
            className={cn(
              "max-h-[85vh] max-w-[90vw] object-contain will-change-transform",
              !videoReady && "hidden",
            )}
            style={{ transformOrigin: `${MOUTH_X}% ${MOUTH_Y}%` }}
            aria-hidden
          />
          {/* Molten stand-in until/unless the video can play. Its "fire"
              sits at 50% 40% — the dive scales around that point. */}
          <div
            ref={fallbackRef}
            className={cn(
              "pointer-events-none aspect-square w-[62vh] max-w-[82vw] rounded-full will-change-transform",
              videoReady && "hidden",
            )}
            style={{
              background:
                "radial-gradient(circle at 50% 40%, #ffb347 0%, #ff6a20 22%, #b73513 45%, #3a1005 74%, #000 100%)",
              boxShadow:
                "0 0 60px 10px rgba(255,120,40,0.35), inset 0 0 60px rgba(0,0,0,0.55)",
              transformOrigin: "50% 40%",
              filter: "blur(0.5px)",
            }}
            aria-hidden
          />
        </div>

        {/* Scroll-driven 3D story panels (styles written by the rAF loop) */}
        <div
          ref={storyWrapRef}
          className="pointer-events-none absolute inset-0 z-10"
          style={{ perspective: "1200px", perspectiveOrigin: "50% 45%" }}
        >
          {STORY_PANELS.map((panel, i) => (
            <div
              key={i}
              ref={(el) => {
                panelRefs.current[i] = el;
              }}
              className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white will-change-transform"
              style={{
                visibility: i === 0 ? "visible" : "hidden",
                transformStyle: "preserve-3d",
              }}
            >
              <p
                className="mb-4 text-[11px] font-semibold uppercase tracking-[0.35em] text-royal-red"
                style={{ textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}
              >
                {panel.eyebrow}
              </p>
              <h2
                className="max-w-4xl font-serif text-4xl leading-tight sm:text-6xl md:text-7xl"
                style={{ textShadow: "0 2px 24px rgba(0,0,0,0.75)" }}
              >
                {panel.headline}
              </h2>
              <p
                className="mt-5 max-w-lg text-sm text-white/85 sm:text-base"
                style={{ textShadow: "0 2px 14px rgba(0,0,0,0.7)" }}
              >
                {panel.sub}
              </p>
            </div>
          ))}
        </div>

        {/* Scroll chevron — only visible during the first panel */}
        <div
          ref={chevronRef}
          className="pointer-events-none absolute inset-x-0 bottom-12 z-20 flex flex-col items-center gap-2 text-white/80"
        >
          <span className="text-[10px] uppercase tracking-[0.4em]">Scroll</span>
          <ChevronDown className="size-6 kd-chevron-bounce" />
        </div>

        {/* FIRE FLASH — the screen fills with fire as we enter the mouth */}
        <div
          ref={fireRef}
          className="pointer-events-none absolute inset-0 z-20"
          style={{
            opacity: 0,
            background:
              "radial-gradient(circle at 50% 50%, rgba(255,214,150,0.95) 0%, rgba(255,140,42,0.92) 28%, rgba(255,77,31,0.9) 52%, rgba(58,16,5,0.95) 78%, rgba(13,10,8,1) 100%)",
          }}
          aria-hidden
        />

        {/* LANDING — settle from fire into the menu's dark charcoal */}
        <div
          ref={darkRef}
          className="pointer-events-none absolute inset-0 z-30 bg-[#0d0a08]"
          style={{ opacity: 0 }}
          aria-hidden
        />
      </div>
    </section>
  );
}

// ── Story panels: restaurant info revealed while the tandır spins ──────────

type StoryPanelSpec = {
  /** Scroll-progress center (0..1) where this panel is fully forward. */
  center: number;
  /** Half-width of visibility window in scroll progress. */
  half: number;
  eyebrow: string;
  /** Rendered as JSX so we can italicise / colour key words. */
  headline: React.ReactNode;
  sub: string;
};

const STORY_PANELS: StoryPanelSpec[] = [
  {
    // Peak at page load so the tagline lands full-strength on first paint.
    center: 0.0,
    half: 0.1,
    eyebrow: "Kral Durum · To Go",
    headline: (
      <>
        <span className="italic">Traditie</span> uit de{" "}
        <span className="italic text-royal-gold">tandır</span>,<br />
        vers van het <span className="italic text-royal-gold">vuur</span>.
      </>
    ),
    sub: "Houtskool gegrilde durum, verse lavash en huisgemaakte sauzen.",
  },
  {
    center: 0.13,
    half: 0.06,
    eyebrow: "Het verhaal",
    headline: (
      <>
        <span className="italic">Sinds 2018</span>
        <br />
        in Den Haag.
      </>
    ),
    sub: "Elke spies op echte houtskool — geen kortere weg, alleen vlam.",
  },
  {
    center: 0.25,
    half: 0.06,
    eyebrow: "Het ambacht",
    headline: (
      <>
        Elke <span className="italic text-royal-gold">lavash</span>
        <br />
        met de <span className="italic">hand</span>.
      </>
    ),
    sub: "Vers gebakken, elke ochtend. Zoals het thuis hoort.",
  },
  {
    center: 0.37,
    half: 0.06,
    eyebrow: "In Den Haag",
    headline: (
      <>
        <span className="italic">Tot je deur</span>,<br />
        warm en op tijd.
      </>
    ),
    sub: "€1,50 binnen 2 km · €2,50 binnen 5 km. Afhalen kan altijd.",
  },
  {
    center: 0.48,
    half: 0.06,
    eyebrow: "★★★★★  ·  Google 5.0",
    headline: (
      <>
        <span className="italic text-royal-gold">100K+</span>
        <br />
        blije klanten.
      </>
    ),
    sub: "44 reviews. Elk bord komt met dezelfde vlam.",
  },
];

// ── decorative helpers ─────────────────────────────────────────────────────

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
