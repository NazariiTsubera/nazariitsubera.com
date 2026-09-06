"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { post } from "./api";

type JobState = { id: string | null; status?: string; steps?: { name: string; status: string }[]; error?: string | null };

type Props = {
  vendorId: string;
  status: string;
  previewUrl: string | null;
  previewToken: string;
  smsBody: string;
  phone: string;
  hasPublished: boolean;
};

export function VendorActions({ vendorId, status, previewUrl, previewToken, smsBody, phone, hasPublished }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [job, setJob] = useState<JobState | null>(null);
  const [copied, setCopied] = useState(false);

  // Poll only while a job is actually running; the durable row in Postgres is the source.
  useEffect(() => {
    if (job?.status !== "queued" && job?.status !== "running") return;
    const timer = setInterval(async () => {
      const next = (await fetch(`/api/console/jobs?vendorId=${vendorId}`).then((r) => r.json())) as JobState;
      setJob(next);
      if (next.status === "succeeded" || next.status === "failed") router.refresh();
    }, 3000);
    return () => clearInterval(timer);
  }, [job?.status, vendorId, router]);

  async function act(body: Record<string, unknown>, label: string) {
    setPending(label);
    setError(null);
    try {
      const result = (await post("/api/console/actions", body)) as { jobId?: string };
      if (result.jobId) setJob({ id: result.jobId, status: "queued" });
      router.refresh();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Action failed");
    } finally {
      setPending(null);
    }
  }

  const tokenUrl = previewUrl ? `${previewUrl}/?p=${previewToken}` : null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="ui-h2">Site</h2>

      <button
        type="button"
        onClick={() => act({ action: "generate", vendorId }, "generate")}
        disabled={pending !== null}
        className="ui-btn ui-btn-lg ui-btn-primary"
      >
        {pending === "generate" ? "Starting…" : hasPublished ? "Regenerate site" : "Generate site"}
      </button>

      {job?.status ? (
        <p className="ui-note">
          Job {job.status}
          {job.steps?.length ? ` · ${job.steps.map((s) => `${s.name}:${s.status}`).join(", ")}` : ""}
          {job.error ? ` · ${job.error}` : ""}
        </p>
      ) : null}

      {tokenUrl ? (
        <div className="ui-card flex flex-col gap-2">
          <a href={tokenUrl} target="_blank" rel="noreferrer" className="break-all py-1 text-sm underline">
            {previewUrl}
          </a>
          <div className="flex gap-2">
            <a href={`sms:${phone}?&body=${encodeURIComponent(smsBody)}`} className="ui-btn ui-btn-accent flex-1">
              Text vendor
            </a>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(tokenUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="ui-btn ui-btn-quiet flex-1"
            >
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => act({ action: "extend", vendorId }, "extend")} className="ui-btn ui-btn-quiet">
          Extend preview
        </button>
        <button type="button" onClick={() => act({ action: "republish", vendorId }, "republish")} className="ui-btn ui-btn-quiet">
          Republish
        </button>
        <button type="button" onClick={() => act({ action: "won", vendorId, tier: "storefront" }, "won")} className="ui-btn ui-btn-quiet">
          Mark won
        </button>
        <button type="button" onClick={() => act({ action: "lost", vendorId }, "lost")} className="ui-btn ui-btn-quiet">
          Mark lost
        </button>
        {hasPublished ? (
          <button type="button" onClick={() => act({ action: "unpublish", vendorId }, "unpublish")} className="ui-btn ui-btn-quiet col-span-2">
            Unpublish
          </button>
        ) : null}
      </div>

      <p className="font-mono text-xs uppercase tracking-wide text-faint">Status: {status}</p>
      {error ? <p className="ui-error">{error}</p> : null}
    </section>
  );
}
