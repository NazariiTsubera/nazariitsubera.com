# Booth to MRR Plan 3: Console and Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** The operator can sign in on a phone, create a vendor with consent, record the booth conversation, upload and tag photos, and see them stored, with a worker process and durable job queue ready for Plan 4's pipeline.

**Architecture:** New core modules `storage` (R2 through the S3 API with a local filesystem fake), `auth` (Better Auth with one operator, signup disabled), `vendors`, `markets`, `captures`, `assets`, and `jobs` (BullMQ with a Postgres `Job` row as the durable record). A second deployable `apps/worker` runs the queue. The web app gains `/console` pages behind a session guard.

**Tech Stack:** Better Auth 1.7, BullMQ 6 on Redis 7, `@aws-sdk/client-s3` 3 with `s3-request-presigner`, Prisma 6, Next 16, Vitest 4.

**Spec:** design sections 4.3, 4.4, 5 (Capture, Asset, Job), 12. Payments stay backlogged.

## Global Constraints

- Uploads go straight from the browser to storage through a presigned PUT. Request bodies never carry file bytes.
- `PROVIDERS_MODE=fake` (the default outside production) selects the local filesystem storage adapter writing under `.storage/`, so the whole console works with no cloud credentials.
- Storage keys are content addressed: `uploads/{vendorId}/{sha256}.{ext}`. The browser computes the hash with `crypto.subtle`.
- Better Auth has `disableSignUp: true`. The single operator account is created by a seed script.
- Every console route and console API handler requires the operator session. Unauthenticated requests get 401 or a redirect to `/console/login`.
- A `Job` row in Postgres is created before the BullMQ enqueue and is what the console reads. Redis holds work in flight only.
- Branch `booth-to-mrr/03-console-and-data`. Commit at every task boundary. Do not push.
- Commit messages end with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

---

### Task 1: Storage adapter with presigned uploads

**Files:** `packages/core/src/storage/{index,types,local,r2}.ts`, `storage.test.ts`; env additions.

**Interfaces:**
```ts
export type PresignedUpload = { url: string; method: "PUT"; headers: Record<string, string>; key: string; publicUrl: string };
export interface Storage {
  presignUpload(key: string, contentType: string, maxBytes: number): Promise<PresignedUpload>;
  put(key: string, body: Uint8Array, contentType: string): Promise<void>;
  get(key: string): Promise<Uint8Array | null>;
  publicUrl(key: string): string;
  exists(key: string): Promise<boolean>;
}
export function storage(): Storage;              // picks r2 or local from env
export function uploadKey(vendorId: string, sha256: string, contentType: string): string;
export const ALLOWED_UPLOAD_TYPES: Record<string, string>;  // mime -> extension
```
Local adapter writes under `.storage/` and presigns to `/console/api/upload-local?key=...`, a route that accepts the PUT in development. R2 adapter uses `S3Client` with `getSignedUrl(PutObjectCommand)`, 10-minute expiry.

- [ ] Step 1: failing tests: `uploadKey` shape and extension mapping, rejection of a disallowed mime, local round trip through `put`/`get`/`exists`/`publicUrl`, presign returns a PUT url containing the key.
- [ ] Step 2: implement types, local, r2, and the `storage()` selector. Add env `PROVIDERS_MODE`, `STORAGE_DIR`, `R2_*`, `ASSETS_PUBLIC_URL`.
- [ ] Step 3: commit `feat(core): add storage adapter with presigned uploads and a local fake`.

### Task 2: Better Auth with a single operator

**Files:** `packages/core/prisma/schema.prisma` (Better Auth models), `packages/core/src/auth/{index,auth,guard}.ts`, `packages/core/scripts/seed-operator.ts`, `apps/web/app/api/auth/[...all]/route.ts`, `apps/web/app/console/login/page.tsx`, `apps/web/lib/auth-client.ts`.

**Interfaces:** `auth` (Better Auth instance, `disableSignUp: true`, Prisma adapter, database sessions); `requireOperator(headers): Promise<Session>` throws `UnauthorizedError`; `getOperator(headers): Promise<Session | null>`. Seed script `pnpm --filter @nazariitsubera/core seed:operator` reads `OPERATOR_EMAIL` and `OPERATOR_PASSWORD` and creates or updates the one account.

- [ ] Step 1: add Better Auth models to the Prisma schema, migrate.
- [ ] Step 2: failing guard test (missing session throws, present session returns).
- [ ] Step 3: implement auth config, guard, seed script, the catch-all route, and a minimal login page.
- [ ] Step 4: verify sign-in works and `/console` redirects when signed out. Commit `feat(core): add Better Auth with a single seeded operator`.

### Task 3: Markets and vendors

**Files:** `packages/core/src/markets/{index,market.repository,seed}.ts`, `packages/core/src/vendors/{index,vendor.repository,vendor.service,vendor.schema}.ts`, tests; Prisma `Market` model plus `Vendor.marketId`, `Vendor.bestSellerNote`.

