#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// Generate the tandır hero video via Google Gemini's Veo model and save it to
// `public/tandir-360.mp4`. Standalone — not part of the app bundle.
//
//   node --env-file=.env scripts/generate-tandir.mjs
//
// ⚠ This hits a paid API. One generation ~= a few $. Don't auto-retry.
// Overrides via env:
//   GEMINI_API_KEY  (required)
//   VEO_MODEL       default "veo-3.1-generate-preview"
//                   alternates: "veo-3.1-fast-generate-preview",
//                               "veo-3.1-lite-generate-preview"
//   OUT_PATH        default "public/tandir-360.mp4"
// ─────────────────────────────────────────────────────────────────────────────

import { writeFile, mkdir, stat } from "node:fs/promises";

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) {
  console.error(
    "❌ GEMINI_API_KEY is not set.\n" +
      "   Copy .env.example → .env, fill in your key, then re-run:\n" +
      "     node --env-file=.env scripts/generate-tandir.mjs",
  );
  process.exit(1);
}

const MODEL = process.env.VEO_MODEL || "veo-3.1-generate-preview";
const OUT = process.env.OUT_PATH || "public/tandir-360.mp4";
const BASE = "https://generativelanguage.googleapis.com/v1beta";

const PROMPT =
  "A traditional Turkish tandır clay oven centered on a pure black background, " +
  "warm fire glow and embers inside the oven opening, handcrafted terracotta " +
  "texture, cinematic commercial product photography lighting. Slow smooth " +
  "360-degree turntable rotation around the vertical axis, camera locked and " +
  "static, one full revolution, seamless loop, background stays pure black, " +
  "no camera movement, no zoom.";

const NEGATIVE =
  "text, watermark, logo, hands, people, camera shake, jitter, zoom, dolly, " +
  "pan, cuts, edits, background changes, coloured background";

const HEADERS = { "x-goog-api-key": KEY, "content-type": "application/json" };

function short(s, n = 400) {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

async function main() {
  console.log(`• Model:  ${MODEL}`);
  console.log(`• Output: ${OUT}`);
  console.log("• Kicking off video generation (this can take 1–5 min)…");

  const kick = await fetch(`${BASE}/models/${MODEL}:predictLongRunning`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      instances: [{ prompt: PROMPT }],
      parameters: {
        aspectRatio: "16:9",
        personGeneration: "allow_all",
        negativePrompt: NEGATIVE,
      },
    }),
  });

  if (!kick.ok) {
    console.error(`❌ Kickoff failed (HTTP ${kick.status}):\n${short(await kick.text())}`);
    process.exit(2);
  }

  const kickJson = await kick.json();
  const opName = kickJson.name;
  if (!opName) {
    console.error("❌ No operation name returned:\n" + JSON.stringify(kickJson, null, 2));
    process.exit(2);
  }
  console.log(`  operation: ${opName}`);

  // Poll every 10 s, up to 15 min.
  const started = Date.now();
  const TIMEOUT_MS = 15 * 60_000;
  let response;
  while (true) {
    await new Promise((r) => setTimeout(r, 10_000));
    const poll = await fetch(`${BASE}/${opName}`, { headers: HEADERS });
    if (!poll.ok) {
      console.error(`❌ Poll failed (HTTP ${poll.status}):\n${short(await poll.text())}`);
      process.exit(3);
    }
    const j = await poll.json();
    process.stdout.write(".");
    if (j.done) {
      process.stdout.write("\n");
      if (j.error) {
        console.error("❌ Operation errored:\n" + JSON.stringify(j.error, null, 2));
        process.exit(4);
      }
      response = j.response;
      break;
    }
    if (Date.now() - started > TIMEOUT_MS) {
      console.error("\n❌ Timed out after 15 min.");
      process.exit(5);
    }
  }

  // Extract the download URI, tolerating a few response shapes.
  const samples =
    response?.generateVideoResponse?.generatedSamples ??
    response?.generatedSamples ??
    response?.videos ??
    [];
  const first = samples[0] ?? {};
  const uri = first?.video?.uri ?? first?.uri;
  if (!uri) {
    console.error(
      "❌ Couldn't find a video URI in the response:\n" +
        JSON.stringify(response, null, 2),
    );
    process.exit(6);
  }
  console.log(`• Downloading video…`);
  const downloadUrl = uri.includes("alt=media")
    ? uri
    : uri + (uri.includes("?") ? "&" : "?") + "alt=media";

  const dl = await fetch(downloadUrl, { headers: { "x-goog-api-key": KEY } });
  if (!dl.ok) {
    console.error(`❌ Download failed (HTTP ${dl.status}):\n${short(await dl.text())}`);
    process.exit(7);
  }
  const bytes = new Uint8Array(await dl.arrayBuffer());
  await mkdir("public", { recursive: true });
  await writeFile(OUT, bytes);

  const s = await stat(OUT);
  const mb = (s.size / 1024 / 1024).toFixed(2);
  console.log(`✅ Wrote ${OUT}`);
  console.log(`   size: ${s.size.toLocaleString()} bytes (~${mb} MB)`);
  console.log(
    "\n   Next: `npm run demo` to inline it into kral-durum-demo.html, or\n" +
      "        `npm run dev` and scroll the homepage to see the tandır spin.",
  );
}

main().catch((e) => {
  console.error("❌ Unexpected error:", e);
  process.exit(9);
});
