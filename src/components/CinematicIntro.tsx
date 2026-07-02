import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Full-viewport pinned scroll-scrub hero. Maps scroll progress to the
 * currentTime of a 360° tandır video with rAF + lerp smoothing.
 *
 * • Section is 300vh tall (200vh on mobile) with a sticky child.
 * • 0–60% progress: logo + tagline + chevron are visible.
 * • 60–85%: overlay fades out.
 * • 85–100%: video scales 1 → 1.15 while the frame fades to black.
 * • prefers-reduced-motion: a static poster hero with a simple fade.
 *
 * Expects `/tandir-360.mp4` in `public/`. If missing, an ember-glow
 * fallback keeps the section looking intentional.
 */

// `BASE_URL` resolves to "/" in a normal build and "./" in the offline
// hash-routed demo, so the src works both when served from a web root and
// when opened straight from disk.
const VIDEO_SRC = `${import.meta.env.BASE_URL}tandir-360.mp4`;
const POSTER_SRC = `${import.meta.env.BASE_URL}tandir-poster.jpg`;

export function CinematicIntro() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
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

  // Scroll-scrub rAF loop with lerp smoothing.
  useEffect(() => {
    if (reducedMotion) return;
    const section = sectionRef.current;
    if (!section) return;

    let rafId = 0;
    let mounted = true;
    let currentTime = 0;
    let targetTime = 0;
    let latestProgress = 0;

    function readScroll() {
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const totalScroll = section.offsetHeight - window.innerHeight;
      const scrolled = Math.max(0, -rect.top);
      const p = totalScroll > 0 ? Math.min(1, scrolled / totalScroll) : 0;
      latestProgress = p;
      const v = videoRef.current;
      if (v && Number.isFinite(v.duration) && v.duration > 0) {
        targetTime = p * v.duration;
      }
    }

    function tick() {
      if (!mounted) return;
      const v = videoRef.current;
      if (v && Number.isFinite(v.duration) && v.duration > 0) {
        // Lerp toward the target — 0.18 is a good compromise between
        // responsiveness and smoothness across trackpad + wheel + touch.
        currentTime += (targetTime - currentTime) * 0.18;
        // Only write when the delta is meaningful; setting currentTime on
        // every frame causes stutter on Safari.
        if (Math.abs(v.currentTime - currentTime) > 1 / 60) {
          try {
            v.currentTime = currentTime;
          } catch {
            /* ignore — happens briefly when metadata isn't ready */
          }
        }
      }
      setProgress(latestProgress);
      rafId = requestAnimationFrame(tick);
    }

    readScroll();
    tick();
    window.addEventListener("scroll", readScroll, { passive: true });
    window.addEventListener("resize", readScroll);

    return () => {
      mounted = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", readScroll);
      window.removeEventListener("resize", readScroll);
    };
  }, [reducedMotion]);

  const { videoScale, blackOpacity, storyOpacity, chevronOpacity } = useMemo(() => {
    // 0–85%: story panels visible. 85–100%: video scales + fades to black.
    const scaleT = Math.max(0, Math.min(1, (progress - 0.85) / 0.15));
    // Story panels' overall opacity multiplier — fades all panels out together
    // at the end so the black-out never fights an in-flight panel transition.
    const story = 1 - scaleT;
    // Chevron only during the first panel; fade before the second appears.
    const chev = Math.max(0, 1 - progress / 0.12);
    return {
      videoScale: 1 + scaleT * 0.15,
      blackOpacity: scaleT,
      storyOpacity: story,
      chevronOpacity: chev,
    };
  }, [progress]);

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
            doesn't fight Tailwind translate utilities. */}
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
            style={{ transform: `scale(${videoScale})` }}
            aria-hidden
          />
          {!videoReady && <TandirFallback scale={videoScale} />}
        </div>

        {/* Scroll-driven 3D story panels */}
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            perspective: "1200px",
            perspectiveOrigin: "50% 45%",
            opacity: storyOpacity,
          }}
        >
          {STORY_PANELS.map((panel, i) => (
            <StoryPanel key={i} panel={panel} progress={progress} />
          ))}
        </div>

        {/* Scroll chevron — only visible during the first panel */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-12 z-20 flex flex-col items-center gap-2 text-white/80"
          style={{ opacity: chevronOpacity * storyOpacity }}
        >
          <span className="text-[10px] uppercase tracking-[0.4em]">Scroll</span>
          <ChevronDown className="size-6 kd-chevron-bounce" />
        </div>

        {/* Fade to black at the very end (85–100%) */}
        <div
          className="pointer-events-none absolute inset-0 bg-black"
          style={{ opacity: blackOpacity }}
          aria-hidden
        />
      </div>
    </section>
  );
}

// ── Story panels: scroll-driven 3D restaurant info ─────────────────────────

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
    half: 0.13,
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
    center: 0.22,
    half: 0.08,
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
    center: 0.40,
    half: 0.08,
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
    center: 0.58,
    half: 0.08,
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
    center: 0.75,
    half: 0.08,
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

function StoryPanel({ panel, progress }: { panel: StoryPanelSpec; progress: number }) {
  // Signed distance from the panel's center, in units of half-width.
  const signed = (progress - panel.center) / panel.half;
  const abs = Math.min(1, Math.abs(signed));
  const clamped = Math.max(-1, Math.min(1, signed));

  // Opacity: full at center, 0 past ±half-width. Cheap smoothstep for polish.
  const opacity = 1 - abs * abs * (3 - 2 * abs);
  if (opacity <= 0.001) return null;

  // 3D transform: depth-pull from -140px → 0 → -140px, rotateY ±22° across
  // the pass so it enters from the right and exits to the left.
  const tz = -140 * abs;
  const ry = clamped * -22;

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white will-change-transform"
      style={{
        opacity,
        transform: `translateZ(${tz}px) rotateY(${ry}deg)`,
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
  );
}

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

/** Molten silhouette that stands in for the tandır until the mp4 is shipped. */
function TandirFallback({ scale }: { scale: number }) {
  return (
    <div
      className="pointer-events-none aspect-square w-[62vh] max-w-[82vw] rounded-full will-change-transform"
      style={{
        background:
          "radial-gradient(circle at 50% 40%, #ffb347 0%, #ff6a20 22%, #b73513 45%, #3a1005 74%, #000 100%)",
        boxShadow:
          "0 0 60px 10px rgba(255,120,40,0.35), inset 0 0 60px rgba(0,0,0,0.55)",
        transform: `scale(${scale})`,
        filter: "blur(0.5px)",
      }}
      aria-hidden
    />
  );
}
