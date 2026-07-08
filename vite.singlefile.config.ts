// Builds the whole app into one self-contained HTML file (dist-single/index.html)
// that can be opened directly from disk — no server needed.
// Run with: npm run build:single
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { viteSingleFile } from "vite-plugin-singlefile";
import path from "path";

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist-single",
  },
});
