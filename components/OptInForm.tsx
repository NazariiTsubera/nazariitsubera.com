"use client";

import { useState } from "react";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "error" | "success";

export default function OptInForm({
  cta = "Start a conversation",
  hint = "Tell me your business. I'll reply personally — no sales team, no jargon.",
}: {
  cta?: string;
  hint?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim();

    if (!EMAIL_PATTERN.test(value)) {
      setStatus("error");
      return;
    }

    // MVP: no backend yet. A Supabase insert drops in here later.
    setStatus("success");
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="flex items-center gap-3 rounded-[10px] border border-line-strong bg-panel px-[18px] py-4 text-[0.95rem] leading-relaxed text-ink shadow-soft"
      >
        <span className="grid h-7 w-7 flex-none place-items-center rounded-[6px] bg-vivid-line font-mono text-white">
          +
        </span>
        <p>Got it. I&apos;ll be in touch personally within a day or two.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          name="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@yourcompany.com"
          aria-label="Email address"
          aria-invalid={status === "error"}
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (status === "error") setStatus("idle");
          }}
          className="field"
        />
        <button type="submit" className="btn-gradient flex-none px-6 py-3">
          {cta}
        </button>
      </div>
      {status === "error" ? (
        <p role="alert" className="mt-2.5 font-mono text-[0.72rem] text-magenta">
          Enter a valid email address.
        </p>
      ) : (
        <p className="mt-2.5 font-mono text-[0.72rem] text-muted-soft">{hint}</p>
      )}
    </form>
  );
}
