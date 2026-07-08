import type { Concept } from "./types";
import DraggableSlope from "./visuals/DraggableSlope";
import RocketPlots from "./visuals/RocketPlots";
import GearChain from "./visuals/GearChain";
import IntegralBuildup from "./visuals/IntegralBuildup";
import { T } from "./theme";

const Em = ({ children }: { children: React.ReactNode }) => (
  <strong style={{ color: T.inkPrimary }}>{children}</strong>
);

export const CONCEPTS: Concept[] = [
  {
    id: "derivative-rate",
    title: "The derivative is a rate of change",
    shortTitle: "Derivative = rate",
    tagline: "position → velocity → acceleration",
    explanation: (
      <div className="space-y-3">
        <p>
          Forget formulas for a second. A derivative answers one question:{" "}
          <Em>"how fast is this thing changing, right now?"</Em>
        </p>
        <p>
          An aircraft's altimeter records altitude over time — that's a curve, h(t). The{" "}
          <Em>derivative of that curve is the climb rate</Em>: the vertical speed the pilot
          reads off the variometer. Steep curve = climbing hard. Flat curve = level flight.
        </p>
        <p>
          It chains: position changes → the rate of that change is <Em>velocity</Em>.
          Velocity changes → the rate of <em>that</em> change is <Em>acceleration</Em> —
          which is what you feel as g-force when a jet pulls up. Each derivative is just
          "the rate of change of the thing before it."
        </p>
        <p>
          Graphically, the derivative at a point is the <Em>slope of the curve at that
          exact point</Em> — the direction the curve is heading at that instant.
        </p>
      </div>
    ),
    rubric: `- The derivative measures how fast a quantity is changing at a specific instant (a rate of change, not an average and not a formula-manipulation trick).
- Graphically it is the slope of the curve at a point.
- The chain position → velocity → acceleration: velocity is the derivative of position, acceleration is the derivative of velocity.
- Ideally tied to a physical example (climb rate, variometer, g-force) though any correct physical framing counts.`,
    misconceptions: `- Confusing "derivative of position" (velocity) with "derivative of speed/velocity" (acceleration) — probe this if their wording is loose.
- Thinking the derivative is an average rate over an interval rather than instantaneous.
- Thinking the derivative is the height/value of the curve rather than its slope.
- Reciting "the limit of the difference quotient" without being able to say what it means physically — that's memorization, not understanding.`,
    keyIdeas: [
      {
        idea: "the derivative measures how fast something is changing (a rate)",
        patterns: [/rate/, /how fast/, /changing|change per/, /speed of change/],
        hint: "The derivative is the answer to 'how fast is this changing right now?' — a rate, like ft/s of climb.",
      },
      {
        idea: "graphically, it is the slope of the curve at a point",
        patterns: [/slope/, /steep/, /tangent/, /gradient/],
        hint: "On a graph, the derivative at a point is the steepness (slope) of the curve exactly there.",
      },
      {
        idea: "velocity is the derivative of position, acceleration of velocity",
        patterns: [/velocity.*(position|derivative)|derivative.*position/, /acceleration.*(velocity|derivative)|derivative.*velocity/],
        hint: "Differentiate position and you get velocity; differentiate velocity and you get acceleration (the g-forces you feel).",
      },
    ],
    recallPrompt:
      "In your own words: what is a derivative, what does it look like on a graph, and how do position, velocity and acceleration relate through it? Use the aircraft example if it helps.",
    offlineFollowUp:
      "if a rocket's velocity-time graph is a straight line sloping up, what does its acceleration look like?",
    Visual: DraggableSlope,
  },
  {
    id: "zero-derivative-peaks",
    title: "Zero derivative = not changing = how you find peaks",
    shortTitle: "Peaks: set f′ = 0",
    tagline: "max altitude, min drag, peak load",
    explanation: (
      <div className="space-y-3">
        <p>
          A model rocket coasts upward, slows, hangs for an instant, then falls. At the very
          top its velocity is <Em>exactly zero</Em> — for that one instant its height is{" "}
          <Em>not changing</Em>.
        </p>
        <p>
          Flip that around and you get the most-used trick in engineering: at any peak (or
          valley) of a smooth curve, the derivative is zero. So to <Em>find</Em> a maximum
          or minimum, you don't plot anything — you{" "}
          <Em>set the derivative to zero and solve</Em>.
        </p>
        <p>
          Max altitude: set v(t) = h′(t) = 0. Minimum drag speed: set dD/dV = 0. Peak
          structural load during a maneuver: set the load's derivative to zero. Same move
          every time.
        </p>
        <p>
          One trap: zero velocity does <Em>not</Em> mean zero force. At the rocket's peak,
          gravity is still pulling at −10 m/s² — that's exactly why it comes back down.
        </p>
      </div>
    ),
    rubric: `- A zero derivative means the quantity is momentarily not changing (flat slope).
- At a smooth peak or valley the derivative is zero, so setting the derivative equal to zero and solving locates maxima/minima.
- Applied meaning: e.g. the rocket's max altitude is where velocity (the derivative of height) = 0.
- Bonus (not required to pass): awareness that acceleration/forces need not be zero there.`,
    misconceptions: `- "At the peak everything is zero" — velocity is zero but acceleration (gravity) is not; probe if implied.
- Confusing "derivative is zero" with "function is zero" (the rocket's HEIGHT is 500 m at the top, not zero).
- Believing you find a peak by looking where the function is largest on a plot rather than by solving f′ = 0.`,
    keyIdeas: [
      {
        idea: "zero derivative means momentarily not changing / flat slope",
        patterns: [/not chang/, /stops? chang/, /flat/, /zero slope|slope.*zero/, /momentarily (still|zero)/],
        hint: "When the derivative hits zero the quantity is momentarily frozen — the curve is flat right there.",
      },
      {
        idea: "peaks and valleys happen where the derivative is zero, so you set f′ = 0 and solve",
        patterns: [/set.*(derivative|f'|v).*(zero|0)/, /(derivative|slope).*(zero|0).*(peak|max|top|min)/, /(peak|max|top|min).*(derivative|slope).*(zero|0)/, /solve/],
        hint: "To find a max or min, set the derivative equal to zero and solve for t — no plotting needed.",
      },
      {
        idea: "a physical application: max altitude where velocity = 0 (or min drag, peak load)",
        patterns: [/altitude|height|apogee/, /drag/, /load/],
        hint: "Example: the rocket peaks exactly when its velocity (the derivative of height) passes through zero.",
      },
    ],
    recallPrompt:
      "Explain why a zero derivative marks a peak, and how you would actually find the rocket's maximum altitude from h(t) = 100t − 5t² without plotting it.",
    offlineFollowUp:
      "at the rocket's highest point, is its acceleration also zero? Why or why not?",
    Visual: RocketPlots,
  },
  {
    id: "chain-rule",
    title: "The chain rule: rates multiply along the chain",
    shortTitle: "Chain rule",
    tagline: "meshed gears — density ← altitude ← time",
    explanation: (
      <div className="space-y-3">
        <p>
          Often a quantity doesn't depend on time directly — it depends on something{" "}
          <em>else</em> that depends on time. Air density ρ depends on <Em>altitude</Em>;
          altitude depends on <Em>time</Em> as you climb. How fast is density changing{" "}
          <em>per second</em>?
        </p>
        <p>
          Think of meshed gears. If gear B turns 2× for every turn of gear A, and gear C
          turns 2× for every turn of B, then C turns <Em>2 × 2 = 4×</Em> per turn of A.
          Rates through a chain <Em>multiply</Em>.
        </p>
        <p className="font-mono text-sm" style={{ color: T.inkPrimary }}>
          dρ/dt&nbsp;=&nbsp;dρ/dh&nbsp;×&nbsp;dh/dt
        </p>
        <p>
          In words: (density change per metre of altitude) × (metres of altitude per
          second) = density change per second. Notice how the "per metre" and the "metres
          per" cancel, like units in any engineering calc. That's the whole chain rule —
          everything else is bookkeeping.
        </p>
      </div>
    ),
    rubric: `- The chain rule applies when a quantity depends on an intermediate variable that itself depends on the input (nested/indirect dependence).
- The overall rate is the PRODUCT of the rates along the chain: dρ/dt = dρ/dh · dh/dt (any equivalent variables accepted).
- Some intuition for WHY they multiply (gears, unit cancellation "per metre × metres per second", or equivalent) — not just the formula recited.`,
    misconceptions: `- Adding the rates instead of multiplying them.
- Only reciting "derivative of outside times derivative of inside" with no sense of what the intermediate variable is physically.
- Mixing up which rate is which (e.g. dh/dρ instead of dρ/dh) — check the units of their statement make sense.`,
    keyIdeas: [
      {
        idea: "it applies when one thing depends on another which depends on a third (a chain of dependence)",
        patterns: [/depends? on/, /through|via|indirect/, /inside.*outside|outer.*inner|nested/, /intermediate/],
        hint: "Use the chain rule when the dependence is indirect: density depends on altitude, altitude depends on time.",
      },
      {
        idea: "the rates multiply along the chain",
        patterns: [/multipl/, /product/, /times/],
        hint: "Rates through a chain multiply — like gear ratios: 2× then 2× gives 4× overall.",
      },
      {
        idea: "why: like gear ratios / units cancelling",
        patterns: [/gear/, /cancel/, /per (metre|meter|second|unit)/, /ratio/],
        hint: "Why multiply? Same reason gear ratios multiply — or check the units: (ρ per metre) × (metres per second) = ρ per second.",
      },
    ],
    recallPrompt:
      "Explain the chain rule in your own words: when do you need it, what do you do with the two rates, and why does that work? Use the gears or the density-altitude example.",
    offlineFollowUp:
      "your true airspeed depends on air density, and density depends on altitude: what two rates would you multiply to get how fast true airspeed changes per metre climbed?",
    Visual: GearChain,
  },
  {
    id: "integral-reverse",
    title: "The integral is the reverse trip",
    shortTitle: "Integral = reverse",
    tagline: "acceleration → velocity → position",
    explanation: (
      <div className="space-y-3">
        <p>
          Differentiating took you position → velocity → acceleration. The integral runs
          the trip <Em>backwards</Em>: from acceleration, rebuild velocity; from velocity,
          rebuild position.
        </p>
        <p>
          How? By <Em>accumulating</Em>. If your engine gives a steady 4 m/s² of
          acceleration, then every second adds 4 m/s of velocity — after t seconds you've
          gained 4t. On the graph, that gain is the <Em>area under the acceleration
          curve</Em>. Integral = accumulated area.
        </p>
        <p>
          But the area only tells you the <Em>change</Em>, never where you started. Gaining
          40 m/s means something different if you launched from rest vs. already moving at
          15 m/s. That missing start value is the <Em>constant of integration</Em> — and
          you recover it from the <Em>starting conditions</Em>: launch speed, launch pad
          height. v(t) = v₀ + 4t. The +v₀ is not decoration; it's physics.
        </p>
      </div>
    ),
    rubric: `- Integration is the inverse of differentiation: it takes you back from acceleration to velocity to position.
- Mechanically it accumulates/adds up — graphically the area under the curve gives the total change.
- The integral alone only gives the CHANGE; a constant (v₀, initial height) is unknown and is recovered from starting/initial conditions.
- Ideally an example: constant acceleration a gives v = v₀ + a·t.`,
    misconceptions: `- Thinking the integral gives the value of the quantity rather than its change (forgetting the constant).
- Treating "+C" as an arbitrary ritual rather than a physically meaningful starting condition.
- Confusing "area under velocity" (distance) with "area under acceleration" (velocity change) — probe which area gives which.`,
    keyIdeas: [
      {
        idea: "the integral reverses differentiation: acceleration → velocity → position",
        patterns: [/revers|backward|inverse|opposite|undo/, /acceleration.*velocity|velocity.*position/],
        hint: "Integration undoes differentiation: integrate acceleration to get velocity, integrate velocity to get position.",
      },
      {
        idea: "it accumulates — the area under the curve is the total change",
        patterns: [/area/, /accumulat|add(s|ing)? up|sum/, /build/],
        hint: "Graphically the integral is the area under the curve — it adds up all the little changes into a total change.",
      },
      {
        idea: "the constant is recovered from starting conditions (v₀, initial height)",
        patterns: [/constant/, /initial|start|launch/, /v0|v₀|\+ ?c\b/],
        hint: "The area only gives the change. Where you started — launch speed, pad height — supplies the constant that completes the answer.",
      },
    ],
    recallPrompt:
      "In your own words: what does integrating do, what does the area under a curve represent, and why do starting conditions matter? Walk through acceleration → velocity → position for a rocket.",
    offlineFollowUp:
      "two identical rockets burn the same engine, but one launches from a 100 m cliff. Which parts of their h(t) equations differ, and why?",
    Visual: IntegralBuildup,
  },
];
