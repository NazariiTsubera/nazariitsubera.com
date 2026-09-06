# Booth to MRR: Engine v1 Design

- Date: 2026-09-05
- Status: Draft for review
- Supersedes: sections 4 to 6 (system spec, acceptance criteria, build order) of the original
  product brief "Booth to MRR, Product Brief and Build Spec v1.0, 5 Sep 2026". Sections 1 to 3
  and 7 to 8 of that brief (business, pricing, field playbook, legal checklist, risk register)
  remain the business context and are not restated here.

## 1. Summary

One Next.js application in this repository, deployed on Railway as two services built from one
image (web and worker), turns a recorded booth conversation plus photos into a live vendor
website on a subdomain of nazariitsubera.com within a few minutes.

The vendor site is a single static HTML file with inlined CSS and no JavaScript, written by the
model for that vendor from a design brief, verified by a deterministic gate that includes
rendering in headless Chromium, and served by hostname routing from stored artifacts. A
deterministic template is the floor: it renders the same content when the authored page fails
the gate. The site is a preview for seven days, carrying a small banner injected at publish that
points at a claim page on the personal site. Stripe Checkout on that page turns the preview
into a paid Storefront subscription and the site becomes permanent.

The operator console, the generation pipeline, the vendor-site serving path, the purchase flow,
and the existing personal site all live in this repository as a pnpm workspace: `apps/web`
(Next.js), `apps/worker` (Node), and one shared `packages/core` holding every domain module. The
code style is domain-oriented `service + repository` modules, thin route handlers, Zod contracts
with inferred types, test-first development with vitest, and slim, readable code with
dependencies added only when a task needs them. The package boundary makes the dependency
direction enforceable.

## 2. Decisions carried in from the brainstorm

| Decision | Choice | Why |
|---|---|---|
| Repository | This repo: personal site and engine together | One brand, one domain, one funnel. Vercel was the only blocker and Railway removes it. |
| Repository layout | pnpm workspace: `apps/web`, `apps/worker`, `packages/core`. One core package with modules, consumed as TypeScript source with no build step. | Two runtime apps with different dependency profiles share one domain layer. A package boundary enforces the direction; a single core package keeps compilation trivial. |
| Code style | `service + repository` modules, thin route handlers, Zod contracts, TDD with vitest, slim readable code. Dependencies are added only when a task needs them. | Small surface area and readability. The operator's SheetX project is a style reference only; nothing is copied from it. |
| Hosting | Railway. Two services from one image: `web` and `worker`. Managed Postgres and Redis. | Worker does heavy image and model work and must never share a process with the one serving vendor sites. |
| Object storage | Cloudflare R2, public bucket on `img.nazariitsubera.com` | Photos and built sites. No egress cost. DNS is already on Cloudflare. |
| DNS and TLS | Cloudflare DNS, proxied, SSL mode Full. Apex and `*.nazariitsubera.com` are Railway custom domains on `web`. | Already live and verified. |
| API | Next.js route handlers and server actions calling `@nazariitsubera/core` services | No separate API service. One client, one deploy. |
| Queue | BullMQ on Redis. A Postgres `Job` row is the durable record, created before enqueue. | Operator's choice, standard and well understood. Postgres holds the truth, Redis holds work in flight. |
| Auth | Better Auth, database sessions, one operator account created by a seed script, signup disabled | Real auth from a library, no homegrown passcode. |
| Vendor site | Static HTML with inlined CSS, zero JavaScript | Speed, Lighthouse targets, near-zero hosting cost, and hand-over-ability all follow from static output. |
| Page authoring | The model writes each vendor's HTML and CSS from a design brief. A deterministic gate (HTML lint, text guard, headless Chromium with axe) verifies it, with up to two repair passes. A curated template renders the same content as the fallback. | Fixed templates make sites look alike and turn every improvement into template work. Model authorship gives each vendor their own design; the gate and fallback give it a floor. |
| Commerce | Nothing built. Each product carries a nullable `checkout_url` the operator pastes. | Square catalog sync is the first integration after v1, not in it. |
| Vendor notification | Operator sends the link from their own phone through a prefilled `sms:` deep link | No Twilio, no A2P registration, and the operator reviews before anything reaches the vendor. |
| Capture app | Plain responsive Next.js pages under `/console`. Not a PWA, no offline mode. | Operator decision. |
| Content input | A recorded conversation, transcribed, plus an optional operator prompt | Replaces the typed one-liner, best-seller note, and origin story. |

## 3. Scope

### 3.1 In v1

- Operator console: create vendor, record consent, record and transcribe the conversation,
  add an operator prompt, upload and tag photos, generate, review, text the vendor, extend,
  regenerate, edit content JSON, publish or unpublish, mark won or lost.
- Generation pipeline: transcription, image processing with product cutouts, content generation
  with a strict schema, model-authored page design, the gate with headless Chromium, bounded
  repair, template fallback, publish.
- Vendor-site serving on `{slug}.nazariitsubera.com` with preview banner, noindex, expiry,
  expired page, not-found page, and preview-opened tracking.
- Purchase flow: claim page on the personal site, Stripe Checkout with setup fee plus monthly
  subscription, Stripe Tax, webhooks that flip the vendor to won and republish without the
  banner, Stripe customer portal for cancellation.
- Personal site additions: a `/storefront` offer page and a portfolio grid of won vendors who
  opted in.
- Admin list view with row actions.
- Fake adapters for every external provider so local development and tests run with no keys.

### 3.2 Out of v1 (do not build)

