# HubSpot Lead Intake — Implementation Plan

Date: 2026-07-12
Status: Approved

## Prerequisites

1. In HubSpot, create the two custom contact properties listed in the feature
   spec.
2. Create and publish one HubSpot form containing every mapped property.
3. Configure form-submission notifications for the business inbox.
4. Record the HubSpot portal ID and form GUID.

## Phase 1 — Contracts and server integration

1. Add shared TypeScript types and validation for the lead-submission payload.
2. Add a Next.js `POST /api/leads` route handler.
3. Implement body-size checks, parsing, normalization, validation, honeypot,
   minimum-completion-time checks, and safe error responses.
4. Split the single name conservatively and map validated values to the
   unauthenticated HubSpot Forms Submission API payload.
5. Forward safe page context and consent information where appropriate.
6. Add request timeouts and map HubSpot failures into retryable responses.
7. Ensure production logs exclude lead contents and personal data.

## Phase 2 — Form experience

1. Replace `OptInForm` with a reusable one-step lead form inside a shared modal.
2. Preserve the existing light/dark variants and responsive presentation.
3. Implement field validation, submitting, retry, and success states while
   preserving values after errors.
4. Add accessible labels, descriptions, alerts, focus management, and status
   announcements.
5. Make the navigation, hero, and lower CTA open the same dialog and endpoint.

## Phase 3 — Tests

Add focused tests for:

- valid payload mapping;
- required fields and length limits;
- honeypot and implausibly fast submissions;
- optional fields omitted or blank;
- HubSpot success, validation failure, throttle, timeout, and server failure;
- client value preservation after validation and service errors;
- duplicate-submit prevention and retry behavior.

If the repository has no test runner, add the smallest compatible test setup
only if its maintenance cost is justified; otherwise isolate pure validation
and mapping functions and document manual/API verification.

## Phase 4 — Configuration and end-to-end verification

1. Add non-secret placeholders and setup notes to `.env.example`.
2. Configure preview and production variables in Vercel.
3. Submit a real test lead and verify its contact properties and form activity
   in HubSpot.
4. Verify the HubSpot notification reaches the configured business inbox.
5. Test invalid, spam-like, duplicate, and simulated failure submissions.
6. Run `npm run lint`.
7. Run `npm run build` with network access for `next/font` downloads.
8. Visually inspect mobile and desktop layouts and both color variants.

## Rollout and rollback

Deploy first to a Vercel preview environment targeting a test HubSpot form if
available. After verification, configure production to target the production
form and deploy.

Rollback consists of reverting the application deployment. HubSpot contacts
created during testing must be clearly marked and manually removed if they are
not legitimate leads.

## Future enhancements

- Cloudflare Turnstile if spam is observed
- confirmation email after domain sending is intentionally configured
- meeting scheduling after a lead is qualified
- automatic deal creation only if qualification rules become reliable
- analytics for form starts, step completion, submission, and errors
- CRM or ERP migration after proven demand
