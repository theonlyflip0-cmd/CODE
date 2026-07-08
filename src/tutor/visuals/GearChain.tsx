import { useEffect, useRef, useState } from "react";
import { T } from "../theme";

/**
 * Concept 3 visual — three meshed gears animate the chain rule:
 * rates multiply along the chain.
 *
 * Gear A (time) turns at 1×. Gear B (altitude) is geared 2× to A, and
 * gear C (air density) is geared 2× to B — so C turns at 2 × 2 = 4×
 * relative to A. Exactly dρ/dt = dρ/dh · dh/dt.
 */
function gearPath(teeth: number, rOuter: number, rInner: number): string {
  // simple involute-ish silhouette: alternate outer/inner radius per half-tooth
  const steps = teeth * 4;
  const pts: string[] = [];
  for (let i = 0; i < steps; i++) {
    const frac = (i % 4) / 4;
    // tooth profile: out, out, in, in  (with slight flank angle from the sweep)
    const r = frac < 0.5 ? rOuter : rInner;
    const angle = (i / steps) * Math.PI * 2;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return pts.join(" ") + "Z";
}

interface GearSpec {
  cx: number;
  cy: number;
  teeth: number;
  rOuter: number;
  rInner: number;
  color: string;
  speed: number; // multiple of base rotation
  phase: number; // radians, so teeth appear meshed
}

const RATIO_1 = 2; // dh/dt   (altitude per time)
const RATIO_2 = 2; // dρ/dh   (density per altitude)

const gears: GearSpec[] = [
  { cx: 105, cy: 130, teeth: 24, rOuter: 84, rInner: 72, color: T.position, speed: 1, phase: 0 },
  { cx: 105 + 84 + 42 - 4, cy: 130, teeth: 12, rOuter: 46, rInner: 34, color: T.velocity, speed: -RATIO_1, phase: 0.26 },
  { cx: 105 + 84 + 42 - 4 + 46 + 24 - 3, cy: 130, teeth: 6, rOuter: 27, rInner: 15, color: T.accel, speed: RATIO_1 * RATIO_2, phase: 0.5 },
];

const labels = [
  { title: "t — time", rate: "turns 1×", detail: "the input" },
  { title: "h — altitude", rate: `dh/dt = ${RATIO_1}`, detail: `${RATIO_1}× per turn of t` },
  { title: "ρ — air density", rate: `dρ/dh = ${RATIO_2}`, detail: `${RATIO_2}× per turn of h` },
];

export default function GearChain() {
  const [running, setRunning] = useState(true);
  const [angle, setAngle] = useState(0);
  const raf = useRef(0);
  const last = useRef(0);

  useEffect(() => {
    if (!running) return;
    const tick = (now: number) => {
      if (last.current) {
        const dt = (now - last.current) / 1000;
        setAngle((a) => a + dt * 0.5); // base gear: 0.5 rad/s
      }
      last.current = now;
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf.current);
      last.current = 0;
    };
  }, [running]);

  return (
    <div>
      <svg viewBox="0 0 360 260" className="mx-auto w-full max-w-lg" role="img" aria-label="Three meshed gears: time drives altitude at 2 to 1, altitude drives air density at 2 to 1, so density turns 4 times per turn of time.">
        {gears.map((g, i) => (
          <g key={i} transform={`translate(${g.cx},${g.cy})`}>
            <g transform={`rotate(${(((angle * g.speed + g.phase) * 180) / Math.PI).toFixed(2)})`}>
              <path d={gearPath(g.teeth, g.rOuter, g.rInner)} fill={g.color} fillOpacity={0.16} stroke={g.color} strokeWidth={2} strokeLinejoin="round" />
              {/* spokes so rotation speed is visible */}
              <line x1={0} y1={0} x2={g.rInner - 4} y2={0} stroke={g.color} strokeWidth={2.5} />
              <line x1={0} y1={0} x2={0} y2={g.rInner - 4} stroke={g.color} strokeWidth={1.5} opacity={0.5} />
            </g>
            <circle r={5} fill={T.surface} stroke={g.color} strokeWidth={2} />
          </g>
        ))}
        {/* per-gear speed labels */}
        {gears.map((g, i) => (
          <text key={`s${i}`} x={g.cx} y={g.cy + g.rOuter + 22} textAnchor="middle" fontSize={13} fill={g.color} fontFamily="ui-monospace, monospace">
            {Math.abs(g.speed)}× speed
          </text>
        ))}
      </svg>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setRunning((r) => !r)}
          className="rounded border px-3 py-1.5 text-sm transition-colors"
          style={{ borderColor: T.borderStrong, color: T.inkPrimary, background: T.surfaceRaised }}
        >
          {running ? "❚❚ Pause" : "▶ Run"}
        </button>
        <span className="font-mono text-sm" style={{ color: T.inkPrimary }}>
          dρ/dt = <span style={{ color: T.accel }}>dρ/dh</span> × <span style={{ color: T.velocity }}>dh/dt</span> ={" "}
          <span style={{ color: T.accel }}>{RATIO_2}</span> × <span style={{ color: T.velocity }}>{RATIO_1}</span> ={" "}
          <span style={{ color: T.inkPrimary }}>{RATIO_1 * RATIO_2}</span>
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {labels.map((l, i) => (
          <div key={i} className="rounded border px-3 py-2" style={{ borderColor: T.border, background: T.surfaceRaised }}>
            <div className="text-sm" style={{ color: [T.position, T.velocity, T.accel][i] }}>{l.title}</div>
            <div className="font-mono text-sm" style={{ color: T.inkPrimary }}>{l.rate}</div>
            <div className="text-xs" style={{ color: T.inkMuted }}>{l.detail}</div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-sm" style={{ color: T.inkSecondary }}>
        Watch the spokes: every turn of the big <span style={{ color: T.position }}>time</span> gear turns the{" "}
        <span style={{ color: T.velocity }}>altitude</span> gear twice, and every turn of altitude turns the{" "}
        <span style={{ color: T.accel }}>density</span> gear twice — so density turns <strong>4×</strong> per
        turn of time. That's the chain rule. In flight: air density ρ depends on altitude h, and altitude
        depends on time t. To know how fast density is dropping <em>right now</em>, multiply the two rates:
        how fast density changes per metre of altitude, times how many metres of altitude you gain per second.
      </p>
    </div>
  );
}