- PWA, service worker, offline capture.
- Twilio or any automated SMS.
- Model-guessed photo tags. The operator's tag is the only tag.
- Square, Shopify, Etsy, or any catalog sync. Only the nullable `checkout_url` slot exists.
- Multi-page vendor sites, forms, booking, blogs.
- Client login or any vendor-facing editor.
- Palette extraction code. The model chooses colors when it authors a page; the fallback template
  uses curated themes.
- Custom domain automation. Registering and attaching a vendor domain is a manual Railway and
  Cloudflare task per paying vendor.
- Email delivery of any kind.
- Multiple operators, roles, permissions.

### 3.3 After v1: other output targets

The engine's core is a recorded conversation and photos in, a designed and verified site out.
The static single page is the first output target because it is the Tier 1 product. Full
storefronts of the kind the operator wants to build later, such as Hiut Denim, tentree, or Adored
Vintage, are multi-page Shopify stores with collections, product pages, and a cart. The route to
those is a second output target, a Shopify theme (Liquid, CSS, and the small amount of JavaScript
a cart drawer needs), authored by the model from the same content and image pipeline, checked by
Shopify's `theme-check` plus the same Chromium screenshot gate against a development store, and
published to the client's store through the Shopify Admin API. Shopify hosts the store and owns
cart, checkout, inventory, and payments; the engine owns design, photography treatment, and copy.
Square Online is the equivalent target for vendors who stay on Square.

The zero-JavaScript rule is a property of the Tier 1 static target, not of the engine. Nothing in
v1 is built for other targets, and nothing in v1 prevents them: the author brief and the publish
adapter are the only parts that change per target.

## 4. Architecture

### 4.1 Services and infrastructure

| Component | Where | Notes |
|---|---|---|
| `web` | Railway service, root `/`, build `pnpm install && pnpm --filter web build`, start `pnpm --filter web start` | Next.js in `apps/web`: marketing pages, console, admin, route handlers, vendor-site serving. Owns custom domains `nazariitsubera.com` and `*.nazariitsubera.com`. Pre-deploy runs `pnpm --filter core db:migrate:deploy`. Watch paths `apps/web/**`, `packages/**`. |
| `worker` | Railway service, root `/`, built from `apps/worker/Dockerfile` on the Playwright base image, start `pnpm --filter worker start` | Node in `apps/worker`, run with `tsx`: BullMQ workers for pipeline jobs and the repeatable expiry sweep. Ships Chromium for the gate. No public networking. Watch paths `apps/worker/**`, `packages/**`. |
| Postgres | Railway managed | All domain data, Better Auth tables, durable job records, events. |
| Redis | Railway managed | BullMQ only. Required at boot in both processes; a missing `REDIS_URL` fails fast in production. |
| R2 | Cloudflare | Bucket with prefixes `uploads/`, `assets/`, `sites/`, `fonts/`. Public read on `img.nazariitsubera.com` for `assets/` and `fonts/`. |
| Cloudflare | DNS and proxy | Already configured. `www` redirects to apex at the edge. |
| Anthropic API | External | Content generation, `claude-opus-5`, structured output. |
| Transcription provider | External, behind adapter | See open decision 2. |
| Background removal provider | External, behind adapter | See open decision 3. |
| Stripe | External | Checkout, subscriptions, tax, customer portal, webhooks. |

Local development: `docker compose up` for Postgres and Redis, `pnpm dev` runs web and worker
through `concurrently`, `PROVIDERS_MODE=fake` selects the fake adapters. `.claude/launch.json`
points at `pnpm dev` on port 3000.

### 4.2 Request routing by hostname

`middleware.ts` normalizes the Host header and branches:

| Host | Handling |
|---|---|
| `nazariitsubera.com`, `www.nazariitsubera.com`, the `*.up.railway.app` host, `localhost` | Pass through to the normal app routes: marketing, `/storefront`, `/claim/[slug]`, `/console/*`, `/api/*`. |
| `{slug}.nazariitsubera.com` | Rewrite to `/_sites/{slug}{pathname}`. |
| Any other host | Rewrite to `/_sites/_domain/{host}{pathname}` for future custom domains. Returns the not-found page until a vendor has that `customDomain`. |

The `/_sites` route handler calls one function, `serveSite(host, path, searchParams)`, in
`@nazariitsubera/core/sites`. That function is the whole serving layer and is what a future standalone
`serve` service would call. Reserved subdomains (`www`, `app`, `api`, `admin`, `console`, `img`,
`mail`, `static`, `claim`, `storefront`, `dev`, `staging`) can never be vendor slugs.

`/console/*` and `/api/console/*` require the operator session. `/api/webhooks/*` verify
provider signatures instead.

### 4.3 Code layout

A pnpm workspace with two apps and one package. Inside every module: kebab-case files, `*.service.ts`, `*.repository.ts`, `*.schema.ts`, services own business
rules and transactions, repositories own queries, Zod contracts at every boundary with types
inferred. No barrel exports beyond each module's `index.ts`.

