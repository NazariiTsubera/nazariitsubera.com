# Booth to MRR Plan 2: Serving and Publish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put a hand-built vendor site live on `{slug}.nazariitsubera.com` with a seven-day preview: Postgres with Prisma, immutable site versions with pointer-swap publish, hostname routing in Next, the `serveSite` function with preview, expired, and not-found pages, `finalizePage` injecting the banner and noindex, font serving, and a CLI that publishes the demo fixture.

**Architecture:** New core modules `env`, `logger`, `db`, `hosting` (pure host routing usable from the Next proxy), and `sites` (repository, service, finalize, serve, pages, cache). The Next app gains `proxy.ts` for hostname routing, a `_sites` route that calls `serveSite`, a `_assets/fonts` route, and boot-time env assertion. HTML is stored on the `SiteVersion` row; R2 arrives in Plan 3 for photos.

**Tech Stack:** Prisma 6.19 with Postgres 16 (Docker locally), Zod 4, Vitest 4 (unit and a new integration lane), Next 16 `proxy.ts`, Node 22 `--env-file-if-exists`.

**Spec:** `docs/superpowers/specs/2026-09-05-booth-to-mrr-engine-design.md` sections 4.2, 5 (Vendor, SiteVersion, Event), 7.5, 9, 10, 14.8, 14.10, 14.14. Deviations recorded in Task 8: HTML on the version row instead of R2, fonts served by the web app instead of R2.

## Global Constraints

- Prisma `^6.19.0` and `@prisma/client` `^6.19.0`. Schema at `packages/core/prisma/schema.prisma`. Migrations are committed and run with `prisma migrate deploy` in Railway's pre-deploy.
- One `.env` at the repository root, gitignored. Next loads it from `next.config.ts`; core scripts run with `node --env-file-if-exists=../../.env`.
- Every table carries `vendorId`. `SiteVersion` rows are immutable. Publish swaps `Vendor.publishedVersionId` in a transaction.
- Vendor pages are served with `Content-Security-Policy: script-src 'none'`, `X-Content-Type-Options: nosniff`, and `Cache-Control: public, max-age=0, s-maxage=60, stale-while-revalidate=300`. Previews add `X-Robots-Tag: noindex`.
- The template never renders the banner or robots tag; `finalizePage` injects both between marker comments and is idempotent.
- Reserved subdomains: `www app api admin console img mail static claim storefront dev staging sites assets`.
- Core stays free of `next`. Host routing lives in `@nazariitsubera/core/hosting` with no Node imports so the proxy can use it on any runtime.
- Work on branch `booth-to-mrr/02-serving-and-publish`. Commit at every task boundary. Do not push.
- Every commit message ends with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

---

### Task 1: Local Postgres, env module, logger, Prisma schema and client

**Files:** `docker-compose.yml`, `docker/postgres-init.sql`, `.env.example` (root), `packages/core/prisma/schema.prisma`, `packages/core/src/env/index.ts` (+ test), `packages/core/src/logger/index.ts` (+ test), `packages/core/src/db/index.ts`, `apps/web/next.config.ts`, `apps/web/instrumentation.ts`, `packages/core/package.json`.

**Interfaces:**
- `@nazariitsubera/core/env`: `env()` returns validated `{ DATABASE_URL, SITE_ROOT_DOMAIN, NEXT_PUBLIC_APP_URL, OPERATOR_NAME, OPERATOR_PHONE, PREVIEW_DAYS }`; `resetEnvCache()`; `assertBootEnv()` throws in production when required vars are missing, warns otherwise.
- `@nazariitsubera/core/logger`: `createLogger(base)` returning `{ info, warn, error, child }`; `log` default. One JSON object per line.
- `@nazariitsubera/core/db`: `prisma` singleton; re-exports `Prisma`, enums, and row types.

