import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    // File-based routing: generates src/routeTree.gen.ts from src/routes/*
    tanstackRouter({ target: "react", autoCodeSplitting: false }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // For the offline single-file demo (npm run demo) inline every asset as a
    // data URI so product photos end up baked into the one HTML file.
    assetsInlineLimit: process.env.VITE_HASH_ROUTER === "1" ? 1_000_000_000 : 4096,
  },
  server: {
    port: 5173,
  },
});