```txt
apps/
  web/                              Next.js (App Router), port 3000
    app/
      (marketing)/                  existing pages, /storefront, /claim/[slug]
      (console)/console/            operator console pages
      _sites/[slug]/[[...path]]/route.ts   vendor-site serving entry, calls core sites.serveSite
      api/
        auth/[...all]/              Better Auth
        console/                    operator-only handlers (uploads, jobs, actions)
        billing/                    checkout session creation, portal link
        webhooks/stripe/            Stripe events
        health/
    components/  console/  marketing/  ui/  brand/
    middleware.ts                   hostname routing, operator guard
    instrumentation.ts              env assertion at boot
  worker/                           plain Node process, `tsx src/index.ts`
    src/
      index.ts                      boot, env assertion, workers, graceful shutdown
      processors/                   generate-site, republish, regenerate-content,
                                    reprocess-assets, expiry-sweep
packages/
  core/                             @nazariitsubera/core, TypeScript source, no build step
    prisma/                         schema and migrations, generated client
    src/
      contracts/      every Zod schema shared with the browser: vendor forms, content JSON,
                      console API payloads. Pure: no Node, no Prisma, no React imports.
      db/             Prisma client
      env/            Zod env schema and assertBootEnv
      logger/         small structured logger, JSON lines to stdout
      auth/           Better Auth config, requireOperator, seed
      vendors/        lifecycle, slug generation, status transitions, consent
      markets/        market reference table and seed
      captures/       audio upload, transcript, operator prompt
      assets/         photo upload, tagging, ordering, derived artifacts
      storage/        R2 adapter (S3 API): presign, put, get, public URL; local fake
      jobs/           BullMQ connection, queues, retry policy, shutdown, Job row mirror
      pipeline/       generate-site orchestration and the individual steps
      ai/             Anthropic adapter, content prompt, content guard
      transcription/  adapter interface, real provider, fake
      images/         sharp operations, background-removal adapter, real provider, fake
      themes/         curated token sets, tone-to-theme map, contrast checks (fallback)
      template/       fallback renderer: React components and renderSite(content, theme) -> html
      design/         design brief, authorPage(content, assets, fonts) -> html, repairPage
      gate/           HTML lint, visible-text guard, browser checks, finalizePage (banner, noindex)
      sites/          versions, publish pointer swap, serveSite, preview and expired pages
      events/         append-only event log
      billing/        Stripe checkout, webhook handlers, subscription mirror, portal
      admin/          list queries for the console home
      rate-limit/     small Redis-backed limiter for public endpoints (Plan 5)
docs/                 product, architecture, conventions, testing, decisions/, superpowers/
pnpm-workspace.yaml  tsconfig.base.json  vitest.workspace.ts  docker-compose.yml
```

Rules that keep compilation trivial and the boundary real:

- `@nazariitsubera/core` ships TypeScript source. Its `exports` map exposes one entry per module
  (`@nazariitsubera/core/vendors` resolves to `src/vendors/index.ts`) and nothing deeper. Next consumes it
  through `transpilePackages: ["@nazariitsubera/core"]`; the worker and tests consume it through `tsx` and
  vitest directly. There is no build step for core and no `dist/`.
- One `tsconfig.base.json` at the root. Each workspace extends it. No path aliases are needed
  because pnpm workspace resolution handles `@nazariitsubera/core`.
- Dependency direction is `apps -> core`, never the reverse and never app to app. ESLint
  `no-restricted-imports` forbids `next/*` and `react-dom/server` inside core outside `template`,
  and forbids any import of `apps/*` from core.
- Browser code in `apps/web` imports only `@nazariitsubera/core/contracts`. Every other core module may pull
  Node-only dependencies and is server-only by construction.
- Prisma lives in core. Both apps import `@nazariitsubera/core/db`. Migrations run from core.
- Core stays one package until a module genuinely needs its own dependency set or release cycle.
  The only foreseeable candidate is `template`, if React and font assets ever weigh on the worker.
  Splitting it later is moving a folder and adding a `package.json`.

### 4.4 Adapters

Every external dependency sits behind one small interface with a real and a fake implementation
selected by `PROVIDERS_MODE`. Fakes are deterministic and run offline.

| Concern | Interface | Real (v1) | Fake |
|---|---|---|---|
| Transcription | `transcribe(audio: Buffer, mime) -> { text, durationSec }` | Open decision 2 | Returns a fixture transcript |
| Background removal | `removeBackground(image: Buffer) -> Buffer (PNG with alpha)` | Open decision 3 | Returns the input with a synthetic alpha mask |
| Content generation | `generateContent(input) -> ContentJson` | Anthropic, `claude-opus-5` | Returns a fixture content JSON built from input asset ids |
| Page authoring | `authorPage(input) -> html`, `repairPage(html, violations, screenshots) -> html` | Anthropic, `claude-opus-5` | Returns the template's output, so the fake pipeline still publishes |
| Browser | `inspectPage(html, assetsBaseUrl) -> GateReport` (overflow per width, axe violations per mode, eager bytes, screenshots) | Playwright with Chromium | Returns a clean report and blank screenshots |
| Storage | `put`, `get`, `presignPut`, `publicUrl` | R2 via S3 API | Local filesystem under `.storage/` |
| Billing | `createCheckoutSession`, `createPortalSession`, `verifyWebhook` | Stripe | In-memory with fixture events |

Changing a provider is a new file implementing the interface plus an env var. Nothing above the
adapter changes.

## 5. Data model

Prisma sketch. Every domain table carries `vendorId`. Better Auth owns `User`, `Session`,
`Account`, `Verification`.

