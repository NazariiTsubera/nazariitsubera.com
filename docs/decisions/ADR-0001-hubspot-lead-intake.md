# ADR-0001: Use HubSpot Free CRM for lead intake

Date: 2026-07-12
Status: Approved

## Context

The site needs a fast, inexpensive way to capture, qualify, store, and process
consulting inquiries. The current opt-in form only validates an email locally
and does not persist or notify anyone.

The business is pre-validation and should avoid building a CRM, committing to
an ERP, or paying for infrastructure whose value has not been demonstrated.

## Decision

Use HubSpot Free CRM as the lead system of record. Submit the site's custom
form to HubSpot's unauthenticated Forms Submission API through a Next.js route
handler. The hosting platform may deploy that handler as serverless
infrastructure, but the application boundary is the Next.js endpoint.

Use Zoho Mail only for business email. Do not couple the lead architecture to
the email-hosting provider.

## Rationale

- HubSpot provides contacts, form submissions, notifications, pipelines,
  tasks, and reporting without a custom admin application.
- A custom website form preserves the site's design and can evolve without
  embedding a vendor-rendered UI.
- A server endpoint centralizes validation, abuse controls, error handling,
  and future integration changes.
- The unauthenticated submission endpoint needs only a portal ID and published
  form GUID; v1 does not introduce a private-app credential.
- HubSpot data is exportable, limiting migration risk if proven demand later
  justifies Zoho, Odoo, a paid CRM, or custom software.

## Alternatives considered

### Formspree

Simpler form ingestion, but it is a temporary submission inbox rather than the
desired lead-management foundation.

### Supabase plus transactional email

Provides storage but requires building lead views, notifications, statuses,
security, and operations. This is unnecessary for the MVP.

### Zoho CRM

Viable and integrates with Zoho Mail and Zoho Invoice. It was not selected
because the immediate priority is the fastest polished CRM and form workflow,
not assembling a broader business suite before demand is proven.

### Odoo

Powerful for a future ERP commitment, but its one-app free boundary, external
API pricing, and operational complexity are disproportionate to the MVP.

## Consequences

Positive:

- no custom lead database or admin UI;
- minimal initial cost;
- immediate pipeline and notification capability;
- replaceable integration boundary at one route handler.

Negative:

- form behavior depends on HubSpot availability and API contracts;
- free-tier limits and product packaging may change;
- HubSpot becomes a processor of personal lead data;
- HubSpot CAPTCHA cannot be enabled for Forms API submissions, so the
  application owns the first layer of abuse prevention;
- advanced workflows may later require payment or migration.

## Revisit triggers

Reconsider this decision when any of the following occurs:

- free-tier limits impede normal operation;
- invoicing, delivery, and accounting require a unified operating system;
- lead volume justifies a custom workflow;
- compliance or data-location requirements change;
- HubSpot reliability, pricing, or exportability becomes unacceptable.
