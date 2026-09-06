# nazariitsubera.com Working Guide

## Purpose
One repository holds the personal consulting site and the Booth to MRR engine: an operator
console that turns a recorded booth conversation plus photos into a live vendor website on a
subdomain, a seven-day preview, and (backlogged) a Stripe purchase path that makes it permanent.

Design: `docs/superpowers/specs/2026-09-05-booth-to-mrr-engine-design.md`.
Plans: `docs/superpowers/plans/`. Decisions: `docs/decisions/`.

## Layout
- `apps/web`: Next.js App Router. Marketing pages, `/console`, API route handlers, vendor-site
  serving by hostname. Port 3000.
- `apps/worker`: Node process run with `tsx`. BullMQ processors and the repeatable expiry sweep.
- `packages/core` (`@nazariitsubera/core`): every domain module, shipped as TypeScript source with
  one `exports` entry per module. No build step.

## Commands
- `docker compose up -d` starts local Postgres and Redis
- `pnpm install`, `pnpm dev` (web + worker), `pnpm dev:web`, `pnpm dev:worker`, `pnpm build`
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:integration`
- `pnpm --filter @nazariitsubera/core db:migrate -- --name <name>` creates a migration
- `pnpm --filter @nazariitsubera/core seed:operator` creates the one console account
- `pnpm --filter @nazariitsubera/core seed:markets` loads the San Antonio markets
- `pnpm --filter @nazariitsubera/core publish:fixture` puts the demo vendor live locally
- `bash scripts/console-smoke.sh` exercises the console end to end over HTTP
- `pnpm --filter @nazariitsubera/core render:fixture [--theme <id>]` renders the demo vendor to
  `packages/core/out/`; serve it with the `template-preview` entry in `.claude/launch.json`.

## Architecture rules
- Dependency direction is `apps -> core`, never the reverse, never app to app. ESLint enforces it.
- Browser code imports only `@nazariitsubera/core/contracts`. Every other core module is server-only.
- Only `packages/core/src/template` renders React to a string.
- Vendor hostnames are routed by `apps/web/proxy.ts` into `app/sites/[slug]`, which calls
  `serveSite`. Route folders must not start with an underscore: Next treats those as private.
- Uploads are presigned: the browser hashes the file, asks for a PUT url, and sends the bytes
  straight to storage. Request bodies never carry file bytes.
- `PROVIDERS_MODE=fake` (the default outside production) selects local disk and stub providers,
  so the whole console runs with no cloud credentials.
- A `Job` row in Postgres is created before the BullMQ enqueue and is what the console reads.
  Redis only holds work in flight.
- Sign-up is disabled. The single operator account exists only because the seed script made it.
- Domain modules follow `service + repository`: route handlers parse, authenticate, call a
  service, return. Services own business rules and transactions. Repositories own queries.
- Zod schemas live next to their domain; types are inferred from them. No duplicate DTOs.
- Every table carries `vendorId`. Site versions are immutable; publish is a pointer swap.
- External providers sit behind adapters with a real and a fake implementation.
- Dependencies are added by the first task that needs them, never up front. Prefer a small
  in-repo module over a library when the module is a few dozen lines.

## Vendor-site rules
- Static HTML with inlined CSS, zero JavaScript, `srcset` on every image, hero eager and the
  rest lazy, responsive to 360px with no horizontal scroll. The serving layer sends
  `Content-Security-Policy: script-src 'none'`.
- Production pages are authored by the model per vendor from the design brief
  (`packages/core/src/design`) and must pass the gate (`packages/core/src/gate`): HTML lint,
  visible-text guard, headless Chromium with axe in light and dark. Up to two repairs, then the
  template renders the same content as the fallback.
- The template (`packages/core/src/template`) and its curated themes (`packages/core/src/themes`)
  are the floor: deterministic, snapshot-tested, every theme WCAG AA by test, fixed section order
  with empty sections omitted.
- The preview banner and the robots noindex tag are injected at publish by `finalizePage`, never
  written by the template or the author.
- Content limits: tagline 60, headline 48, sub 110, product name 32, blurb 90, CTA 20. Facts come
  only from the content JSON; the content guard runs on the visible text of every page.

## Naming
Kebab-case files. `*.service.ts`, `*.repository.ts`, `*.schema.ts`, `*.test.ts(x)`. React
components in PascalCase exports. No barrel exports beyond a module's `index.ts`.

## Workflow
- Test first: write the failing test, make it pass, commit. Commit at every task boundary.
- Unit lane: `pnpm test` (vitest, node environment for core). Fast, hermetic.
- Integration (ephemeral Postgres and Redis via docker compose) and e2e (Playwright) lanes
  arrive with Plan 2 and Plan 3.
- Slim, readable code. Small files with one responsibility.

## Decision logging
When an architecture, schema, API, auth, billing, pipeline, or template convention materially
changes, add an ADR under `docs/decisions/` following the existing `ADR-NNNN-title.md` pattern.

## Deployment
Railway, service `nazariitsubera.com`. Build `pnpm install --frozen-lockfile && pnpm --filter web build`,
start `pnpm --filter web start`, pre-deploy `pnpm --filter @nazariitsubera/core db:migrate:deploy`.
Custom domains `nazariitsubera.com` and `*.nazariitsubera.com` are attached to it. DNS is on
Cloudflare, proxied, SSL mode Full.

The `worker` service runs from the same repo with start `pnpm --filter worker start` and no
public networking.

Required variables on both services: `DATABASE_URL` (reference `${{Postgres.DATABASE_URL}}`),
`REDIS_URL` (`${{Redis.REDIS_URL}}`), `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`,
`SITE_ROOT_DOMAIN`, `NEXT_PUBLIC_APP_URL`, `OPERATOR_NAME`, `OPERATOR_PHONE`, `PREVIEW_DAYS`,
`PROVIDERS_MODE=real`, `ASSETS_PUBLIC_URL`, and the `R2_*` credentials.
