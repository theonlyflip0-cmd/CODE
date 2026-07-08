import { useEffect, useState } from "react";
import ApiKeyPanel from "./ApiKeyPanel";
import { CONCEPTS } from "./concepts";
import RecallPanel from "./RecallPanel";
import { T } from "./theme";

const PROGRESS_KEY = "calc-aero-progress";
const APIKEY_KEY = "calc-aero-anthropic-key";

function loadPassed(): string[] {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export default function Tutor() {
  const [passed, setPassed] = useState<string[]>(loadPassed);
  const [apiKey, setApiKey] = useState<string | null>(
    () => localStorage.getItem(APIKEY_KEY) || null,
  );
  // first not-yet-passed concept is the default view
  const firstOpen = CONCEPTS.findIndex((c) => !passed.includes(c.id));
  const [active, setActive] = useState(firstOpen === -1 ? CONCEPTS.length - 1 : firstOpen);

  useEffect(() => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(passed));
  }, [passed]);

  const saveKey = (key: string | null) => {
    setApiKey(key);
    if (key) localStorage.setItem(APIKEY_KEY, key);
    else localStorage.removeItem(APIKEY_KEY);
  };

  const isUnlocked = (index: number) =>
    index === 0 || passed.includes(CONCEPTS[index - 1].id);

  const concept = CONCEPTS[active];
  const conceptPassed = passed.includes(concept.id);
  const Visual = concept.Visual;

  return (
    <div className="min-h-screen" style={{ background: T.page, color: T.inkSecondary }}>
      {/* header */}
      <header className="border-b" style={{ borderColor: T.border, background: T.surface }}>
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: T.position }}>
              CALC / AERO
            </div>
            <h1 className="text-base font-semibold sm:text-lg" style={{ color: T.inkPrimary }}>
              Calculus for Aeronautical Engineering — Active Recall Tutor
            </h1>
          </div>
          <ApiKeyPanel apiKey={apiKey} onSave={saveKey} />
        </div>
      </header>

      {/* progress stepper */}
      <nav className="mx-auto max-w-3xl px-4 pt-6" aria-label="Concept progress">
        <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CONCEPTS.map((c, i) => {
            const done = passed.includes(c.id);
            const unlocked = isUnlocked(i);
            const current = i === active;
            return (
              <li key={c.id}>
                <button
                  onClick={() => unlocked && setActive(i)}
                  disabled={!unlocked}
                  className="w-full rounded border px-3 py-2 text-left text-xs transition-colors disabled:cursor-not-allowed"
                  style={{
                    borderColor: current ? T.position : done ? T.good : T.border,
                    background: current ? T.surfaceRaised : T.surface,
                    opacity: unlocked ? 1 : 0.45,
                  }}
                  aria-current={current ? "step" : undefined}
                >
                  <div className="font-mono" style={{ color: done ? T.good : unlocked ? T.position : T.inkMuted }}>
                    {done ? "✓" : unlocked ? "●" : "🔒"} {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="mt-0.5 leading-tight" style={{ color: unlocked ? T.inkPrimary : T.inkMuted }}>
                    {c.shortTitle}
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* active concept */}
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        <section className="rounded-lg border p-5" style={{ borderColor: T.border, background: T.surface }}>
          <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: T.inkMuted }}>
            Concept {String(active + 1).padStart(2, "0")} / 04 · {concept.tagline}
          </div>
          <h2 className="mb-3 text-xl font-semibold" style={{ color: T.inkPrimary }}>
            {concept.title}
          </h2>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider" style={{ color: T.inkMuted }}>
            01 · The idea
          </h3>
          <div className="text-sm leading-relaxed">{concept.explanation}</div>
        </section>

        <section className="rounded-lg border p-5" style={{ borderColor: T.border, background: T.surface }}>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: T.inkMuted }}>
            02 · See it move
          </h3>
          <Visual />
        </section>

        <section className="rounded-lg border p-5" style={{ borderColor: T.border, background: T.surface }}>
          <RecallPanel
            key={concept.id}
            concept={concept}
            apiKey={apiKey}
            passed={conceptPassed}
            onPassed={() => setPassed((p) => (p.includes(concept.id) ? p : [...p, concept.id]))}
            onContinue={() => setActive((a) => Math.min(a + 1, CONCEPTS.length - 1))}
            isLast={active === CONCEPTS.length - 1}
          />
        </section>

        <footer className="pb-8 text-center text-xs" style={{ color: T.inkMuted }}>
          Strictly practical calculus — no epsilon-delta limits, no proofs. Teach → explain back →
          find gaps → re-teach → repeat until fluent.
        </footer>
      </main>
    </div>
  );
}
