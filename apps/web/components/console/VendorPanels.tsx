"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { post } from "./api";

const BUTTON = "min-h-12 rounded-lg px-4 text-sm font-medium";
const FIELD = "w-full rounded-lg border border-ink/20 bg-white p-3 text-base";

function useAction(vendorId: string) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  const run = async (body: Record<string, unknown>, label: string): Promise<boolean> => {
    setPending(label);
    setError(null);
    try {
      await post("/api/console/actions", { vendorId, ...body });
      router.refresh();
      return true;
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Action failed");
      return false;
    } finally {
      setPending(null);
    }
  };

  return { run, error, pending };
}

export function RegeneratePanel({ vendorId, hasPublished }: { vendorId: string; hasPublished: boolean }) {
  const { run, error, pending } = useAction(vendorId);
  const [instruction, setInstruction] = useState("");

  if (!hasPublished) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-serif text-xl">Change the site</h2>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => run({ action: "regenerate_content" }, "content")} className={`${BUTTON} bg-ink/10`}>
          {pending === "content" ? "Working…" : "New copy"}
        </button>
        <button type="button" onClick={() => run({ action: "regenerate_design" }, "design")} className={`${BUTTON} bg-ink/10`}>
          {pending === "design" ? "Working…" : "New design"}
        </button>
        <button type="button" onClick={() => run({ action: "reprocess_assets" }, "assets")} className={`${BUTTON} col-span-2 bg-ink/10`}>
          {pending === "assets" ? "Working…" : "Reprocess photos"}
        </button>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Ask for one change
        <textarea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          rows={2}
          placeholder="Make the hero darker. Put the bowls first."
          className={FIELD}
        />
      </label>
      <button
        type="button"
        disabled={instruction.trim().length < 4 || pending !== null}
        onClick={async () => {
          if (await run({ action: "edit_design", instruction: instruction.trim() }, "edit")) setInstruction("");
        }}
        className={`${BUTTON} bg-ink text-on-dark disabled:opacity-50`}
      >
        {pending === "edit" ? "Sending…" : "Apply change"}
      </button>
      {error ? <p className="text-sm text-magenta-ink">{error}</p> : null}
    </section>
  );
}

export function SettingsPanel({
  vendorId,
  designNotes,
  themeOverride,
  showInPortfolio,
  themeIds,
}: {
  vendorId: string;
  designNotes: string | null;
  themeOverride: string | null;
  showInPortfolio: boolean;
  themeIds: readonly string[];
}) {
  const { run, error, pending } = useAction(vendorId);
  const [notes, setNotes] = useState(designNotes ?? "");

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-serif text-xl">Settings</h2>

      <label className="flex flex-col gap-1 text-sm">
        Design notes
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => run({ action: "notes", designNotes: notes.trim() || null }, "notes")}
          rows={2}
          placeholder="How this vendor should feel."
          className={FIELD}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Fallback theme
        <select
          defaultValue={themeOverride ?? ""}
          onChange={(e) => run({ action: "theme", themeId: e.target.value || null }, "theme")}
          className="min-h-12 w-full rounded-lg border border-ink/20 bg-white px-3 text-base"
        >
          <option value="">Chosen from the tone</option>
          {themeIds.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          defaultChecked={showInPortfolio}
          onChange={(e) => run({ action: "portfolio", show: e.target.checked }, "portfolio")}
          className="size-5"
        />
        Show on the storefront portfolio
      </label>

      {pending ? <p className="text-sm text-mono">Saving…</p> : null}
      {error ? <p className="text-sm text-magenta-ink">{error}</p> : null}
    </section>
  );
}

export function ContentEditor({ vendorId, content }: { vendorId: string; content: unknown }) {
  const { run, error, pending } = useAction(vendorId);
  const [text, setText] = useState(() => JSON.stringify(content, null, 2));
  const [parseError, setParseError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  if (!content) return null;

  return (
    <section className="flex flex-col gap-3">
      <button type="button" onClick={() => setOpen(!open)} className="text-left font-serif text-xl">
        Content {open ? "▾" : "▸"}
      </button>
      {open ? (
        <>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setParseError(null);
            }}
            rows={16}
            spellCheck={false}
            className={`${FIELD} font-mono text-xs`}
          />
          <button
            type="button"
            disabled={pending !== null}
            onClick={() => {
              try {
                run({ action: "content", content: JSON.parse(text) }, "content");
              } catch {
                setParseError("That is not valid JSON.");
              }
            }}
            className={`${BUTTON} bg-ink text-on-dark disabled:opacity-50`}
          >
            {pending === "content" ? "Saving…" : "Save and republish"}
          </button>
          {parseError ? <p className="text-sm text-magenta-ink">{parseError}</p> : null}
          {error ? <p className="text-sm text-magenta-ink">{error}</p> : null}
        </>
      ) : null}
    </section>
  );
}
