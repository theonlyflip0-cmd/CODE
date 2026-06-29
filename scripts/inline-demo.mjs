// Build the offline demo bundle (hash router + demo data, relative base) and
// inline its CSS + JS into one self-contained HTML file that opens straight
// from disk (file://). Output: kral-durum-demo.html
//
//   npm run demo
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
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

const html = `<!doctype html>
<html lang="nl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Kral Durum · To Go — Demo</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
    <style>${css}</style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">${safeJs}</script>
  </body>
</html>
`;

writeFileSync("kral-durum-demo.html", html);
console.log(`• wrote kral-durum-demo.html (${(html.length / 1024).toFixed(0)} kB)`);
console.log("  Open it in any browser — runs fully offline with demo data.");