- [ ] Step 1: compose file with Postgres 16 and Redis 7, init SQL creating `nazariitsubera_test`, root `.env.example` with HubSpot, DATABASE_URL, TEST_DATABASE_URL, SITE_ROOT_DOMAIN, NEXT_PUBLIC_APP_URL, OPERATOR_NAME, OPERATOR_PHONE, PREVIEW_DAYS. Move `apps/web/.env` back to `.env`. `docker compose up -d --wait postgres`.
- [ ] Step 2: failing tests for `env` (defaults, production throw, dev warn) and `logger` (JSON line shape, error serialization). Run: FAIL on unresolved imports.
- [ ] Step 3: implement `env` (Zod schema, cached parse, `assertBootEnv`) and `logger` (console JSON lines, `child`). Run: 5 passed.
- [ ] Step 4: Prisma schema (enums VendorStatus, VendorTier, AuthoredBy, EventType; models Vendor, SiteVersion, Event with `Vendor.publishedVersionId` unique FK and `@@unique([vendorId, version])`), `db` singleton on `globalThis`, package exports for env/logger/db/hosting/sites, scripts `postinstall: prisma generate`, `db:migrate`, `db:migrate:deploy`, `db:studio`, `test:integration`, `publish:fixture` (core scripts run through `node --env-file-if-exists=../../.env`), deps `@prisma/client` and `prisma` `^6.19.0`. `next.config.ts` loads the root `.env` with `process.loadEnvFile` and sets `serverExternalPackages: ["@prisma/client", "prisma"]`. `instrumentation.ts` calls `assertBootEnv()` on the Node runtime. Run `pnpm install` then `pnpm --filter @nazariitsubera/core db:migrate -- --name init`. The `db:migrate` script sets `CI=1`, because `prisma migrate dev` otherwise waits on an interactive TTY prompt and hangs forever. Expected: migration created and applied.
- [ ] Step 5: `pnpm lint && pnpm typecheck && pnpm test` clean. Commit `feat(core): add Postgres via Prisma, env validation, and a JSON logger`.

### Task 2: Hosting: pure hostname routing and slugs

**Files:** `packages/core/src/hosting/{index,host,slug}.ts`, tests `host.test.ts`, `slug.test.ts`.

**Interfaces:** `routeHost(host: string | null, rootDomains: string[]): { kind: "app" } | { kind: "site"; slug } | { kind: "domain"; host }`. Apex, `www.`, `*.up.railway.app`, `localhost`, `127.0.0.1`, reserved labels, and null are `app`; a first-level label under a root is `site`; nested or foreign hosts are `domain`. `RESERVED_SLUGS`, `slugify(name)` (NFKD, lowercase, hyphens, max 40, reserved words get `-shop`, empty becomes `vendor`), `uniqueSlug(base, taken)` appends `-2`, `-3`.

- [ ] Step 1: failing tests (7 cases). - [ ] Step 2: implement. - [ ] Step 3: commit `feat(core): add hosting module with hostname routing and slugs`.

### Task 3: `finalizePage` and the static pages

**Files:** `packages/core/src/sites/finalize-page.ts`, `pages.ts`, tests.

**Interfaces:** `finalizePage(html, flags: RenderFlags, { claimUrl })` strips any previous `<!--nt:noindex-->`, `<!--nt:banner-->`, `<!--nt:banner-style-->` blocks, then injects the robots meta before `</head>` when `noindex`, and a fixed-position banner anchor with inline styles before `</body>` plus `body{padding-bottom:72px}` in the head when `preview`. Attribute values are escaped. `notFoundPage()` and `expiredPage({ operatorName, operatorPhone, claimUrl })` are complete zero-script documents with noindex.

- [ ] Step 1: failing tests (injection, idempotence and removal, expiry wording; pages content). - [ ] Step 2: implement. - [ ] Step 3: commit `feat(core): add finalizePage injection and the not-found and expired pages`.

### Task 4: `serveSite` with a store interface and an in-memory cache

**Files:** `packages/core/src/sites/serve.ts`, `cache.ts`, `serve.test.ts`.

**Interfaces:** `PublishedSite { vendorId, slug, status, previewToken, previewExpiresAt, previewOpenedAt, html, noindex }`; `SiteStore { findPublishedBySlug(slug); markPreviewOpened(vendorId) -> boolean }`; `serveSite({ slug, path, search, store, ctx: { operatorName, operatorPhone, claimBaseUrl }, now? }) -> { status, headers, body }`. Rules: unknown, `lost`, or `captured` return 404 not-found; `expired`, `churned`, or a past `previewExpiresAt` on a non-won vendor return the expired page; `/robots.txt` answers by indexability; `?p=<token>` marks the first open and 302s to `/`; any other path is 404; every response carries CSP `script-src 'none'` and nosniff; HTML carries the cache header; noindex sites carry `X-Robots-Tag`. `cached(key, load, now)` with a 30 s TTL; `invalidateSite(slug)`; `clearSiteCache()`.

- [ ] Step 1: failing tests (9 cases). - [ ] Step 2: implement. - [ ] Step 3: commit `feat(core): add serveSite with store interface, TTL cache, and preview tracking`.

### Task 5: Sites repository and service on Prisma, with the integration lane

**Files:** `packages/core/src/sites/site.repository.ts`, `site.service.ts`, `index.ts`, `packages/core/vitest.integration.config.ts`, `packages/core/src/test/integration-setup.ts`, `scripts/integration-test.sh`, root script `test:integration`, `site.integration.test.ts`.

