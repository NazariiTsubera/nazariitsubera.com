# Booth to MRR Plan 5: Operational Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the console usable for a real market day: every regenerate flow the design names, an events timeline, the gate's screenshots, hand edits to content and theme, and a public storefront page with the portfolio. The purchase flow stays backlogged.

**Architecture:** No new modules. The remaining job types are wired through the existing pipeline, the console gains the actions and panels the design's section 12 lists, and the marketing route group gains `/storefront`.

**Spec:** design sections 8 (other job types), 12 (console), 13 (personal site). Section 11 (purchase) is deliberately out.

## Global Constraints

- Job types `regenerate_content`, `regenerate_design`, `edit_design`, and `reprocess_assets` reuse
  `runGenerateSite` with a start step, rather than a second orchestration.
- Hand edits to the content JSON are validated with `contentJsonSchema` before anything is stored,
  and republish runs the gate exactly as a generation does.
- Nothing on the public storefront page names a vendor who has not opted in.
- Branch `booth-to-mrr/05-polish`. Commit at every task boundary. Do not push.
- Commit messages end with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

---

### Task 1: The remaining job types

**Files:** `packages/core/src/pipeline/generate-site.ts`, `apps/worker/src/processors/pipeline.ts`, `apps/web/app/api/console/actions/route.ts`, integration test.

**Interfaces:** `runGenerateSite(jobId, vendorId, type)` where the type decides which steps run:
- `generate_site` everything;
- `reprocess_assets` forces the image step even when derived artifacts exist;
- `regenerate_content` reuses images, redoes content and design;
- `regenerate_design` reuses content, redoes only the design;
- `edit_design` applies an instruction to the published HTML, then gate and publish;
- `republish` re-finalizes and republishes the current version with current flags.

- [ ] Integration test per type. Implement. Commit `feat: wire the remaining regenerate job types`.

### Task 2: Vendor workspace panels

**Files:** `apps/web/app/console/[id]/page.tsx`, new console components, `apps/web/app/api/console/vendors/[id]/route.ts`.

- Events timeline, newest first, with human labels.
- Gate panel: pass or fallback, the violations, and the three screenshots.
- Content JSON editor, validated on save, republishing on success.
- Theme override and design notes.
- Portfolio toggle.

- [ ] Commit `feat(web): add the vendor workspace panels`.

### Task 3: Storefront and portfolio

**Files:** `apps/web/app/(marketing)/storefront/page.tsx`, portfolio component, nav link.

The offer, the price, what is included, and a grid of won vendors with `showInPortfolio`.

- [ ] Commit `feat(web): add the storefront page and portfolio grid`.

### Task 4: Docs and final verification

- [ ] AGENTS.md, README, design build-order update, full verification, merge.


## Findings during execution

Running the console against the real pipeline surfaced two defects that no unit test would have
caught, because both are about processes rather than functions:

- `STORAGE_DIR` was a relative path resolved against each process's working directory, so the web
  app wrote uploads under `apps/web/.storage` and the worker looked for them under
  `apps/worker/.storage`. Now resolved against the workspace root.
- `tsx` applies one esbuild transform configuration to everything it loads, resolved from the
  tsconfig it finds at the current directory. From `apps/worker` that did not cover
  `packages/core`, so the template's JSX was compiled with the classic runtime and every render
  threw "React is not defined". Fixed in both directions: the worker's tsconfig sets `jsx`
  explicitly, and the template files carry a JSX runtime pragma so they no longer depend on the
  consumer's configuration.

A stale worker process from an earlier run also kept consuming jobs with an older processor,
which is worth remembering when a change appears not to take effect.
