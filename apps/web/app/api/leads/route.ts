import { NextRequest, NextResponse } from "next/server";
import { splitName, validateLeadSubmission } from "@/lib/lead-intake";

const MAX_BODY_BYTES = 8_192;
const MIN_COMPLETION_MS = 1_500;
const HUBSPOT_TIMEOUT_MS = 8_000;

type HubSpotField = { name: string; value: string };

function json(body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function hasUnexpectedOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    const originUrl = new URL(origin);
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    return Boolean(host && originUrl.host !== host);
  } catch {
    return true;
  }
}

export async function POST(request: NextRequest) {
  if (hasUnexpectedOrigin(request)) {
    return json({ ok: false, message: "Unable to submit this request." }, 403);
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return json({ ok: false, message: "This request is too large." }, 413);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, message: "Please check the form and try again." }, 400);
  }

  const validation = validateLeadSubmission(body);
  if (!validation.ok) {
    return json({ ok: false, errors: validation.errors }, 400);
  }

  const lead = validation.data;
  const elapsed = Date.now() - lead.startedAt;
  const looksAutomated = Boolean(lead.website) || elapsed < MIN_COMPLETION_MS;

  // Give bots the same outward response without adding them to HubSpot.
  if (looksAutomated) return json({ ok: true }, 200);

  const portalId = process.env.HUBSPOT_PORTAL_ID;
  const formGuid = process.env.HUBSPOT_FORM_GUID;
  if (!portalId || !formGuid) {
    console.error("Lead intake is missing HubSpot form configuration.");
    return json(
      { ok: false, message: "The form is temporarily unavailable. Please try again." },
      503,
    );
  }

  const { firstName, lastName } = splitName(lead.name);
  const fields: HubSpotField[] = [
    { name: "firstname", value: firstName },
    { name: "email", value: lead.email },
    { name: "consulting_help_request", value: lead.helpRequest },
    { name: "consulting_lead_source", value: "nazariitsubera.com" },
  ];
  if (lastName) fields.push({ name: "lastname", value: lastName });
  if (lead.company) fields.push({ name: "company", value: lead.company });

  const endpoint = `https://api.hsforms.com/submissions/v3/integration/submit/${encodeURIComponent(portalId)}/${encodeURIComponent(formGuid)}`;
  const pageUri = request.headers.get("referer") ?? "https://nazariitsubera.com/";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        submittedAt: Date.now().toString(),
        fields,
        context: {
          pageUri,
          pageName: "Nazarii Tsubera — Consulting inquiry",
        },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(HUBSPOT_TIMEOUT_MS),
    });

    if (!response.ok) {
      let diagnostic = await response.text();
      for (const [value, replacement] of [
        [lead.email, "[redacted-email]"],
        [lead.name, "[redacted-name]"],
        [lead.helpRequest, "[redacted-request]"],
        [lead.company, "[redacted-company]"],
      ] as const) {
        if (value) diagnostic = diagnostic.replaceAll(value, replacement);
      }
      diagnostic = diagnostic.slice(0, 2_000);
      console.error("HubSpot rejected a lead submission.", {
        status: response.status,
        diagnostic,
      });
      return json(
        { ok: false, message: "I couldn't send that just now. Please try again." },
        response.status === 429 || response.status >= 500 ? 503 : 502,
      );
    }

    return json({ ok: true }, 200);
  } catch (error) {
    console.error("HubSpot lead submission failed.", {
      cause: error instanceof Error ? error.name : "UnknownError",
    });
    return json(
      { ok: false, message: "I couldn't send that just now. Please try again." },
      503,
    );
  }
}