```txt
Market
  id, slug unique, name, city, address, mapsUrl, scheduleNote, createdAt
  Seeded with the San Antonio markets from the brief. Operator-editable later.

Vendor
  id, createdAt, updatedAt
  businessName, contactName?, phone (E.164), instagramHandle?
  marketId -> Market
  slug unique                       generated from businessName, collision suffix -2, -3
  status enum: captured | generating | preview_live | expired | won | lost | churned
  tier enum: none | free | storefront
  photoConsent boolean, consentText, consentAt
  previewToken unique               opaque, used only in the link texted to the vendor
  previewExpiresAt?                 null once won
  publishedVersionId? -> SiteVersion   the pointer that publish swaps
  themeOverride?                    theme id used when the template fallback renders
  designNotes?                      operator instructions to the page author, persisted
  stripeCustomerId?, stripeSubscriptionId?
  customDomain? unique              Phase after v1
  showInPortfolio boolean default false
  notes?

Capture
  id, vendorId, createdAt
  audioKey?, audioMime?, audioDurationSec?
  transcript?, transcriptStatus enum: none | pending | done | failed
  operatorPrompt?
  One vendor has many captures; generation uses the latest.

Asset
  id, vendorId, createdAt
  originalKey, originalMime, contentHash
  kind enum: product | scene | person
  orderIndex int, isHero boolean default false
  cutoutKey?                        alpha PNG, products only
  derived jsonb                     { variants: { w480, w960, w1440 }, crops }  theme independent
  status enum: uploaded | processed | failed
  error?

SiteVersion
  id, vendorId, version int, createdAt
  contentJson jsonb                 schema in section 6
  authoredBy enum: model | template
  themeId?                          set when authoredBy is template
  htmlKey                           R2 key of the published HTML, flags already injected
  gateReport jsonb                  section 7.2 report for the published HTML
  screenshotKeys jsonb              { w360, w768, w1280 } R2 keys from the gate
  renderFlags jsonb                 { preview: boolean, noindex: boolean }
  unique (vendorId, version)
  Versions are immutable. Publishing sets Vendor.publishedVersionId.

Job
  id, vendorId, createdAt, startedAt?, finishedAt?
  type enum: generate_site | regenerate_content | regenerate_design | edit_design | reprocess_assets | republish
  status enum: queued | running | succeeded | failed
  attempts int, bullJobId?
  payload jsonb
  steps jsonb                       [{ name, status, startedAt, finishedAt, error? }]
  error?
  Created before the BullMQ enqueue. The console reads this row, never Redis.

Event
  id, vendorId?, createdAt
  type enum: vendor_created | capture_uploaded | generation_started | generation_succeeded |
             generation_failed | preview_published | preview_opened | sms_link_tapped |
             claim_page_viewed | checkout_started | paid | subscription_canceled |
             preview_extended | preview_expired | unpublished | marked_won | marked_lost |
             content_guard_retry | content_guard_nulled | design_repaired | design_fallback
  meta jsonb

StripeEvent
  id (Stripe event id) primary, type, receivedAt, processedAt?
  Idempotency for webhooks.
```

Status transitions are owned by `vendors/vendor.service.ts`:

```txt
captured -> generating (generate enqueued)
generating -> preview_live (publish) | captured (job failed, operator can retry)
preview_live -> expired (sweep) | won (paid or marked) | lost (marked)
expired -> won (claim after expiry) | lost
won -> churned (subscription ended and grace passed)
churned -> won (claims again through the same checkout)
```

## 6. Content JSON schema (v1)

`schemaVersion` is mandatory so later migrations can upgrade stored versions. Length limits are
enforced by Zod on both the model output and operator edits. Who writes each field is fixed.

```txt
schemaVersion: 1
businessName            operator            copied from Vendor
tagline                 model               max 60
heroHeadline            model               max 48
heroSub                 model               max 110
about                   model, nullable     2 to 3 sentences, null when the transcript gives nothing
tone                    model               warm | playful | crafted | technical | minimal
heroAssetId             model               must be a scene asset id; falls back to first scene
personAssetId           system, nullable    the person asset if one exists and consent is true
products[]              one per product asset, order preserved
  assetId               system              exactly the product asset ids, no more, no fewer
  name                  model               max 32
  blurb                 model, nullable     max 90
  priceHint             operator, nullable  never model-written
  checkoutUrl           operator, nullable  never model-written
  source                null in v1          reserved: { provider, itemId }
visit                   system
  markets[]             { name, mapsUrl, scheduleNote } from the Market table
  note                  model, nullable     e.g. "Look for the blue tent", only if said
contact                 system
  phone, instagramHandle?
  ctaLabel              model               max 20, defaults to "Call or text"
```

Section order is fixed by the template in v1: hero, products, about, visit, contact. `about` is
omitted when null. `visit` is omitted when the vendor has no market.

### 6.1 Content guard

Deterministic checks in `ai/content-guard.ts` run on every model output and every operator edit:

- Schema and length validation.
- Product asset ids must be exactly the vendor's product asset ids.
- Forbidden-claim scan on every text field: currency and price patterns, years in business or
  "since" plus a year, awards and press mentions, certifications ("organic", "FDA", "food safe",
  "certified", "approved"), guarantees, warranty, shipping and return policy language.

On a violation from the model: one retry with the violations listed in the user message, logged
as `content_guard_retry`. On a second violation: the offending field is set to null or the blurb
is dropped, logged as `content_guard_nulled`, and generation continues. An absent line is always
better than a fabricated claim on a real business's website.

## 7. Page authoring, the gate, and the template floor

### 7.1 Model-authored pages

Each vendor's page is written by the model for that vendor. The design step receives:

- the content JSON from section 6, which is the only source of facts and copy;
- the image manifest: for every asset its id, kind, alt text, intrinsic dimensions, and three
  URLs on the image host at 480, 960, and 1440 wide, products as transparent cutouts;
- the hosted font list: family name and woff2 URL for each of the ten variable fonts;
- the tone, the operator's persisted design notes, and the design brief.

It returns one complete HTML document with its CSS inline. Colors, type pairing, layout, rhythm,
and how the product images sit on the page are its decisions. The brief fixes the rules:

- Static. No `<script>`, no inline event handlers, no `<iframe>`, `<object>`, `<embed>`, or
  `<form>`. No `javascript:` URLs.
