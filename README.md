# nazariitsubera.com

Personal consulting site and the Booth to MRR vendor-website engine, in one pnpm workspace.

- `apps/web`: Next.js app. Marketing pages, operator console, API routes, vendor-site serving.
- `apps/worker`: background worker (arrives in Plan 3).
- `packages/core`: `@nazariitsubera/core`, every domain module, consumed as TypeScript source.

## Run locally

```sh
docker compose up -d
pnpm install
cp .env.example .env          # then set BETTER_AUTH_SECRET, OPERATOR_EMAIL, OPERATOR_PASSWORD
pnpm --filter @nazariitsubera/core db:migrate:deploy
pnpm --filter @nazariitsubera/core seed:operator
pnpm --filter @nazariitsubera/core seed:markets
pnpm dev
```

The console is at http://localhost:3000/console.

Open http://localhost:3000.

## Checks

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm test:integration
pnpm build
```

## Docs

- Design: `docs/superpowers/specs/2026-09-05-booth-to-mrr-engine-design.md`
- Plans: `docs/superpowers/plans/`
- Decisions: `docs/decisions/`
- Working guide for agents: `AGENTS.md`
