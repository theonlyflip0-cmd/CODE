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

  const { overlayOpacity, videoScale, blackOpacity } = useMemo(() => {
    // 0-60%: overlay visible. 60-80%: fade overlay. 85-100%: scale + fade to black.
    const overlay = progress < 0.6 ? 1 : Math.max(0, 1 - (progress - 0.6) / 0.2);
    const scaleT = Math.max(0, Math.min(1, (progress - 0.85) / 0.15));
    const scale = 1 + scaleT * 0.15;
    const black = scaleT;
    return { overlayOpacity: overlay, videoScale: scale, blackOpacity: black };
  }, [progress]);

  // ── Reduced motion: static poster with a soft fade in ────────────────────
  if (reducedMotion) {
    return (
      <section className="relative overflow-hidden bg-black text-white">
        <div className="relative flex min-h-[70vh] flex-col items-center justify-center px-6 py-24 text-center">
          <FireGlow />
          <p className="relative z-10 mb-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-royal-red">
            Kral Durum · To Go
          </p>
          <h1 className="relative z-10 max-w-3xl font-serif text-4xl leading-tight sm:text-6xl">
            <span className="italic">Traditie</span> uit de{" "}
            <span className="italic text-royal-gold">tandır</span>,
            <br />
            vers van het <span className="italic text-royal-gold">vuur</span>.
          </h1>
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

        {/* Overlay: title + tagline + scroll hint */}
        <div
          className="pointer-events-none absolute inset-0 z-10 text-white"
          style={{ opacity: overlayOpacity }}
        >
          <div className="absolute inset-x-0 top-24 flex flex-col items-center text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-royal-red">
              Kral Durum · To Go
            </p>
          </div>
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
            <h1 className="max-w-4xl font-serif text-4xl leading-tight drop-shadow-[0_2px_20px_rgba(0,0,0,0.7)] sm:text-6xl md:text-7xl">
              <span className="italic">Traditie</span> uit de{" "}
              <span className="italic text-royal-gold">tandır</span>,
              <br />
              vers van het <span className="italic text-royal-gold">vuur</span>.
            </h1>
          </div>
          <div className="absolute inset-x-0 bottom-14 flex flex-col items-center gap-2 text-white/80">
            <span className="text-[10px] uppercase tracking-[0.4em]">Scroll</span>
            <ChevronDown className="size-6 kd-chevron-bounce" />
          </div>
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
