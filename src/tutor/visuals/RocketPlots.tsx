import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { T } from "../theme";

/**
 * Concept 2 visual — the model rocket h(t) = 100t − 5t².
 * Height, velocity and acceleration stacked and time-synced; the peak
 * (where v = 0) is highlighted automatically.
 */
interface Row {
  t: number;
  h: number;
  v: number;
  a: number;
}

const data: Row[] = [];
for (let t = 0; t <= 20; t += 0.5) {
  data.push({ t, h: 100 * t - 5 * t * t, v: 100 - 10 * t, a: -10 });
}

// find the peak automatically: the sample where velocity crosses zero
const peak = data.reduce((best, r) => (Math.abs(r.v) < Math.abs(best.v) ? r : best), data[0]);

const tooltipStyle = {
  background: T.surfaceRaised,
  border: `1px solid ${T.borderStrong}`,
  borderRadius: 4,
  fontSize: 12,
  color: T.inkPrimary,
} as const;

function Panel({
  dataKey,
  color,
  label,
  unit,
  domain,
  ticks,
  showXAxis,
  children,
}: {
  dataKey: keyof Row;
  color: string;
  label: string;
  unit: string;
  domain: [number, number];
  ticks?: number[];
  showXAxis?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline gap-2 text-xs">
        <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
        <span style={{ color: T.inkPrimary }}>{label}</span>
        <span className="font-mono" style={{ color: T.inkMuted }}>
          {unit}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={showXAxis ? 150 : 128}>
        <LineChart data={data} syncId="rocket" margin={{ top: 8, right: 16, bottom: showXAxis ? 4 : 0, left: 0 }}>
          <CartesianGrid stroke={T.grid} strokeWidth={1} vertical={false} />
          <XAxis
            dataKey="t"
            type="number"
            domain={[0, 20]}
            ticks={[0, 5, 10, 15, 20]}
            hide={!showXAxis}
            tick={{ fill: T.inkMuted, fontSize: 11 }}
            stroke={T.axis}
            label={showXAxis ? { value: "time t (s)", fill: T.inkSecondary, fontSize: 12, dy: 14 } : undefined}
          />
          <YAxis
            domain={domain}
            ticks={ticks}
            width={44}
            tick={{ fill: T.inkMuted, fontSize: 11 }}
            stroke={T.axis}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={{ color: T.inkSecondary }}
            labelFormatter={(t) => `t = ${t} s`}
            formatter={(value) => [`${Number(value).toFixed(0)} ${unit}`, label]}
          />
          <ReferenceLine x={peak.t} stroke={T.inkMuted} strokeDasharray="4 4" />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          {children}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function RocketPlots() {
  return (
    <div>
      <p className="mb-3 font-mono text-sm" style={{ color: T.inkSecondary }}>
        h(t) = 100t − 5t² &nbsp;→&nbsp; v(t) = h′(t) = 100 − 10t &nbsp;→&nbsp; a(t) = v′(t) = −10
      </p>

      <div className="space-y-4">
        <Panel dataKey="h" color={T.position} label="height h(t)" unit="m" domain={[0, 550]}>
          <ReferenceDot
            x={peak.t}
            y={peak.h}
            r={6}
            fill={T.position}
            stroke={T.inkPrimary}
            strokeWidth={1.5}
            label={{
              value: `peak: ${peak.h.toFixed(0)} m at t = ${peak.t} s`,
              fill: T.inkPrimary,
              fontSize: 12,
              position: "insideBottomRight",
            }}
          />
        </Panel>

        <Panel dataKey="v" color={T.velocity} label="velocity v(t) = h′(t)" unit="m/s" domain={[-110, 110]}>
          <ReferenceLine y={0} stroke={T.axis} strokeWidth={1.5} />
          <ReferenceDot
            x={peak.t}
            y={0}
            r={6}
            fill={T.velocity}
            stroke={T.inkPrimary}
            strokeWidth={1.5}
            label={{
              value: "v = 0 → the peak",
              fill: T.velocity,
              fontSize: 12,
              position: "top",
            }}
          />
        </Panel>

        <Panel dataKey="a" color={T.accel} label="acceleration a(t) = v′(t)" unit="m/s²" domain={[-20, 5]} ticks={[-20, -10, 0]} showXAxis>
          <ReferenceLine y={0} stroke={T.axis} strokeWidth={1.5} />
        </Panel>
      </div>

      <p className="mt-3 text-sm" style={{ color: T.inkSecondary }}>
        Hover any chart — all three track together. At the dashed line the height curve is momentarily
        flat: its slope (the velocity) passes through <span className="font-mono" style={{ color: T.velocity }}>v = 0</span>.
        That's how you <em>find</em> the peak without plotting anything: set the derivative to zero and
        solve. 100 − 10t = 0 → t = 10 s → h = 500 m. Gravity (constant −10 m/s²) never stops acting —
        the rocket is momentarily still, not force-free.
      </p>
    </div>
  );
}