- Only URLs on the image host and relative URLs. No `@import`, no other external request.
- Mobile first, legible at 360px, no horizontal scroll, tap targets at least 44px.
- Every `<img>` has alt text, `width`, `height`, `srcset` with the three widths, and a `sizes`
  attribute. The hero loads eagerly; everything below the fold is lazy.
- Exactly one `<h1>`, a `<main>`, `<html lang>`, viewport meta, `<title>`, description, canonical.
- The primary call to action is a `tel:` link. Checkout links only where the content provides
  them. Instagram link if present. Every product name and the phone number appear in visible text.
- Copy is used as given. The author may set typography and layout, not facts.
- Legible in both `prefers-color-scheme` modes, or explicitly `color-scheme: light` with a palette
  that passes contrast on its own.
- HTML with CSS under 60 KB.

The template's own stylesheet and a rendered example are included in the brief as the quality bar,
so the author starts from a known-good level and is told to do better and different, not less.

The call uses `claude-opus-5` through the TypeScript SDK with streaming, adaptive thinking, effort
high, and `max_tokens` 32000. Downsized images are included so the author sees what it is laying
out. The brief and font list are stable and cached with `cache_control`; the vendor-specific
content follows them. Server-side refusal fallback is enabled.

### 7.2 The gate

Deterministic checks in `gate/`, run on every authored page and on every repair:

1. **HTML lint.** Parse the document. Reject forbidden elements and attributes, any URL outside
   the allowlist, images missing alt, width, height, or srcset, a missing or duplicate `<h1>`,
   missing head requirements, and a document over the size budget.
2. **Visible-text guard.** Strip tags, run the content guard from section 6.1 on the text, and
   require every product name and the phone number to be present. A rewritten blurb cannot
   introduce a price or a certification.
3. **Browser checks.** Render in headless Chromium at 360, 768, and 1280 wide, in light and dark
   modes. Fail on horizontal overflow (`scrollWidth` greater than the viewport), on any axe
   violation at WCAG 2 A or AA including color contrast, and on eager first-load bytes over
   400 KB measured from the network log. Take one screenshot per width.

The result is a `GateReport`: pass or fail, the list of violations with locations, byte counts,
and screenshot keys. It is stored on the SiteVersion and shown in the console.

### 7.3 Repair and fallback

On failure, the violations and the screenshots go back to the model with "fix only these," and
the gate runs again. At most two repair passes. Screenshots let the author see what a linter
cannot, overlapping text or an unreadable hero, the way a human reviewer would.

If the page still fails, the pipeline falls back: the template renders the same content JSON with
the theme from `themeForTone` or the operator's override. `SiteVersion.authoredBy` records
`template`, and a `design_fallback` event is logged so the console can show it. The vendor gets a
good site every time; only the ceiling varies.

### 7.4 The template floor

One deterministic template in `template/` with six curated themes in `themes/`, built in Plan 1.
`renderSite(content, theme)` is pure and snapshot-tested. Every theme passes WCAG AA in light and
dark by test. Product cards are identical in aspect, padding, ground, and shadow. It is used for
the fallback, for the first hand-built sites before the pipeline exists, and as the reference the
author is shown.

### 7.5 Publish-time injection

`finalizePage(html, flags, context)` in `gate/` adds what depends on the vendor's status, never on
the author: `<meta name="robots" content="noindex">` while a preview, and the preview banner,
"Preview. Expires in N days. Make it yours," linking to the claim page, with its own scoped class
names and inline colors so it never depends on the page's CSS. It works on any well-formed
document, authored or template. When a vendor is won, republish runs `finalizePage` with the
flags off. The template itself renders neither the banner nor the robots tag.

## 8. Generation pipeline

One BullMQ job type, `generate_site`, runs the steps below in order. Each step records its
status on `Job.steps`, writes its artifact durably before the next step starts, and is skipped
when its artifact already exists for unchanged input. Regeneration therefore only redoes what
changed.

| Step | Input | Output | Skip when | Budget |
|---|---|---|---|---|
| 1 transcribe | latest Capture audio | `Capture.transcript` | transcript exists for this audio | 30 s |
| 2 normalize | each Asset original | normalized JPEG in memory: EXIF orientation applied, all metadata stripped, HEIC converted, light auto-level | never (cheap) | 10 s |
| 3 cutout | product assets | `Asset.cutoutKey` alpha PNG, trimmed to bounding box | cutout exists for `contentHash` | 60 s, concurrency 4 |
| 4 finalize images | cutouts, scenes, person | `Asset.derived`: products padded to 1:1 with an 8% margin as transparent WebP at 480, 960, 1440; scenes cropped 16:9 and 3:2; person 4:5; uploaded under `assets/{contentHash}/` | derived exists for `contentHash` | 30 s |
| 5 content | transcript, operator prompt, vendor fields, market, downsized images | `contentJson` | never | 60 s |
| 6 design | content, image manifest, fonts, tone, design notes | authored HTML | never | 150 s |
| 7 gate | authored HTML | `GateReport`, screenshots | | 30 s |
| 8 repair | HTML, report, screenshots | repaired HTML, back to step 7 | gate passed, or two repairs done | 120 s each |
| 9 fallback | content, theme | template HTML | gate passed | 1 s |
| 10 finalize and publish | HTML, flags | HTML with flags injected uploaded to `sites/{vendorId}/{version}/index.html`; new SiteVersion; `Vendor.publishedVersionId` swapped in a transaction; status `preview_live`; `previewExpiresAt = now + 7 days` on first publish | | 5 s |

Target end to end under five minutes when the gate passes first time, under eight with one repair.

