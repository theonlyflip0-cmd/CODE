// Build the offline demo bundle (hash router + demo data, relative base) and
// inline its CSS + JS into one self-contained HTML file that opens straight
// from disk (file://). Output: kral-durum-demo.html
//
//   npm run demo
import { execSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = "dist-demo";

// 1) Build with hash routing + relative asset paths so file:// works.
console.log("• building demo bundle…");
execSync(`npx vite build --base=./ --outDir ${OUT_DIR}`, {
  stdio: "inherit",
  env: { ...process.env, VITE_HASH_ROUTER: "1" },
});

// 2) Inline the emitted CSS + JS into a single HTML document.
const assetsDir = join(OUT_DIR, "assets");
const files = readdirSync(assetsDir);
const cssFile = files.find((f) => f.endsWith(".css"));
const jsFile = files.find((f) => f.endsWith(".js"));

const css = readFileSync(join(assetsDir, cssFile), "utf8");
const js = readFileSync(join(assetsDir, jsFile), "utf8");
const safeJs = js.replace(/<\/script>/gi, "<\\/script>");

// Bake the tandır video straight into the HTML as a data URI so the demo is
// truly ONE file — no separate mp4 to forget. Fully in-memory, so scrub
// seeking is instant. (~4.9 MB mp4 → ~6.5 MB base64.)
let videoTag = "";
const VIDEO = "public/tandir-360.mp4";
if (existsSync(VIDEO)) {
  const b64 = readFileSync(VIDEO).toString("base64");
  videoTag = `<script>window.__TANDIR_DATA__="data:video/mp4;base64,${b64}";</script>\n    `;
} else {
  console.log(`• NOTE: ${VIDEO} not found — the intro will use the ember-disc fallback.`);
}

const html = `<!doctype html>
<html lang="nl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Kral Durum · To Go — Demo</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,600;1,700&display=swap" rel="stylesheet" />
    <style>${css}</style>
  </head>
  <body>
    <div id="root"></div>
    ${videoTag}<script type="module">${safeJs}</script>
  </body>
</html>
`;

writeFileSync("kral-durum-demo.html", html);
console.log(`• wrote kral-durum-demo.html (${(html.length / 1024 / 1024).toFixed(1)} MB, video baked in)`);
console.log("  Open kral-durum-demo.html in any browser — ONE file, fully offline.");
