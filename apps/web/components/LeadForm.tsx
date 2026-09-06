"use client";

import { useState } from "react";
import { LEAD_LIMITS, type LeadField } from "@/lib/lead-intake";

type Tone = "light" | "dark";
type Status = "idle" | "submitting" | "success" | "error";
type FormValues = Record<LeadField, string>;

const EMPTY_FORM: FormValues = {
  name: "",
  email: "",
  company: "",
  helpRequest: "",
};

export default function LeadForm({ tone = "light" }: { tone?: Tone }) {
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<LeadField, string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [startedAt] = useState(() => Date.now());
  const dark = tone === "dark";

  const fieldTone = dark
    ? "border-white/[0.18] bg-white/[0.06] text-on-dark placeholder:text-on-dark/35 focus:border-on-dark-lilac"
    : "border-ink/[0.16] bg-white text-ink placeholder:text-faint focus:border-violet-bright";
  const labelTone = dark ? "text-on-dark/[0.72]" : "text-body-2";
  const helperTone = dark ? "text-on-dark/45" : "text-mono-soft";
  const errorTone = dark ? "text-on-dark-pink" : "text-magenta-ink";

  function update(field: LeadField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
    if (status === "error") {
      setStatus("idle");
      setMessage("");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    setStatus("submitting");
    setErrors({});
    setMessage("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          website,
          startedAt,
        }),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        errors?: Partial<Record<LeadField, string>>;
        message?: string;
      };

      if (!response.ok || !result.ok) {
        setErrors(result.errors ?? {});
        setMessage(result.message ?? "Please check the form and try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setMessage("I couldn't send that just now. Please check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className={
          dark
            ? "rounded-[18px] border border-white/[0.14] bg-white/[0.06] px-7 py-7"
            : "rounded-[18px] border border-ink/[0.08] bg-white px-7 py-7 shadow-card"
        }
      >
        <div className="mb-5 flex items-center gap-3">
          <span className="h-[10px] w-[10px] rounded-full bg-grad-mark shadow-mark" />
          <span
            className={`font-mono text-[11px] uppercase tracking-[0.14em] ${
              dark ? "text-on-dark-lilac" : "text-violet-bright"
            }`}
          >
            Message received
          </span>
        </div>
        <h3
          className={`font-serif text-[30px] leading-none tracking-[-0.025em] ${
            dark ? "text-on-dark" : "text-ink"
          }`}
        >
          Thank you, {values.name.split(/\s+/)[0]}.
        </h3>
        <p
          className={`mt-3 max-w-[38ch] text-[17px] leading-[1.55] ${
            dark ? "text-on-dark/65" : "text-body"
          }`}
        >
          I&apos;ll read through your note and reply personally within one business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="relative">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          id={`lead-name-${tone}`}
          label="Name"
          value={values.name}
          error={errors.name}
          required
          autoComplete="name"
          maxLength={LEAD_LIMITS.name}
          placeholder="Your name"
          onChange={(value) => update("name", value)}
          fieldTone={fieldTone}
          labelTone={labelTone}
          errorTone={errorTone}
        />
        <Field
          id={`lead-email-${tone}`}
          label="Email"
          value={values.email}
          error={errors.email}
          required
          type="email"
          autoComplete="email"
          maxLength={LEAD_LIMITS.email}
          placeholder="you@company.com"
          onChange={(value) => update("email", value)}
          fieldTone={fieldTone}
          labelTone={labelTone}
          errorTone={errorTone}
        />
        <div className="sm:col-span-2">
          <Field
            id={`lead-company-${tone}`}
            label="Company"
            optional
            value={values.company}
            error={errors.company}
            autoComplete="organization"
            maxLength={LEAD_LIMITS.company}
            placeholder="Your company"
            onChange={(value) => update("company", value)}
            fieldTone={fieldTone}
            labelTone={labelTone}
            errorTone={errorTone}
          />
        </div>
        <div className="sm:col-span-2">
          <label
            htmlFor={`lead-help-${tone}`}
            className={`mb-1.5 flex items-baseline justify-between gap-4 font-mono text-[10.5px] tracking-[0.035em] ${labelTone}`}
          >
            <span>
              What would you like help improving in your business?
              <span className={dark ? "text-on-dark-pink" : "text-magenta-ink"}> *</span>
            </span>
          </label>
          <textarea
            id={`lead-help-${tone}`}
            name="helpRequest"
            required
            rows={3}
            maxLength={LEAD_LIMITS.helpRequest}
            aria-invalid={Boolean(errors.helpRequest)}
            aria-describedby={`lead-help-note-${tone}${errors.helpRequest ? ` lead-help-error-${tone}` : ""}`}
            value={values.helpRequest}
            onChange={(event) => update("helpRequest", event.target.value)}
            placeholder="Tell me about the process, problem, or idea..."
            className={`min-h-[96px] w-full resize-none rounded-[12px] border px-4 py-3 text-[14px] leading-[1.45] outline-none transition-[border-color,box-shadow] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.10)] ${fieldTone}`}
          />
          <div className="mt-1.5 flex items-start justify-between gap-4">
            <p
              id={`lead-help-note-${tone}`}
              className={`max-w-[58ch] font-mono text-[9.5px] leading-[1.45] ${helperTone}`}
            >
              You do not need to know the technical solution. Just describe the process,
              problem, or idea in your own words.
            </p>
            <span className={`font-mono text-[9.5px] tabular-nums ${helperTone}`}>
              {values.helpRequest.length}/{LEAD_LIMITS.helpRequest}
            </span>
          </div>
          {errors.helpRequest && (
            <p
              id={`lead-help-error-${tone}`}
              role="alert"
              className={`mt-2 font-mono text-[11px] ${errorTone}`}
            >
              ↳ {errors.helpRequest}
            </p>
          )}
        </div>
      </div>

      <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor={`lead-website-${tone}`}>Website</label>
        <input
          id={`lead-website-${tone}`}
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>

      {status === "error" && message && (
        <p role="alert" className={`mt-4 font-mono text-[11.5px] leading-[1.5] ${errorTone}`}>
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="gradbtn mt-4 h-[50px] w-full cursor-pointer rounded-[11px] px-6 font-mono text-[12.5px] tracking-[0.025em] text-white disabled:cursor-wait disabled:opacity-70"
      >
        {status === "submitting" ? "Sending…" : "Start a Conversation"}
      </button>
      <p className={`mt-2.5 font-mono text-[9.5px] leading-[1.45] ${helperTone}`}>
        By submitting, you agree that I may contact you about your inquiry. No
        newsletters or automated marketing.
      </p>
    </form>
  );
}

function Field({
  id,
  label,
  optional,
  error,
  fieldTone,
  labelTone,
  errorTone,
  onChange,
  ...inputProps
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  fieldTone: string;
  labelTone: string;
  errorTone: string;
  onChange: (value: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "id" | "onChange">) {
  const errorId = `${id}-error`;
  return (
    <div>
      <label
        htmlFor={id}
        className={`mb-1.5 flex items-baseline justify-between gap-3 font-mono text-[10.5px] tracking-[0.035em] ${labelTone}`}
      >
        <span>
          {label}
          {!optional && <span className={errorTone}> *</span>}
        </span>
        {optional && (
          <span className="text-[9.5px] uppercase tracking-[0.11em] opacity-55">Optional</span>
        )}
      </label>
      <input
        {...inputProps}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={`h-[46px] w-full rounded-[11px] border px-4 text-[13.5px] outline-none transition-[border-color,box-shadow] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.10)] ${fieldTone}`}
      />
      {error && (
        <p id={errorId} role="alert" className={`mt-2 font-mono text-[11px] ${errorTone}`}>
          ↳ {error}
        </p>
      )}
    </div>
  );
}
