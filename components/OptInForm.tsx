"use client";

import { useState } from "react";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "error" | "success";

export default function OptInForm({
  tone = "light",
  layout = "row",
  successNote,
  hint,
}: {
  tone?: "light" | "dark";
  layout?: "row" | "stack";
  successNote: string;
  hint?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const dark = tone === "dark";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      setStatus("error");
      return;
    }
    // ── Lead capture. Fakes it for now — validates and shows success.
    //    A Supabase insert drops in here later:
    //    await supabase.from('leads').insert({ email, source: tone });
    setStatus("success");
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className={
          dark
            ? "flex items-start gap-[13px] rounded-[14px] bg-white/[0.06] px-6 py-[22px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)]"
            : "flex items-start gap-[13px] rounded-xl bg-white px-[22px] py-5 shadow-card"
        }
      >
        <span className="mt-2 h-[9px] w-[9px] flex-none rounded-full bg-grad-mark" />
        <div>
          <div
            className={`font-medium ${
              dark ? "text-[20px] text-on-dark" : "text-[19px]"
            }`}
          >
            You&apos;re in.
          </div>
          <div
            className={`mt-[3px] font-mono text-[12.5px] leading-[1.6] ${
              dark ? "text-on-dark/[0.65]" : "text-[#6f6b63]"
            }`}
          >
            {successNote}
          </div>
        </div>
      </div>
    );
  }

  const inputBase = "w-full px-4 text-[14px] outline-none rounded-[11px] border";
  const inputTone = dark
    ? "h-14 bg-white/[0.06] text-on-dark"
    : "h-[54px] bg-white text-ink";
  const inputBorder =
    status === "error"
      ? dark
        ? "border-on-dark-pink"
        : "border-magenta-ink"
      : dark
        ? "border-white/[0.18]"
        : "border-ink/[0.18]";

  const errorText = dark ? "text-on-dark-pink" : "text-magenta-ink";

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div
        className={
          layout === "row" ? "flex items-stretch gap-2.5" : "flex flex-col"
        }
      >
        <div className={layout === "row" ? "flex-1" : ""}>
          <input
            type="email"
            name="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@yourcompany.com"
            aria-label="Your email"
            aria-invalid={status === "error"}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            className={`${inputBase} ${inputTone} ${inputBorder}`}
          />
          {status === "error" && layout === "row" && (
            <p
              role="alert"
              className={`mt-[7px] font-mono text-[11.5px] ${errorText}`}
            >
              ↳ enter a valid email address
            </p>
          )}
        </div>
        {status === "error" && layout === "stack" && (
          <p
            role="alert"
            className={`mt-2 font-mono text-[11.5px] ${errorText}`}
          >
            ↳ enter a valid email address
          </p>
        )}
        <button
          type="submit"
          className={`gradbtn cursor-pointer whitespace-nowrap rounded-[11px] font-mono text-[13px] tracking-[0.02em] text-white ${
            layout === "row" ? "h-[54px] flex-none px-[26px]" : "mt-3 h-14 w-full"
          }`}
        >
          Start a conversation
        </button>
      </div>
      {hint && (
        <p className="mt-[15px] font-mono text-[11.5px] leading-[1.6] text-mono-soft">
          {hint}
        </p>
      )}
    </form>
  );
}
