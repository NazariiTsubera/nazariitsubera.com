export const LEAD_LIMITS = {
  name: 120,
  email: 254,
  company: 120,
  helpRequest: 2_000,
} as const;

export type LeadSubmission = {
  name: string;
  email: string;
  company: string;
  helpRequest: string;
  website: string;
  startedAt: number;
};

export type LeadField = "name" | "email" | "company" | "helpRequest";

export type LeadValidationResult =
  | { ok: true; data: LeadSubmission }
  | { ok: false; errors: Partial<Record<LeadField, string>> };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}
export function validateLeadSubmission(value: unknown): LeadValidationResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, errors: { name: "Please check the form and try again." } };
  }

  const input = value as Record<string, unknown>;
  const data: LeadSubmission = {
    name: text(input.name),
    email: text(input.email).toLowerCase(),
    company: text(input.company),
    helpRequest: text(input.helpRequest),
    website: text(input.website),
    startedAt:
      typeof input.startedAt === "number" && Number.isFinite(input.startedAt)
        ? input.startedAt
        : 0,
  };
  const errors: Partial<Record<LeadField, string>> = {};

  if (!data.name) errors.name = "Please enter your name.";
  else if (data.name.length > LEAD_LIMITS.name)
    errors.name = "Please shorten your name.";

  if (!data.email) errors.email = "Please enter your email.";
  else if (
    data.email.length > LEAD_LIMITS.email ||
    !EMAIL_PATTERN.test(data.email)
  )
    errors.email = "Please enter a valid email address.";

  if (data.company.length > LEAD_LIMITS.company)
    errors.company = "Please shorten the company name.";

  if (!data.helpRequest)
    errors.helpRequest = "Please tell me what you would like help improving.";
  else if (data.helpRequest.length > LEAD_LIMITS.helpRequest)
    errors.helpRequest = "Please keep your message under 2,000 characters.";

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}

export function splitName(name: string) {
  const parts = name.trim().split(/\s+/);
  return {
    firstName: parts.shift() ?? "",
    lastName: parts.join(" "),
  };
}