Step 5 details. One call to `claude-opus-5` using `client.messages.parse` with
`zodOutputFormat(ContentJsonSchema)`, adaptive thinking, effort high, `max_tokens` 4096. The
system prompt holds the persona, the writing guidance per tone, and the hard constraints from
section 6.1, with `cache_control`. The user message carries the transcript, the operator prompt,
the vendor fields, the market, the ordered product asset ids, and the images as base64. Refusal
fallback is enabled, `stop_reason` is checked, and a null `parsed_output` is treated as a guard
violation. About fifteen cents per generation.

Step 6 details are in section 7.1. Steps 6 through 8 together cost roughly fifty cents per site.

Failure handling. A step failure marks the Job failed with the step name and error and logs
`generation_failed`. A failed first generation sets the vendor back to `captured`. A failed
regenerate, reprocess, or republish leaves the vendor's status and published version untouched,
so a live site never goes down because a later job failed. Provider errors retry three times with
backoff inside BullMQ before the job is marked failed. A gate failure is not a job failure; it
leads to repair or fallback.

Other job types reuse the same steps:

- `regenerate_content`: steps 5 to 10. New copy and a new design.
- `regenerate_design`: steps 6 to 10 with the same content. A different page for the same facts.
- `edit_design`: the operator's instruction plus the current HTML go to `repairPage`, then steps
  7 to 10. Used for "make the hero darker" or "swap the order of the products" without
  regenerating from scratch.
- `reprocess_assets`: steps 2 to 4, then 6 to 10, for assets whose derived artifacts are missing.
- `republish`: step 10 only, with the current flags. Used when a vendor is won or when the
  operator edits content JSON by hand, in which case step 6 also runs with "preserve the design,
  update the content."
- `expiry_sweep`: repeatable every ten minutes. Vendors in `preview_live` with
  `previewExpiresAt < now` become `expired` with a `preview_expired` event. Vendors in `won`
  with `previewExpiresAt < now` (the grace period set when a subscription ends) become `churned`.
  No re-render is needed because serving checks status.

## 9. Serving vendor sites

`serveSite(host, path, searchParams)` in `@nazariitsubera/core/sites`:

1. Resolve the slug to a vendor and its published version through an in-process cache with a
   30-second TTL. Publish invalidates the local entry.
2. No vendor, no published version, or status `lost` or `captured`: return the not-found
   page, a small branded static page.
3. Status `expired` or `churned`: return the expired page. Copy: "This preview has ended. Text
   {OPERATOR_NAME} at {OPERATOR_PHONE} to bring it back, or claim it now." with a link to the
   claim page. Claiming after expiry still works and revives the site.
4. `?p={previewToken}` present: if the token matches and no operator session cookie is present,
   record one `preview_opened` event per token, then redirect to the clean URL.
5. `/`: return the HTML body from R2, cached in memory by `htmlKey` because versions are
   immutable. Headers: `Cache-Control: public, max-age=0, s-maxage=60,
   stale-while-revalidate=300`, `Content-Security-Policy: script-src 'none'`, and
   `X-Robots-Tag: noindex` while `renderFlags.noindex` is true.
6. `/robots.txt`: `Disallow: /` while a preview, `Allow: /` once won.
7. Anything else: 404.

Images and fonts are referenced by absolute URL on `img.nazariitsubera.com` under
content-hashed keys with `Cache-Control: public, max-age=31536000, immutable`. HTML never
references anything under a mutable key, so a publish can never break a live page.

Pageview counts come from the serving layer logging one structured line per HTML response.
Nothing in the page reports anything.

## 10. Preview lifecycle

- First publish sets `previewExpiresAt` to seven days from now.
- The banner shows the remaining whole days.
- Extend from the console adds seven days from now and logs `preview_extended`.
- The sweep expires previews. Expired sites show the expired page but keep their version and
  assets.
- Won vendors have `previewExpiresAt` null and are republished through `finalizePage` with the
  banner and noindex off.
- The operator can unpublish at any time, which clears `publishedVersionId` and shows the
  not-found page.

The operator's console shows the preview link with the token, a Copy button, and a Text vendor
button that opens `sms:{vendorPhone}?&body={message}` with this body:

"Hey {contactName or businessName}, this is {OPERATOR_NAME} from {market}. Here's your site:
{previewUrl}. Took about 20 minutes. I'll swing back by in a bit, tell me what you think."

Tapping the button logs `sms_link_tapped`. Sending is the operator's action on their phone, which
is the review gate: nothing is sent until the operator has looked at the preview and chosen to
send.

## 11. Purchase flow

Routes on the apex.

- `/storefront`: the offer. What you get, $299 setup, $59 a month, cancel anytime, taxes
  calculated at checkout, how it works, and the portfolio grid of won vendors with
  `showInPortfolio` true.
- `/claim/[slug]`: the vendor's claim page. Shows the business name, an embedded frame of the live
  site, the price block, and a Claim button. Logs `claim_page_viewed`. If the vendor is already
  won, shows "This site is yours" and a link to the Stripe customer portal. If the slug is
  unknown, 404.
- Claim button posts to `/api/billing/checkout`, which creates a Stripe Checkout Session in
  subscription mode with two line items: the recurring monthly price and the one-time setup price,
  `automatic_tax` enabled, vendor id in metadata, success URL `/claim/[slug]/success`, cancel URL
  back to the claim page. Logs `checkout_started`. Rate limited per IP.
- `/api/webhooks/stripe` verifies the signature, records the Stripe event id in `StripeEvent`
  for idempotency, and handles:
  - `checkout.session.completed`: store customer and subscription ids, set status `won`, tier
    `storefront`, `previewExpiresAt` null, log `paid`, enqueue `republish`.
  - `customer.subscription.deleted`: log `subscription_canceled`, set `previewExpiresAt` to
    seven days from now as a grace period. The sweep then moves the vendor to `churned` and the
    site shows the expired page.
  - `invoice.payment_failed`: log the event. The console shows a warning on the vendor. No
    automated action in v1.