**Interfaces:** `siteRepository { findVendorBySlug, slugTaken, createVendor, recordEvent }`; `prismaSiteStore: SiteStore`; `siteService { publishSite(input) -> SiteVersion, expirePreviews(now) -> { expired, churned }, extendPreview(vendorId, days, now) -> Date, unpublish(vendorId) }`; `previewDaysLeft(expiresAt, now)`. `publishSite` runs in one transaction: next version number, create row, swap pointer, set `preview_live` and start the clock on first publish unless won, record `preview_published`, then invalidate the cache. The integration setup refuses to run unless `TEST_DATABASE_URL` ends in `_test` and copies it into `DATABASE_URL`. `scripts/integration-test.sh` sources `.env`, brings Postgres up, migrates the test database, runs the lane.

- [ ] Step 1: lane plumbing. - [ ] Step 2: failing integration test (versions and pointer; serve through the Prisma store and first-open tracking; expiry then extend; unpublish). - [ ] Step 3: implement. Run `pnpm test:integration`: 4 passed. The unit config must exclude `src/**/*.integration.test.ts`, since it also matches `*.test.ts`; then `pnpm test` stays green. - [ ] Step 4: commit `feat(core): add sites repository and service with publish, expiry, and integration lane`.

### Task 6: Next proxy, `_sites` route, fonts route, health with DB

**Files:** `apps/web/proxy.ts`, `apps/web/app/sites/[slug]/[[...path]]/route.ts`, `apps/web/app/assets/fonts/[file]/route.ts`, `apps/web/app/api/health/route.ts`.

- [ ] Step 1: `proxy.ts` exports `proxy(request)`: `routeHost` with roots `[SITE_ROOT_DOMAIN, "localhost"]`; app hosts pass through; site hosts rewrite to `/sites/{slug}{path}`; domains to `/sites/_domain/{host}{path}`. Matcher excludes `_next/`, `assets/`, `sites/`, `icon.svg`, `favicon.ico`. The route folders must NOT start with an underscore: Next treats `_name` folders as private and excludes them from routing. The route additionally 404s when the Host header is an app host, so `/sites/<slug>` on the apex serves nothing.
- [ ] Step 2: `sites` route: GET builds the path from params, calls `serveSite` with `prismaSiteStore` and env-derived ctx (`claimBaseUrl = NEXT_PUBLIC_APP_URL/claim`), returns the result verbatim; `_domain` returns 404.
- [ ] Step 3: fonts route serves only files declared by themes, `font/woff2`, immutable cache.
- [ ] Step 4: health runs `SELECT 1` and reports `db: true`, 503 otherwise.
- [ ] Step 5: build, start, verify: health shows db true; unknown vendor host returns 404 with CSP and noindex; font returns 200 immutable.
- [ ] Step 6: commit `feat(web): route vendor hostnames to serveSite, serve fonts, check db in health`.

### Task 7: Publish the demo fixture and see it on a subdomain

**Files:** `packages/core/scripts/publish-fixture.ts`, fixture README.

- [ ] Step 1: script upserts the vendor by `slugify(businessName)` (unique suffix if taken), renders with `assetsBaseUrl: "/assets"`, `siteUrl` and `claimUrl` from env, finalizes with preview flags, publishes as `template`, prints live and local preview URLs with the token.
- [ ] Step 2: run it, start the app, and curl `Host: pearl-street-pottery.localhost`: 200 with noindex, CSP, cache header; body has two `nt:banner` markers, `Expires in 7 days`, the robots meta, no `<script`; the token URL 302s to `/`; robots.txt disallows.
- [ ] Step 3: commit `feat(core): add publish-fixture CLI to put a hand-built site live`.

### Task 8: Docs, design deviations, Railway steps

- [ ] Step 1: design doc: R2 holds only `uploads/` and `assets/`; fonts served by web at `/assets/fonts`; `SiteVersion.html` replaces `htmlKey`; serving reads HTML from the row; Railway service is named `nazariitsubera.com`.
- [ ] Step 2: AGENTS.md commands (`docker compose up -d`, `pnpm test:integration`) and deployment (Postgres attached, `DATABASE_URL` reference, `SITE_ROOT_DOMAIN`, `NEXT_PUBLIC_APP_URL`, `OPERATOR_NAME`, `OPERATOR_PHONE`, `PREVIEW_DAYS`, pre-deploy `pnpm --filter @nazariitsubera/core db:migrate:deploy`); README adds `docker compose up -d`.
- [ ] Step 3: `pnpm install --frozen-lockfile && pnpm lint && pnpm typecheck && pnpm test && pnpm test:integration && pnpm build`; commit `docs: record serving deviations and Railway database steps`.

**Railway, needs the operator's consent (billable):** add Postgres, attach `DATABASE_URL` as `${{Postgres.DATABASE_URL}}`, set the variables above, set the pre-deploy command, then push. Verify `https://nazariitsubera.com/api/health` returns `"db":true` and `https://anything.nazariitsubera.com/` returns 404 with the CSP header.
