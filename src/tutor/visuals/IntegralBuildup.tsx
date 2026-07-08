import { useEffect, useRef, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { T } from "../theme";

/**
 * Concept 4 visual — the reverse trip. Constant engine acceleration
 * a = 4 m/s²; press play and watch the area under each curve "fill in"
 * to build the next one up: a → v → s. A v₀ slider shows why the
 * starting condition (the constant of integration) matters.
 */
const A = 4;
const T_END = 10;
const STEP = 0.1;

interface Row {
  t: number;
  a: number;
  aBuilt?: number;
  v: number;
  vBuilt?: number;
  s: number;
  sBuilt?: number;
}

function makeData(v0: number, T_now: number): Row[] {
  const rows: Row[] = [];
  for (let i = 0; i <= Math.round(T_END / STEP); i++) {
    const t = +(i * STEP).toFixed(2);
    const v = v0 + A * t;
    const s = v0 * t + 0.5 * A * t * t;
    const built = t <= T_now + 1e-9;
    rows.push({
      t,
      a: A,
      aBuilt: built ? A : undefined,
      v,
      vBuilt: built ? v : undefined,
      s,
      sBuilt: built ? s : undefined,
    });
  }
  return rows;
}

const tooltipStyle = {
  background: T.surfaceRaised,
  border: `1px solid ${T.borderStrong}`,
  borderRadius: 4,
  fontSize: 12,
  color: T.inkPrimary,
} as const;

function Panel({
  title,
  height,
  children,
}: {
  title: React.ReactNode;
  height: number;
  children: React.ReactElement;
}) {
  return (
    <div>
      <div className="mb-1 text-xs" style={{ color: T.inkPrimary }}>
        {title}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

export default function IntegralBuildup() {
  const [tNow, setTNow] = useState(4);
  const [v0, setV0] = useState(15);
  const [playing, setPlaying] = useState(false);
  const raf = useRef(0);
  const last = useRef(0);

  useEffect(() => {
    if (!playing) return;
    const tick = (now: number) => {
      if (last.current) {
        const dt = (now - last.current) / 1000;
        setTNow((v) => {
          const next = v + dt * 1.6;
          if (next >= T_END) {
            setPlaying(false);
            return T_END;
          }
          return next;
        });
      }
      last.current = now;
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf.current);
      last.current = 0;
    };
  }, [playing]);

  const data = makeData(v0, tNow);
  const vNow = v0 + A * tNow;
  const sNow = v0 * tNow + 0.5 * A * tNow * tNow;
  const areaA = A * tNow;

  const xAxis = (show: boolean) => (
    <XAxis
      dataKey="t"
      type="number"
      domain={[0, T_END]}
      ticks={[0, 2, 4, 6, 8, 10]}
      hide={!show}
      tick={{ fill: T.inkMuted, fontSize: 11 }}
      stroke={T.axis}
      label={show ? { value: "time t (s)", fill: T.inkSecondary, fontSize: 12, dy: 14 } : undefined}
    />
  );

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          onClick={() => {
            if (tNow >= T_END) setTNow(0);
            setPlaying((p) => !p);
          }}
          className="rounded border px-3 py-1.5 text-sm"
          style={{ borderColor: T.borderStrong, color: T.inkPrimary, background: T.surfaceRaised }}
        >
          {playing ? "❚❚ Pause" : tNow >= T_END ? "↺ Replay" : "▶ Play the build-up"}
        </button>
        <label className="flex items-center gap-2 text-sm" style={{ color: T.inkSecondary }}>
          t =
          <input
            type="range"
            min={0}
            max={T_END}
            step={0.1}
            value={tNow}
            onChange={(e) => {
              setPlaying(false);
              setTNow(Number(e.target.value));
            }}
            className="w-32 accent-[#3987e5]"
          />
          <span className="font-mono" style={{ color: T.inkPrimary }}>{tNow.toFixed(1)} s</span>
        </label>
        <label className="flex items-center gap-2 text-sm" style={{ color: T.inkSecondary }}>
          launch speed v₀ =
          <input
            type="range"
            min={0}
            max={40}
            step={5}
            value={v0}
            onChange={(e) => setV0(Number(e.target.value))}
            className="w-28 accent-[#199e70]"
          />
          <span className="font-mono" style={{ color: T.velocity }}>{v0} m/s</span>
        </label>
      </div>

      <div className="space-y-4">
        <Panel
          height={120}
          title={
            <>
              <Swatch color={T.accel} /> acceleration a(t) = {A} m/s² — shaded area ={" "}
              <span className="font-mono" style={{ color: T.accel }}>
                {A} × {tNow.toFixed(1)} = {areaA.toFixed(1)} m/s of velocity gained
              </span>
            </>
          }
        >
          <ComposedChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid stroke={T.grid} vertical={false} />
            {xAxis(false)}
            <YAxis domain={[0, 6]} width={44} tick={{ fill: T.inkMuted, fontSize: 11 }} stroke={T.axis} />
            <Tooltip contentStyle={tooltipStyle} labelFormatter={(t) => `t = ${Number(t).toFixed(1)} s`} formatter={(val) => [`${Number(val).toFixed(1)} m/s²`, "a"]} />
            <Line type="monotone" dataKey="a" stroke={T.accel} strokeWidth={1} strokeDasharray="3 3" dot={false} isAnimationActive={false} />
            <Area type="monotone" dataKey="aBuilt" stroke={T.accel} strokeWidth={2} fill={T.accel} fillOpacity={0.22} dot={false} isAnimationActive={false} />
          </ComposedChart>
        </Panel>

        <Panel
          height={150}
          title={
            <>
              <Swatch color={T.velocity} /> velocity v(t) = <span className="font-mono" style={{ color: T.velocity }}>v₀ + {A}t</span>{" "}
              — starts at <span className="font-mono" style={{ color: T.velocity }}>v₀ = {v0}</span>, the constant recovered from the launch condition; its area is distance
            </>
          }
        >
          <ComposedChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid stroke={T.grid} vertical={false} />
            {xAxis(false)}
            <YAxis domain={[0, 40 + A * T_END]} width={44} tick={{ fill: T.inkMuted, fontSize: 11 }} stroke={T.axis} />
            <Tooltip contentStyle={tooltipStyle} labelFormatter={(t) => `t = ${Number(t).toFixed(1)} s`} formatter={(val) => [`${Number(val).toFixed(1)} m/s`, "v"]} />
            <ReferenceLine y={v0} stroke={T.velocity} strokeDasharray="4 4" label={{ value: "v₀", fill: T.velocity, fontSize: 12, position: "insideTopLeft" }} />
            <Line type="monotone" dataKey="v" stroke={T.velocity} strokeWidth={1} strokeDasharray="3 3" dot={false} isAnimationActive={false} />
            <Area type="monotone" dataKey="vBuilt" stroke={T.velocity} strokeWidth={2} fill={T.velocity} fillOpacity={0.18} dot={false} isAnimationActive={false} />
          </ComposedChart>
        </Panel>

        <Panel
          height={170}
          title={
            <>
              <Swatch color={T.position} /> position s(t) = <span className="font-mono" style={{ color: T.position }}>v₀t + ½·{A}·t²</span> — built up from the velocity area
            </>
          }
        >
          <ComposedChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
            <CartesianGrid stroke={T.grid} vertical={false} />
            {xAxis(true)}
            <YAxis domain={[0, 40 * T_END + 0.5 * A * T_END * T_END]} width={44} tick={{ fill: T.inkMuted, fontSize: 11 }} stroke={T.axis} />
            <Tooltip contentStyle={tooltipStyle} labelFormatter={(t) => `t = ${Number(t).toFixed(1)} s`} formatter={(val) => [`${Number(val).toFixed(0)} m`, "s"]} />
            <Line type="monotone" dataKey="s" stroke={T.position} strokeWidth={1} strokeDasharray="3 3" dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="sBuilt" stroke={T.position} strokeWidth={2.5} dot={false} isAnimationActive={false} />
          </ComposedChart>
        </Panel>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-sm">
        <div className="rounded border px-3 py-2" style={{ borderColor: T.border, background: T.surfaceRaised }}>
          <div className="text-[11px] uppercase tracking-wider" style={{ color: T.inkMuted }}>velocity now</div>
          <div style={{ color: T.velocity }}>
            v({tNow.toFixed(1)}) = {v0} + {areaA.toFixed(1)} = {vNow.toFixed(1)} m/s
          </div>
        </div>
        <div className="rounded border px-3 py-2" style={{ borderColor: T.border, background: T.surfaceRaised }}>
          <div className="text-[11px] uppercase tracking-wider" style={{ color: T.inkMuted }}>position now</div>
          <div style={{ color: T.position }}>s({tNow.toFixed(1)}) = {sNow.toFixed(1)} m</div>
        </div>
      </div>

      <p className="mt-3 text-sm" style={{ color: T.inkSecondary }}>
        Integration is the derivative trip run <em>backwards</em>: accumulate (add up) the area under
        acceleration to rebuild velocity, then accumulate the area under velocity to rebuild position.
        Notice what the area <em>can't</em> tell you: where you started. Slide{" "}
        <span className="font-mono" style={{ color: T.velocity }}>v₀</span> and watch the whole velocity
        line shift — the area only gives the <em>change</em>, and the starting condition (launch speed,
        launch pad height) supplies the constant that pins the curve down.
      </p>
    </div>
  );
}

function Swatch({ color }: { color: string }) {
  return <span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm align-middle" style={{ background: color }} />;
}