- `/claim/[slug]/success`: confirmation and a "Manage billing" link that creates a portal
  session.

Stripe holds the billing truth. The app mirrors customer and subscription ids and reacts to
events. There is no subscription state machine in the app.

Tier 0 vendors (the first five, free in exchange for a testimonial and introductions) are marked
won with tier `free` from the console. They get the same republish without banner or noindex and
no Stripe objects.

Prices live in Stripe and their ids in env. Stripe Tax must be enabled with the tax code for
data processing or SaaS services, and Texas registration is a prerequisite for the first paid
checkout, per the brief's legal checklist.

## 12. Console

Responsive pages under `/console`, designed for one-handed phone use in daylight: large targets,
high contrast, minimal chrome. Server components by default, client components only for the
recorder, the uploader, and job polling.

- `/console`: the admin list. Columns: vendor, status, market, captured date, preview link,
  opened indicator, expires in. Filters by status. Row actions open the vendor page.
- `/console/new`: business name, contact name, phone, market select (remembers the last choice),
  Instagram handle, and the consent checkbox with this exact stored text: "I give permission for
  Nazarii Tsubera to use these photos and my business details, including my phone number, to
  build my website and to show that website in Nazarii Tsubera's portfolio." Consent text and
  time are stored on the vendor verbatim.
- `/console/[id]`: the vendor workspace.
  - Record: start and stop with a running timer, uploads on stop through a presigned PUT, shows
    transcription status. Formats are whatever `MediaRecorder` produces on the device, `audio/mp4`
    on iOS and `audio/webm` elsewhere. Maximum fifteen minutes.
  - Operator prompt: a free-text field for instructions to the model.
  - Photos: a native file input with `accept="image/jpeg,image/png,image/webp"` and `multiple`,
    so iOS hands over JPEG rather than HEIC; the worker still converts HEIC if one arrives.
    Uploads go directly to R2 through presigned PUTs, then a metadata call creates the Asset.
    Each photo has a three-way kind toggle, a hero star for scenes, and drag ordering.
  - Generate: creates the Job row, enqueues, and shows per-step progress by polling
    `/api/console/vendors/[id]/job` every three seconds.
  - Preview: an embedded frame and the open link. Text vendor and Copy link buttons.
  - Gate: the three screenshots, pass or fallback, and any violations from the published version.
  - Actions: Extend, Regenerate copy, Regenerate design, Edit design (a one-line instruction to
    the author, run through the gate), Reprocess images, Republish, Unpublish, Mark won (free),
    Mark lost, Design notes, Theme override (fallback only), Edit content JSON (a validated editor
    that republishes on save), Show in portfolio toggle.
  - Events: a timeline of the vendor's events.

Uploads are presigned so request bodies never pass through Next. Content types and sizes are
constrained in the presign call.

## 13. Personal site changes

- The current single Next project moves to `apps/web`. Existing pages and components move
  under the marketing route group and `components/marketing/` unchanged in behavior.
- New `/storefront` and `/claim/[slug]` routes in the marketing route group.
- Remove `vercel.json`. Deployment is Railway, with the web service's build and start commands
  updated to the workspace filters in section 4.1.
- `AGENTS.md` is rewritten for this product and `CLAUDE.md` defers to it. The design doc, the
  plans, and the ADRs are the only other documentation; no separate architecture or conventions
  files.
- `.env.example` lists every variable in section 15.

## 14. Acceptance criteria

1. Console submit to preview live in under five minutes for eight photos and a five-minute
   recording, unattended, with real providers, when the gate passes first time; under eight
   minutes with one repair pass.
2. Mobile Lighthouse performance and accessibility both at least 95 on a six-product site.
3. First-load page weight under 400 KB, defined as the HTML with inlined CSS, the fonts, and the
   images that load eagerly. Lazy images are excluded. Measured by the gate from the network log.
4. Zero JavaScript on vendor pages, enforced by the CSP header, rejected by the gate's HTML lint,
   and checked by a template test that the HTML contains no `<script>` element.
5. No fabricated factual claims across a spot check of ten generated sites, and the content
   guard tests pass.
6. Template product cards from one capture are visually consistent: same aspect, padding,
   ground, and shadow. Snapshot test. Authored pages are judged by the operator at the review
   gate.
7. Every template theme passes WCAG AA for all text pairs in light and dark, by test. Every
   authored page passes axe color-contrast in both modes, by the gate.
8. Publishing creates a new immutable version and swaps a pointer. The live URL returns a valid
   page at every moment during a publish. Integration test.
9. Derived images carry no EXIF metadata. Test reads the metadata of generated files.
10. Previews expire at seven days and can be revived by claiming. Integration test.
11. A failed step resumes from that step on retry without redoing completed steps.
12. Stripe `checkout.session.completed` flips the vendor to won and the next served HTML has no
    banner and no noindex. Integration test with a fixture event.
13. No page is published without a passing gate report or an explicit template fallback recorded
    on the version. Repair is bounded to two passes. Integration test with a fixture page that
    fails the lint.
14. `finalizePage` injects the banner and noindex into both an authored page and a template page,
    and removes them when flags are off. Unit test.

## 15. Observability, security, privacy

- Structured JSON-line logs from a small logger module in both processes, carrying `vendorId`,
  `jobId`, and `step` where known. No logging library and no error-reporting service in v1;
  Railway captures stdout. Adding either later is a change inside the logger module.
