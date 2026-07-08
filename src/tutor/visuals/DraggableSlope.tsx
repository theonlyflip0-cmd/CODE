import { useCallback, useRef, useState } from "react";
import { T } from "../theme";

/**
 * Concept 1 visual — drag a point along an aircraft climb curve and watch
 * the tangent slope (climb rate) update live.
 *
 * Altitude model: h(t) = 3200·(1 − e^(−t/45)) ft over t ∈ [0, 120] s.
 * Climb rate:     h'(t) = (3200/45)·e^(−t/45) ft/s — steep at brake release,
 * flattening as the aircraft approaches its ceiling.
 */
const T_MAX = 120;
const H_MAX = 3400;
const h = (t: number) => 3200 * (1 - Math.exp(-t / 45));
const dh = (t: number) => (3200 / 45) * Math.exp(-t / 45);

const W = 640;
const HT = 400;
const M = { l: 60, r: 20, t: 20, b: 44 };
const PW = W - M.l - M.r;
const PH = HT - M.t - M.b;

const sx = (t: number) => M.l + (t / T_MAX) * PW;
const sy = (alt: number) => M.t + (1 - alt / H_MAX) * PH;

export default function DraggableSlope() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [t, setT] = useState(18);
  const [dragging, setDragging] = useState(false);

  const tFromEvent = useCallback((e: { clientX: number }) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const xView = ((e.clientX - rect.left) / rect.width) * W;
    const tt = ((xView - M.l) / PW) * T_MAX;
    return Math.min(T_MAX, Math.max(0, tt));
  }, []);

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const tt = tFromEvent(e);
    if (tt !== null) setT(tt);
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging) return;
    const tt = tFromEvent(e);
    if (tt !== null) setT(tt);
  };
  const stop = () => setDragging(false);

  // curve path
  const pts: string[] = [];
  for (let tt = 0; tt <= T_MAX; tt += 1) {
    pts.push(`${tt === 0 ? "M" : "L"}${sx(tt).toFixed(1)},${sy(h(tt)).toFixed(1)}`);
  }

  // tangent segment (±16 s around the point, clipped to plot)
  const slope = dh(t);
  const alt = h(t);
  const span = 16;
  const t0 = Math.max(0, t - span);
  const t1 = Math.min(T_MAX, t + span);
  const y0 = alt - slope * (t - t0);
  const y1 = alt + slope * (t1 - t);

  const gridT = [0, 20, 40, 60, 80, 100, 120];
  const gridH = [0, 1000, 2000, 3000];

  return (
    <div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${HT}`}
        className="w-full select-none"
        style={{ touchAction: "none", cursor: dragging ? "grabbing" : "grab" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stop}
        onPointerLeave={stop}
        role="application"
        aria-label={`Position-time graph. Aircraft altitude ${Math.round(alt)} feet at ${Math.round(t)} seconds; climb rate ${slope.toFixed(1)} feet per second. Drag to change time.`}
      >
        {/* grid */}
        {gridH.map((g) => (
          <line key={`h${g}`} x1={M.l} x2={W - M.r} y1={sy(g)} y2={sy(g)} stroke={T.grid} strokeWidth={1} />
        ))}
        {gridT.map((g) => (
          <line key={`t${g}`} x1={sx(g)} x2={sx(g)} y1={M.t} y2={HT - M.b} stroke={T.grid} strokeWidth={1} />
        ))}
        {/* axes */}
        <line x1={M.l} x2={W - M.r} y1={sy(0)} y2={sy(0)} stroke={T.axis} strokeWidth={1.5} />
        <line x1={M.l} x2={M.l} y1={M.t} y2={HT - M.b} stroke={T.axis} strokeWidth={1.5} />
        {gridT.map((g) => (
          <text key={`tl${g}`} x={sx(g)} y={HT - M.b + 18} textAnchor="middle" fontSize={11} fill={T.inkMuted}>
            {g}
          </text>
        ))}
        {gridH.map((g) => (
          <text key={`hl${g}`} x={M.l - 8} y={sy(g) + 4} textAnchor="end" fontSize={11} fill={T.inkMuted}>
            {g}
          </text>
        ))}
        <text x={W / 2} y={HT - 6} textAnchor="middle" fontSize={12} fill={T.inkSecondary}>
          time t (s)
        </text>
        <text x={14} y={HT / 2} textAnchor="middle" fontSize={12} fill={T.inkSecondary} transform={`rotate(-90 14 ${HT / 2})`}>
          altitude h(t) (ft)
        </text>

        {/* position curve */}
        <path d={pts.join(" ")} fill="none" stroke={T.position} strokeWidth={2.5} strokeLinecap="round" />

        {/* tangent */}
        <line x1={sx(t0)} y1={sy(y0)} x2={sx(t1)} y2={sy(y1)} stroke={T.accel} strokeWidth={2} strokeDasharray="none" />

        {/* draggable point (ring of surface color separates it from the line) */}
        <circle cx={sx(t)} cy={sy(alt)} r={9} fill={T.surface} />
        <circle cx={sx(t)} cy={sy(alt)} r={7} fill={T.position} stroke={T.inkPrimary} strokeWidth={1.5} />

        {/* slope readout pinned near the point */}
        <g transform={`translate(${Math.min(sx(t) + 14, W - 175)}, ${Math.max(sy(alt) - 40, M.t + 6)})`}>
          <rect width={160} height={34} rx={4} fill={T.surfaceRaised} stroke={T.borderStrong} />
          <text x={10} y={22} fontSize={13} fill={T.accel} fontFamily="ui-monospace, monospace">
            slope = {slope.toFixed(1)} ft/s
          </text>
        </g>
      </svg>

      <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-sm">
        <Readout label="time t" value={`${t.toFixed(0)} s`} color={T.inkPrimary} />
        <Readout label="altitude h(t)" value={`${alt.toFixed(0)} ft`} color={T.position} />
        <Readout label="climb rate h′(t)" value={`${slope.toFixed(1)} ft/s`} color={T.accel} />
      </div>
      <p className="mt-3 text-sm" style={{ color: T.inkSecondary }}>
        Drag the point. The <span style={{ color: T.accel }}>amber tangent line</span> is the derivative:
        the slope of the altitude curve <em>at that instant</em> = the vertical speed the pilot reads off
        the variometer. Early in the climb the curve is steep (big climb rate); near the ceiling it
        flattens (climb rate → 0).
      </p>
    </div>
  );
}

function Readout({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded border px-3 py-2" style={{ borderColor: T.border, background: T.surfaceRaised }}>
      <div className="text-[11px] uppercase tracking-wider" style={{ color: T.inkMuted }}>
        {label}
      </div>
      <div className="text-base" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
