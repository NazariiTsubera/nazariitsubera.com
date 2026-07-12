# HubSpot Lead Intake — Feature Specification

Date: 2026-07-12
Status: Approved

## Purpose

Replace the current client-only email opt-in with a low-friction consulting
inquiry form that captures useful qualification signal, stores submissions in
HubSpot Free CRM, and notifies Nazarii for personal follow-up.

The website remains a personal-brand landing page. This feature is not a
newsletter signup, customer portal, or automated sales system.

## Users and outcome

The form is for business owners, managers, and startup founders who may need
workflow automation, practical AI, integrations, or custom software.

A successful submission must:

1. create or update the visitor's HubSpot contact record;
2. preserve the visitor's qualification answers as a form submission;
3. trigger HubSpot's configured new-submission notification;
4. show an honest success state on the website.

## UX

The navigation, hero CTA, and lower-page CTA open the same accessible inquiry
modal. The modal contains one reusable one-step form and uses one submission
endpoint. On mobile, the modal behaves as a near-full-screen sheet; on larger
screens it is a centered dialog. Closing restores focus to the trigger.

- Name — required
- Email — required
- Company — optional
- "What would you like help improving in your business?" — required textarea

Textarea helper text:

> You do not need to know the technical solution. Just describe the process,
> problem, or idea in your own words.

The primary action is labeled "Start a Conversation."

### Consent copy

> By submitting, you agree that Nazarii may contact you about your inquiry.
> No newsletters or automated marketing.

Submitting an inquiry is permission to respond to that inquiry. It is not
marketing consent and must not subscribe the visitor to a newsletter.

### States

- Idle: the complete one-step form is visible.
- Submitting: disables duplicate submission and communicates progress.
- Validation error: identifies the affected field in text and through ARIA.
- Service error: preserves entered values and offers a retry.
- Success: replaces the form with a confirmation and expected response time.

Success copy should promise a personal reply within one business day without
claiming that an email was sent to the visitor.

## HubSpot mapping

Create a HubSpot form containing every submitted field before integration.
Use standard contact properties where available and custom contact properties
for qualification data.

| Website field | HubSpot property | Type |
| --- | --- | --- |
| Name | `firstname` + `lastname` | Standard text; split conservatively server-side |
| Email | `email` | Standard email |
| Company name | `company` | Standard text |
| Help request | `consulting_help_request` | Custom multi-line text |
| Lead source | `consulting_lead_source` | Custom single-line text; value `nazariitsubera.com` |

HubSpot's internal names are authoritative. If HubSpot generates different
internal names, update the application mapping and this document together.

Website submissions create or update contacts. They must not automatically
create deals. Nazarii creates a deal only after reviewing and qualifying the
inquiry.

## CRM workflow

The configured deal stages are:

1. Qualified
2. Discovery Scheduled
3. Discovery Completed
4. Proposal Sent
5. Negotiation
6. Closed Won
7. Closed Lost

## Validation

The server is authoritative.

- Trim all text values.
- Require a name of 1–120 characters.
- Require a syntactically valid email of at most 254 characters.
- Limit company name to 120 characters.
- Require a help request of 1–2,000 characters.
- Reject unexpected payload shapes.
- Apply a small request-body limit.

## Abuse protection

V1 uses layered, low-friction controls:

- hidden honeypot field;
- client-generated form-start timestamp and minimum completion time;
- server-side schema validation and allowlists;
- same-origin request checks where dependable;
- HubSpot's form-level spam controls;
- duplicate-submit protection in the client.

Do not add CAPTCHA in v1. If observed spam exceeds a tolerable level, add
Cloudflare Turnstile as a documented follow-up decision. Do not describe an
in-memory serverless counter as durable rate limiting.

## Privacy and retention

Collect only the fields in this specification. Do not log full submission
payloads, email addresses, or project descriptions in production logs.

HubSpot is the system of record and controls lead retention. The application
does not maintain a second lead database. Requests for deletion should be
handled by deleting or anonymizing the relevant HubSpot contact and associated
form data according to HubSpot's available controls.

## Failure behavior

- Invalid input returns a 400 response with safe field-level errors.
- Suspected spam returns a generic accepted response without creating a lead.
- HubSpot throttling or downtime returns a retryable 503 response.
- Unexpected server failures return a generic 500 response and log only safe
  diagnostic metadata.
- The UI must never show success unless HubSpot accepted the submission or the
  request was intentionally treated as spam.

## Configuration

Vercel environment variables:

- `HUBSPOT_PORTAL_ID`
- `HUBSPOT_FORM_GUID`

These identifiers are configuration rather than credentials, but they should
still be managed through environment variables so preview and production can
target different HubSpot forms if needed.

## Non-goals

- Newsletter subscription or marketing automation
- Visitor accounts or authentication
- Automatic deal creation
- Service-category, budget, phone, industry, company-size, or file-upload fields
- Confirmation emails
- A custom lead database or admin dashboard
- Invoicing or payments

## Acceptance criteria

- Both CTA locations use the new flow and submit through one server endpoint.
- Required and optional fields behave as specified on mobile and desktop.
- Keyboard navigation, labels, focus, errors, and status announcements are
  accessible.
- Valid submissions appear in the intended HubSpot form/contact record.
- Duplicate email submissions update the appropriate HubSpot contact behavior
  rather than creating an uncontrolled parallel database.
- HubSpot submission notifications reach the configured business inbox.
- Spam and malformed requests do not produce normal lead records.
- Network and HubSpot failures preserve input and allow retry.
- `npm run lint` passes.
- `npm run build` passes in a network-enabled environment.
- The page is visually inspected at mobile and desktop widths.
