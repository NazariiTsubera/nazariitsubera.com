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
  const button = "min-h-12 rounded-lg px-4 text-sm font-medium";

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-serif text-xl">Site</h2>

      <button
        type="button"
        onClick={() => act({ action: "generate", vendorId }, "generate")}
        disabled={pending !== null}
        className={`${button} bg-ink text-on-dark disabled:opacity-50`}
      >
        {pending === "generate" ? "Starting…" : hasPublished ? "Regenerate site" : "Generate site"}
      </button>

      {job?.status ? (
        <p className="text-sm text-mono">
          Job {job.status}
          {job.steps?.length ? ` · ${job.steps.map((s) => `${s.name}:${s.status}`).join(", ")}` : ""}
          {job.error ? ` · ${job.error}` : ""}
        </p>
      ) : null}

      {tokenUrl ? (
        <div className="flex flex-col gap-2 rounded-lg border border-ink/15 bg-white p-3">
          <a href={tokenUrl} target="_blank" rel="noreferrer" className="break-all text-sm underline">
            {previewUrl}
          </a>
          <div className="flex gap-2">
            <a href={`sms:${phone}?&body=${encodeURIComponent(smsBody)}`} className={`${button} flex-1 bg-eyebrow text-center leading-[3rem] text-white`}>
              Text vendor
            </a>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(tokenUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className={`${button} flex-1 bg-ink/10`}
            >
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => act({ action: "extend", vendorId }, "extend")} className={`${button} bg-ink/10`}>
          Extend preview
        </button>
        <button type="button" onClick={() => act({ action: "republish", vendorId }, "republish")} className={`${button} bg-ink/10`}>
          Republish
        </button>
        <button type="button" onClick={() => act({ action: "won", vendorId, tier: "storefront" }, "won")} className={`${button} bg-ink/10`}>
          Mark won
        </button>
        <button type="button" onClick={() => act({ action: "lost", vendorId }, "lost")} className={`${button} bg-ink/10`}>
          Mark lost
        </button>
        {hasPublished ? (
          <button type="button" onClick={() => act({ action: "unpublish", vendorId }, "unpublish")} className={`${button} col-span-2 bg-ink/10`}>
            Unpublish
          </button>
        ) : null}
      </div>

      <p className="text-xs text-faint">Status: {status}</p>
      {error ? <p className="text-sm text-magenta-ink">{error}</p> : null}
    </section>
  );
}
