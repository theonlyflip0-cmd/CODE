import { useState } from "react";
import { T } from "./theme";

export default function ApiKeyPanel({
  apiKey,
  onSave,
}: {
  apiKey: string | null;
  onSave: (key: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(apiKey ?? "");

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded border px-3 py-1.5 text-xs"
        style={{
          borderColor: apiKey ? T.good : T.borderStrong,
          color: apiKey ? T.good : T.inkSecondary,
          background: T.surfaceRaised,
        }}
      >
        {apiKey ? "● AI teacher connected" : "○ Settings — connect AI teacher"}
      </button>

      {open && (
        <div
          className="absolute right-0 z-20 mt-2 w-80 rounded border p-4 shadow-xl"
          style={{ borderColor: T.borderStrong, background: T.surfaceRaised }}
        >
          <h4 className="mb-1 text-sm font-semibold" style={{ color: T.inkPrimary }}>
            Anthropic API key
          </h4>
          <p className="mb-2 text-xs" style={{ color: T.inkSecondary }}>
            Grading calls go from your browser straight to the Claude API (model{" "}
            <span className="font-mono">claude-opus-4-8</span>). The key is stored only in this
            browser's localStorage — never sent anywhere else.
          </p>
          <input
            type="password"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="sk-ant-…"
            className="mb-2 w-full rounded border px-2 py-1.5 font-mono text-xs outline-none"
            style={{ borderColor: T.borderStrong, background: T.page, color: T.inkPrimary }}
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                onSave(draft.trim() || null);
                setOpen(false);
              }}
              className="rounded px-3 py-1.5 text-xs font-medium"
              style={{ background: T.position, color: "#fff" }}
            >
              Save
            </button>
            {apiKey && (
              <button
                onClick={() => {
                  setDraft("");
                  onSave(null);
                  setOpen(false);
                }}
                className="rounded border px-3 py-1.5 text-xs"
                style={{ borderColor: T.borderStrong, color: T.inkSecondary }}
              >
                Remove key
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
