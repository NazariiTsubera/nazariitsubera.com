# nazariitsubera.com

Personal consulting site and the Booth to MRR vendor-website engine, in one pnpm workspace.

- `apps/web`: Next.js app. Marketing pages, operator console, API routes, vendor-site serving.
- `apps/worker`: background worker (arrives in Plan 3).
- `packages/core`: `@nazariitsubera/core`, every domain module, consumed as TypeScript source.

## Run locally

```sh
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Checks

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Docs

- Design: `docs/superpowers/specs/2026-09-05-booth-to-mrr-engine-design.md`
- Plans: `docs/superpowers/plans/`
- Decisions: `docs/decisions/`
- Working guide for agents: `AGENTS.md`