- Boot-time env assertion with a Zod schema, fail-fast in production. Required: `DATABASE_URL`,
  `REDIS_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`,
  `SITE_ROOT_DOMAIN`, `ASSETS_PUBLIC_URL`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`,
  `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`,
  `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_SETUP`, `STRIPE_PRICE_MONTHLY`, `OPERATOR_NAME`,
  `OPERATOR_PHONE`, plus the transcription and background-removal keys named by the chosen
  providers. Optional: `PROVIDERS_MODE` (`real` or `fake`), `PREVIEW_DAYS` (default 7).
- Operator-only middleware on console routes and console API. Stripe signature verification on
  webhooks. Presigned uploads constrained by content type and size. Rate limiting on the checkout
  endpoint and the claim page with a small Redis-backed limiter.
- Vendor phone numbers appear on public pages only with stored consent. Previews are noindex
  and carry no analytics script. Original photos are retained in R2 under the consent the vendor
  gave; marking a vendor lost does not delete them in v1.
- All EXIF, including GPS, is stripped from every derived image. Originals are never served.

## 16. Testing

Three lanes. Every task is test-first: write the failing test, make it pass, commit.

- Unit (`pnpm test`): template snapshots from fixture content, theme contrast, content guard,
  HTML lint against fixture pages with planted violations, visible-text guard, `finalizePage`,
  slug generation and reserved names, middleware host parsing, sms body formatting, status
  transitions. All adapters mocked or fake.
- Integration (`pnpm test:integration`): repositories against ephemeral Postgres, publish pointer
  swap and serving resolution, expiry sweep, Stripe webhook handlers with fixture events, job
  step skipping, the browser adapter running Chromium against the template's output and against
  a fixture page with overflow and a contrast failure.
- E2E (`pnpm test:e2e`): Playwright with `PROVIDERS_MODE=fake`. API project: create vendor,
  upload, generate, serve on a fake host header, claim and webhook. Browser project: console
  flow on a phone viewport, storefront and claim pages.
- Manual acceptance: Lighthouse on a real generated site, and the ten-site fabrication spot check
  before the first paid vendor.

## 17. Build order within v1

1. Foundation: convert the repo to the pnpm workspace with `apps/web` and `packages/core`; move
   the existing site into `apps/web` and confirm the Railway web service still deploys; rewrite
   AGENTS.md. Prisma, Better Auth, the logger, the env schema, the integration and e2e lanes,
   docker compose, `apps/worker`, and Redis are each added by the first plan that needs them,
   not up front.
2. Template, themes, render function, fixture content, snapshot and contrast tests, a Lighthouse
   run on the static output. This is the floor and the quality bar the author is shown, and it
   lets the first sites be hand-built before any pipeline exists.
3. Serving: middleware, `_sites` route, R2 adapter, versions and publish, preview, expired and
   not-found pages. Hand-publish a fixture site to a real subdomain.
4. Console and data: vendors, markets, captures, assets, presigned uploads, jobs infrastructure,
   admin list.
5. Pipeline with fake adapters end to end, then real providers one at a time: transcription,
   cutouts, content, then the design step, the gate with Chromium in the worker image, and repair.
6. Polish: regenerate and reprocess flows, extend, events timeline, preview-opened tracking,
   content JSON editor, theme override, portfolio toggle, mark won by hand.
7. Backlog, not scheduled: purchase flow (storefront page, claim page, Stripe checkout, tax,
   webhooks, portal, republish on won). Until it lands, the operator marks vendors won from the
   console and invoices outside the system. Sections 11 and 14.12 describe the eventual design.

Steps 2 and 3 together let the first vendors be served by hand-written content before the
pipeline exists, which is the brief's own rule: do the first five by hand, automate what hurts.

## 18. Open decisions

Defaults are stated so planning can proceed. Any of these can be changed before the plan is
written.

1. Repository visibility. Default: private. If public, secrets hygiene and docs tone need a
   pass before the first push.
2. Transcription provider. Claude has no audio input, so this is a separate provider behind the
   adapter. Default: Deepgram, for accuracy in noisy environments and simple REST upload.
   Alternative: OpenAI Whisper. Both cost cents per recording.
3. Background removal provider. Default: a hosted rembg model on Replicate, about two cents per
   site and the same model family the brief named. Alternative: Photoroom or remove.bg at higher
   quality and roughly ten times the cost. A self-hosted sidecar remains possible behind the
   same interface.
4. Console location. Default: `/console` on the apex. Alternative: `app.nazariitsubera.com`,
   which costs a Railway domain slot on the Hobby plan.
5. Domain registration for paid vendors. Default: the operator registers the domain in their own
   Cloudflare account and attaches it, per the brief's unit economics. Alternative: vendors bring
   their own, which moves DNS support onto the operator.
6. Churn grace period. Default: seven days after the subscription ends, then the expired page.
   Alternative: immediate.
7. Model for the design and repair steps. Default: `claude-opus-5` for both. Alternative: Sonnet 5
   for repairs if latency at the booth matters more than the last increment of design quality.
8. Repair passes before fallback. Default: two. Fewer is faster; more rarely helps.

## 19. Documents this design produces

- `docs/superpowers/plans/2026-09-05-booth-to-mrr-engine-plan.md`: the implementation plan,
  written next.
- `AGENTS.md` and `CLAUDE.md`.
- ADRs in `docs/decisions/` for: one repository for site and engine; pnpm workspace with a
  single core package consumed as source; two-service Railway topology; BullMQ with a Postgres job record; static zero-JavaScript vendor pages authored by the
  model within a gate, with a template fallback; operator-sent SMS as the review gate; Stripe as billing system of record; hostname
  routing in middleware with a single serve function.
