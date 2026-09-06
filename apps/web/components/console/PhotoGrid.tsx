"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { post, uploadFile } from "./api";

export type AssetRow = {
  id: string;
  kind: "product" | "scene" | "person";
  isHero: boolean;
  orderIndex: number;
  alt: string | null;
  previewUrl: string;
};

const KINDS = ["product", "scene", "person"] as const;

export function PhotoGrid({ vendorId, assets }: { vendorId: string; assets: AssetRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  async function onFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])];
    event.target.value = "";
    if (files.length === 0) return;

    setBusy(true);
    setError(null);
    try {
      for (const [index, file] of files.entries()) {
        setProgress(`Uploading ${index + 1} of ${files.length}…`);
        await uploadFile(vendorId, "asset", file, file.type || "image/jpeg");
      }
      router.refresh();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  async function act(body: Record<string, unknown>) {
    setError(null);
    try {
      await post("/api/console/assets", body);
      router.refresh();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Could not update");
    }
  }

  async function move(id: string, direction: -1 | 1) {
    const order = assets.map((a) => a.id);
    const from = order.indexOf(id);
    const to = from + direction;
    if (to < 0 || to >= order.length) return;
    [order[from], order[to]] = [order[to], order[from]];
    await act({ action: "reorder", vendorId, ids: order });
  }

  const counts = {
    product: assets.filter((a) => a.kind === "product").length,
    scene: assets.filter((a) => a.kind === "scene").length,
    person: assets.filter((a) => a.kind === "person").length,
  };

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="ui-h2">Photos</h2>
        <span className="ui-note">
          {counts.scene} wide · {counts.product} products · {counts.person} person
        </span>
      </div>

      <label className="ui-btn ui-btn-lg cursor-pointer border border-dashed border-ink/30 bg-white">
        {busy ? (progress ?? "Uploading…") : "Add photos"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={onFiles}
          disabled={busy}
          className="sr-only"
        />
      </label>
      {error ? <p className="ui-error">{error}</p> : null}

      <ul className="grid grid-cols-2 gap-3">
        {assets.map((asset, index) => (
          <li key={asset.id} className="ui-card flex flex-col gap-2 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset.previewUrl}
              alt={asset.alt ?? ""}
              className="aspect-square w-full rounded object-cover"
              loading="lazy"
            />
            <div className="flex gap-1">
              {KINDS.map((kind) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => act({ action: "kind", id: asset.id, kind })}
                  className={`ui-btn ui-btn-sm flex-1 capitalize ${
                    asset.kind === kind ? "ui-btn-primary" : "ui-btn-quiet"
                  }`}
                >
                  {kind}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => act({ action: "hero", id: asset.id })}
                className={`ui-btn ui-btn-sm flex-1 ${asset.isHero ? "ui-btn-accent" : "ui-btn-quiet"}`}
              >
                {asset.isHero ? "Hero" : "Set hero"}
              </button>
              <button type="button" onClick={() => move(asset.id, -1)} disabled={index === 0} aria-label="Move earlier" className="ui-btn ui-btn-sm ui-btn-quiet w-10 px-0">
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(asset.id, 1)}
                disabled={index === assets.length - 1}
                aria-label="Move later"
                className="ui-btn ui-btn-sm ui-btn-quiet w-10 px-0"
              >
                ↓
              </button>
              <button type="button" onClick={() => act({ action: "remove", id: asset.id })} aria-label="Remove photo" className="ui-btn ui-btn-sm ui-btn-quiet w-10 px-0">
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
