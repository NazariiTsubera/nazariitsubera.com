"use client";

import { useState } from "react";

import { LINKS } from "./links";

type Field = "name" | "email" | "company" | "helpRequest";
type State =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "error"; message?: string; errors?: Partial<Record<Field, string>> };

const FIELD = "w-full border border-ink/[.28] bg-paper px-3.5 py-3 text-ink outline-none transition-colors focus:border-accent";
const LABEL = "l mb-2 block text-muted";

/** Posts to /api/leads (the HubSpot intake). Direct email stays visible next to it on the page. */
export function ContactForm() {
  const [state, setState] = useState<State>({ kind: "idle" });
  const [startedAt] = useState(() => Date.now());

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState({ kind: "sending" });
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, startedAt }),
      });
      const body = (await response.json()) as { ok: boolean; message?: string; errors?: Partial<Record<Field, string>> };
      if (body.ok) {
        form.reset();
        setState({ kind: "sent" });
      } else {
        setState({ kind: "error", message: body.message, errors: body.errors });
      }
    } catch {
      setState({ kind: "error", message: "I couldn’t send that just now. Please try again or email me directly." });
    }
  }

  if (state.kind === "sent") {
    return (
      <div className="border border-accent/30 bg-accent/5 px-7 py-8">
        <h2 className="n mb-2 text-2xl tracking-[-0.02em]">Thank you.</h2>
        <p className="max-w-[44ch] text-body">
          Your message is on its way. I read every one myself and usually reply within a day.
        </p>
      </div>
    );
  }

  const errors = state.kind === "error" ? state.errors ?? {} : {};

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={LABEL}>
            Your name
          </label>
          <input id="name" name="name" autoComplete="name" required maxLength={120} className={FIELD} />
          {errors.name ? <p className="mt-1.5 text-sm text-magenta-ink">{errors.name}</p> : null}
        </div>
        <div>
          <label htmlFor="email" className={LABEL}>
            Email
          </label>
          <input id="email" name="email" type="email" autoComplete="email" required maxLength={254} className={FIELD} />
          {errors.email ? <p className="mt-1.5 text-sm text-magenta-ink">{errors.email}</p> : null}
        </div>
      </div>
      <div>
        <label htmlFor="company" className={LABEL}>
          Business <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <input id="company" name="company" autoComplete="organization" maxLength={120} className={FIELD} />
        {errors.company ? <p className="mt-1.5 text-sm text-magenta-ink">{errors.company}</p> : null}
      </div>
      <div>
        <label htmlFor="helpRequest" className={LABEL}>
          What is done by hand that shouldn’t be?
        </label>
        <textarea id="helpRequest" name="helpRequest" required rows={6} maxLength={2000} className={`${FIELD} resize-y`} />
        {errors.helpRequest ? <p className="mt-1.5 text-sm text-magenta-ink">{errors.helpRequest}</p> : null}
      </div>
      {/* Honeypot: real people never see or fill this. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <button type="submit" disabled={state.kind === "sending"} className="cta disabled:opacity-60">
          {state.kind === "sending" ? "Sending…" : "Send"} <span className="arw">&rarr;</span>
        </button>
        <span className="l text-muted">
          Or email{" "}
          <a href={LINKS.email} className="text-accent">
            {LINKS.emailText}
          </a>
        </span>
      </div>
      {state.kind === "error" && state.message ? <p className="text-sm text-magenta-ink">{state.message}</p> : null}
    </form>
  );
}
