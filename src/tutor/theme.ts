// Chart + UI color roles, validated with the dataviz palette validator
// against the dark card surface (#131722): lightness band, chroma floor,
// CVD separation and 3:1 contrast all pass for the three series hues.
export const T = {
  page: "#0b0e14",
  surface: "#131722",
  surfaceRaised: "#1a2030",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.16)",
  inkPrimary: "#f4f6f8",
  inkSecondary: "#aab2bf",
  inkMuted: "#7a8394",
  grid: "#232a38",
  axis: "#3a4356",

  // series (identity is fixed across the whole app)
  position: "#3987e5", // blue — position / altitude
  velocity: "#199e70", // aqua — velocity / rates
  accel: "#c98500", // amber — acceleration / tangent slope

  good: "#0ca30c",
  serious: "#ec835a",
  critical: "#d03b3b",
} as const;
