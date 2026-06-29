import { createRootRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";

function RootLayout() {
  // Light, single-language document setup; per-page <T> handles UI copy.
  useEffect(() => {
    document.documentElement.lang = "nl";
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Outlet />
    </div>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-center">
      <p className="text-5xl">🔥</p>
      <h1 className="text-2xl font-bold">Pagina niet gevonden</h1>
      <a href="/" className="text-[var(--royal-gold)] underline">
        Terug naar Kral Durum
      </a>
    </div>
  ),
});
