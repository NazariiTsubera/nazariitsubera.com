"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { post } from "./api";

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
      <h2 className="ui-h2">Change the site</h2>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => run({ action: "regenerate_content" }, "content")} className="ui-btn ui-btn-quiet">
          {pending === "content" ? "Working…" : "New copy"}
        </button>
        <button type="button" onClick={() => run({ action: "regenerate_design" }, "design")} className="ui-btn ui-btn-quiet">
          {pending === "design" ? "Working…" : "New design"}
        </button>
        <button type="button" onClick={() => run({ action: "reprocess_assets" }, "assets")} className="ui-btn ui-btn-quiet col-span-2">
          {pending === "assets" ? "Working…" : "Reprocess photos"}
        </button>
      </div>

      <label className="ui-label">
        Ask for one change
        <textarea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          rows={2}
          placeholder="Make the hero darker. Put the bowls first."
          className="ui-field"
        />
      </label>
      <button
        type="button"
        disabled={instruction.trim().length < 4 || pending !== null}
        onClick={async () => {
          if (await run({ action: "edit_design", instruction: instruction.trim() }, "edit")) setInstruction("");
        }}
        className="ui-btn ui-btn-primary"
      >
        {pending === "edit" ? "Sending…" : "Apply change"}
      </button>
      {error ? <p className="ui-error">{error}</p> : null}
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
      <h2 className="ui-h2">Settings</h2>

      <label className="ui-label">
        Design notes
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => run({ action: "notes", designNotes: notes.trim() || null }, "notes")}
          rows={2}
          placeholder="How this vendor should feel."
          className="ui-field"
        />
      </label>

      <label className="ui-label">
        Fallback theme
        <select
          defaultValue={themeOverride ?? ""}
          onChange={(e) => run({ action: "theme", themeId: e.target.value || null }, "theme")}
          className="ui-field"
        >
          <option value="">Chosen from the tone</option>
          {themeIds.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </label>

      <label className="flex min-h-11 items-center gap-3 text-sm text-body">
        <input
          type="checkbox"
          defaultChecked={showInPortfolio}
          onChange={(e) => run({ action: "portfolio", show: e.target.checked }, "portfolio")}
          className="size-6"
        />
        Show on the storefront portfolio
      </label>

      {pending ? <p className="ui-note">Saving…</p> : null}
      {error ? <p className="ui-error">{error}</p> : null}
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
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="ui-h2 flex min-h-11 items-center gap-2 text-left">
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
            className="ui-field font-mono text-xs"
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
            className="ui-btn ui-btn-primary"
          >
            {pending === "content" ? "Saving…" : "Save and republish"}
          </button>
          {parseError ? <p className="ui-error">{parseError}</p> : null}
          {error ? <p className="ui-error">{error}</p> : null}
        </>
      ) : null}
    </section>
  );
}
