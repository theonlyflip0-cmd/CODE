import { useState } from "react";
import { grade } from "./grader";
import { T } from "./theme";
import type { Attempt, Concept } from "./types";

export default function RecallPanel({
  concept,
  apiKey,
  passed,
  onPassed,
  onContinue,
  isLast,
}: {
  concept: Concept;
  apiKey: string | null;
  passed: boolean;
  onPassed: () => void;
  onContinue: () => void;
  isLast: boolean;
}) {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const answer = input.trim();
    if (!answer || loading) return;
    setLoading(true);
    setError(null);
    try {
      const result = await grade(concept, attempts, answer, apiKey);
      setAttempts((a) => [...a, { student: answer, result }]);
      setInput("");
      if (result.passed) onPassed();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const latest = attempts[attempts.length - 1];

  return (
    <div>
      <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider" style={{ color: T.inkMuted }}>
        03 · Explain it back
      </h3>
      <p className="mb-3 text-sm" style={{ color: T.inkSecondary }}>
        {concept.recallPrompt}
      </p>

      {!apiKey && (
        <div
          className="mb-3 rounded border px-3 py-2 text-xs"
          style={{ borderColor: T.borderStrong, background: T.surfaceRaised, color: T.inkSecondary }}
        >
          <strong style={{ color: T.accel }}>Offline mode:</strong> no Anthropic API key set, so a basic
          keyword check will grade you instead of the AI teacher. Add a key in{" "}
          <strong style={{ color: T.inkPrimary }}>Settings</strong> (top right) for real feedback.
        </div>
      )}

      {/* feedback history */}
      {attempts.length > 0 && (
        <div className="mb-4 space-y-3">
          {attempts.map((a, i) => (
            <div key={i} className="space-y-2">
              <div
                className="rounded border px-3 py-2 text-sm"
                style={{ borderColor: T.border, background: T.surfaceRaised, color: T.inkPrimary }}
              >
                <div className="mb-1 text-[11px] uppercase tracking-wider" style={{ color: T.inkMuted }}>
                  You wrote
                </div>
                <div className="whitespace-pre-wrap">{a.student}</div>
              </div>
              <FeedbackCard result={a.result} />
            </div>
          ))}
        </div>
      )}

      {passed ? (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded border px-4 py-3"
          style={{ borderColor: T.good, background: "rgba(12,163,12,0.08)" }}
        >
          <div className="text-sm" style={{ color: T.inkPrimary }}>
            <span style={{ color: T.good }}>✓ Concept cleared.</span>{" "}
            {isLast
              ? "That's the full loop — all four concepts fluent."
              : "The next concept is unlocked."}
          </div>
          {!isLast && (
            <button
              onClick={onContinue}
              className="rounded px-4 py-2 text-sm font-medium"
              style={{ background: T.position, color: "#fff" }}
            >
              Continue →
            </button>
          )}
        </div>
      ) : (
        <div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={5}
            placeholder={
              latest
                ? "Answer the follow-up question (or re-explain the whole idea, covering the gaps)…"
                : "Type your explanation as if teaching a classmate — plain words beat jargon…"
            }
            className="w-full resize-y rounded border px-3 py-2 text-sm outline-none focus:ring-1"
            style={{
              borderColor: T.borderStrong,
              background: T.page,
              color: T.inkPrimary,
            }}
            disabled={loading}
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-xs" style={{ color: T.inkMuted }}>
              {apiKey ? "Graded by the AI teacher — it won't let you pass on vibes." : "Offline keyword grading."}
            </span>
            <button
              onClick={submit}
              disabled={loading || input.trim().length === 0}
              className="rounded px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-40"
              style={{ background: T.position, color: "#fff" }}
            >
              {loading ? "Grading…" : latest ? "Submit answer" : "Check my explanation"}
            </button>
          </div>
          {error && (
            <div className="mt-2 rounded border px-3 py-2 text-sm" style={{ borderColor: T.critical, color: T.serious }}>
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FeedbackCard({ result }: { result: import("./types").GradeResult }) {
  return (
    <div
      className="rounded border px-3 py-3 text-sm"
      style={{
        borderColor: result.passed ? T.good : T.borderStrong,
        background: T.surface,
        borderLeftWidth: 3,
        borderLeftColor: result.passed ? T.good : T.accel,
      }}
    >
      <div className="mb-1 text-[11px] uppercase tracking-wider" style={{ color: T.inkMuted }}>
        {result.offline ? "Offline check" : "AI teacher"} · {result.passed ? "passed" : "not yet"}
      </div>
      {result.praise && (
        <p className="mb-2" style={{ color: T.good }}>
          {result.praise}
        </p>
      )}
      {result.gaps.length > 0 && (
        <ul className="mb-2 list-disc space-y-1 pl-5" style={{ color: T.serious }}>
          {result.gaps.map((g, i) => (
            <li key={i}>{g}</li>
          ))}
        </ul>
      )}
      {result.reteach && (
        <p className="mb-2 rounded px-3 py-2" style={{ background: T.surfaceRaised, color: T.inkPrimary }}>
          {result.reteach}
        </p>
      )}
      {result.followUp && (
        <p style={{ color: T.inkSecondary }}>
          <span className="font-semibold" style={{ color: T.position }}>
            {result.passed ? "Stretch question: " : "Check question: "}
          </span>
          {result.followUp}
        </p>
      )}
    </div>
  );
}
