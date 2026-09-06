# ADR-0002: pnpm workspace with a single core package consumed as source

- Status: Accepted
- Date: 2026-09-05

## Context
The repository gains two runtime applications with different dependency profiles: a Next.js app
and a Node worker with native image libraries and headless Chromium. Both render the same vendor-site
template and share every domain module. A flat single project with a second worker entrypoint works
when the worker is light and there is one runtime; here the worker is the heavy process.

## Decision
Use a pnpm workspace with `apps/web`, `apps/worker`, and one package, `packages/core`
(`@nazariitsubera/core`). Core ships TypeScript source with an explicit `exports` map, one entry per
module. Next consumes it through `transpilePackages`; the worker and tests consume it through `tsx`
and `vitest`. There is no build step and no `dist/`. ESLint `no-restricted-imports` forbids core from
importing `next`, `next/*`, or `@/*`, and confines `react-dom/server` to the template module.
Browser code imports only `@nazariitsubera/core/contracts`.

## Consequences
- The dependency direction `apps -> core` is enforced by tooling, not convention.
- One package means one tsconfig, one vitest project, and no inter-package build graph.
- Splitting a module into its own package later (the only candidate is `template`) is moving a
  folder and adding a `package.json`.

## Alternatives Considered
- Flat single Next project: no enforced boundary between worker and web code.
- Many packages (`core`, `template`, `db`, ...): a build graph and version churn for no current
  benefit.
- A separate NestJS API service: a second framework, deploy, and auth handoff for a single client.