**Interfaces:** `marketRepository.list()`, `seedMarkets()` (the San Antonio markets from the brief); `createVendorSchema` (Zod: businessName, contactName?, phone E.164, instagramHandle?, marketId?, consent boolean that must be true, consentText); `vendorService.createVendor(input)` slugifies with collision handling, stores consent verbatim with a timestamp, records `vendor_created`; `vendorService.list(filter)`; `vendorService.get(id)`; `vendorService.update(id, patch)`; `vendorService.markWon(id, tier)`, `markLost(id)`.

- [ ] Step 1: schema and migration. - [ ] Step 2: failing unit tests for the schema and an integration test for create with slug collision and consent. - [ ] Step 3: implement. - [ ] Step 4: commit `feat(core): add markets and vendors with consent and slug allocation`.

### Task 4: Captures and assets

**Files:** `packages/core/src/captures/*`, `packages/core/src/assets/*`, tests; Prisma `Capture` and `Asset` models.

**Interfaces:** `captureService.startUpload(vendorId, contentType, sha256, bytes)` returns a presigned upload plus a `Capture` row in state `uploaded`; `captureService.setPrompt(captureId, text)`; `assetService.startUpload(vendorId, contentType, sha256, bytes)` returns a presigned upload plus an `Asset` row; `assetService.setKind(assetId, kind)`, `reorder(vendorId, ids)`, `setHero(assetId)`, `remove(assetId)`. Uploads are idempotent by `(vendorId, sha256)`.

- [ ] Step 1: schema and migration. - [ ] Step 2: failing integration tests: duplicate upload returns the same row; reorder writes contiguous indexes; only one hero per vendor. - [ ] Step 3: implement. - [ ] Step 4: commit `feat(core): add captures and assets with content-addressed uploads`.

### Task 5: Jobs infrastructure and the worker app

**Files:** `packages/core/src/jobs/{index,queue,job.repository,job.service,types}.ts`, tests; Prisma `Job` model; `apps/worker/{package.json,tsconfig.json,src/index.ts,src/processors/expiry-sweep.ts}`; root scripts.

**Interfaces:** `enqueue(type, vendorId, payload)` writes the `Job` row inside a transaction, then adds to BullMQ, storing `bullJobId`; `jobRepository.get(id)`, `latestForVendor(vendorId)`, `markRunning/markStep/markSucceeded/markFailed`; `startWorker()` registers processors and a repeatable `expiry_sweep` every ten minutes, with ordered shutdown on SIGTERM. Redis is required at boot in the worker; the web process degrades to a 503 on enqueue if Redis is unreachable.

- [ ] Step 1: schema and migration. - [ ] Step 2: failing tests: the durable row exists before the queue add; a failed add marks the row failed; step recording. - [ ] Step 3: implement core jobs plus `apps/worker`. - [ ] Step 4: run the worker, confirm the sweep tick and a test job. - [ ] Step 5: commit `feat: add BullMQ jobs with durable Postgres rows and the worker app`.

### Task 6: Console UI

**Files:** `apps/web/app/console/{layout,page}.tsx`, `console/new/page.tsx`, `console/[id]/page.tsx`, console components, `apps/web/app/api/console/**` route handlers.

Pages: list (vendor, status, market, captured date, preview link, opened, expires in), new capture form with the consent checkbox, and the vendor workspace (recorder, operator prompt, photo uploader with kind toggles and ordering, preview panel with copy link and an `sms:` button, actions: extend, unpublish, republish, mark won, mark lost). All server components except the recorder, uploader, and job poller. Large touch targets, high contrast, one-handed.

- [ ] Step 1: route handlers for upload presign, vendor create and update, asset kind and order, capture prompt, and the action endpoints, each guarded.
- [ ] Step 2: pages and components.
- [ ] Step 3: verify the whole flow in a browser against the local stack.
- [ ] Step 4: commit `feat(web): add the operator console`.

### Task 7: Docs and verification

- [ ] AGENTS.md commands and module list; README local setup with the seed step; design deviations. Full verification: lint, typecheck, unit, integration, build. Commit `docs: document the console and worker`.


## Deviations recorded during execution

- Route folders may not start with an underscore (Next treats those as private), so local media
  is served from `/media/[...key]` and fonts from `/fonts`.
- `prisma migrate dev` waits on an interactive TTY prompt; `db:migrate` sets `CI=1`.
- Better Auth 1.7 has no `auth.api.createUser` when sign-up is disabled. The seed script uses
  `ctx.internalAdapter.createUser(user, { method: "email-password" })` plus `createAccount`.
- `better-auth` and `zod` are direct dependencies of `apps/web` as well as core, because the app
  imports their Next and React entrypoints directly.
- The browser pane refused to open the app origin, so the console flow is verified by
  `scripts/console-smoke.sh` over real HTTP rather than by clicking.
