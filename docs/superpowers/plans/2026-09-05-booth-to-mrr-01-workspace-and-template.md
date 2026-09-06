# Booth to MRR Plan 1: Workspace and Template Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert this repository into the pnpm workspace described in the design, and ship the template floor: a pure `renderSite()` function that turns a content JSON plus a theme into a single static HTML page with inlined CSS, no JavaScript, six curated themes that pass WCAG AA, and a command that renders a fixture to disk for a Lighthouse check. In production the model authors each vendor's page (design section 7.1); this template is the fallback when the gate fails, the renderer for hand-built sites before the pipeline exists, and the quality bar shown to the author.

**Architecture:** `apps/web` is the existing Next.js site moved one directory down. `packages/core` (`@nazariitsubera/core`) is one TypeScript-source package with modules; this plan creates three of them: `contracts` (Zod schemas shared with the browser), `themes` (token sets, fonts, contrast), and `template` (React components rendered with `renderToStaticMarkup`). Next consumes core through `transpilePackages`; the render CLI and tests consume it directly through `tsx` and `vitest`. No build step for core.

**Tech Stack:** Node 22, pnpm 10.6.1, Next.js 16.2, React 19.1, TypeScript 5.7, Zod 4, Vitest 4, tsx, `@fontsource-variable/*` 5.3 for self-hosted fonts, ESLint 9 flat config.

**Spec:** `docs/superpowers/specs/2026-09-05-booth-to-mrr-engine-design.md`. This plan implements build-order steps 1 and 2 (section 17). Sections 4.3, 6, 7, and 14 are the requirements this plan satisfies.

**Plan sequence** (each is its own plan document):

1. This plan: workspace conversion, contracts, themes, template, render CLI, docs.
2. Serving and publish: R2 storage adapter, Prisma, `SiteVersion`, publish pointer swap, `serveSite`, middleware hostname routing, preview, expired, and not-found pages.
3. Console and data: Better Auth, vendors, markets, captures, assets, presigned uploads, BullMQ jobs infrastructure, admin list, console pages.
4. Pipeline: transcription, images and cutouts, Anthropic content generation with the content guard, the model-authored design step, the gate (HTML lint, visible-text guard, headless Chromium with axe), bounded repair, template fallback, `finalizePage` injection of banner and noindex, worker processors, fake adapters first, real providers second.
5. Polish: regenerate and edit-design flows, extend, events timeline, preview-opened tracking, mark won by hand. The purchase flow (storefront page, claim page, Stripe) is backlogged, not scheduled.

## Global Constraints

- Node `>=22`, `pnpm@10.6.1` pinned in the root `package.json` `packageManager` field.
- Next.js `^16.2.10`, React and React DOM `^19.1.0` in both `apps/web` and `packages/core`; the two must stay on the same range.
- Zod `^4.0.0`. Use `z.url()` for URLs and `z.record(keySchema, valueSchema)` with two arguments.
- `@nazariitsubera/core` ships TypeScript source. Its `exports` map lists one entry per module and nothing deeper. No `dist/`, no build step.
- Dependency direction is `apps -> core` only. Core never imports `next`, `next/*`, or `@/*`. Only `packages/core/src/template/**` may import `react-dom/server`. Enforced by ESLint `no-restricted-imports`.
- Vendor pages contain zero JavaScript: the rendered HTML must contain no `<script` element.
- Rendered HTML with inlined CSS for the demo fixture must be under 40,000 bytes.
- Every theme passes WCAG AA in light and dark: 4.5:1 for `ink` and `muted` on `bg`, `surface`, and `ground`, 4.5:1 for `onAccent` on `accent`, 3:1 for `accent` on `bg` and `surface`.
- Content limits from the spec: tagline 60, heroHeadline 48, heroSub 110, product name 32, blurb 90, ctaLabel 20, phone E.164.
- In the template, section order is fixed: hero, products, about, visit, contact. `about` is omitted when null, `visit` when there are no markets.
- The template renders neither the preview banner nor a robots meta tag. Both are injected at publish by `finalizePage` (design 7.5, Plan 2), so they apply equally to model-authored pages.
- All work happens on branch `booth-to-mrr/01-workspace-template`. Do not push or merge; the user does that after the Railway settings in Task 1 are updated.
- Every commit message ends with the line `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

---

### Task 1: Convert the repository to a pnpm workspace

**Files:**
- Create: `pnpm-workspace.yaml`, `tsconfig.base.json`, `apps/web/package.json`
- Move (git mv): `app/`, `components/`, `lib/`, `tailwind.config.ts`, `postcss.config.mjs`, `next.config.ts`, `tsconfig.json`, `next-env.d.ts`, `.env.example` into `apps/web/`
- Modify: `package.json` (becomes the workspace root), `eslint.config.mjs` (root, scoped to `apps/web`), `.gitignore`, `.claude/launch.json`, `README.md`
- Delete: `vercel.json`, `package-lock.json`, `tsconfig.tsbuildinfo` (from the index if tracked)

**Interfaces:**
- Produces: workspace names `web` (apps/web) and, from Task 2, `@nazariitsubera/core` (packages/core). Root scripts `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm test`.

- [ ] **Step 1: Create the branch**

Run:
```bash
git switch -c booth-to-mrr/01-workspace-template
```
Expected: `Switched to a new branch 'booth-to-mrr/01-workspace-template'`

Commit the design and this plan first, so they are not swept into the code commits:
```bash
git add docs/superpowers/specs/2026-09-05-booth-to-mrr-engine-design.md docs/superpowers/plans/2026-09-05-booth-to-mrr-01-workspace-and-template.md
git commit -m "docs: add Booth to MRR engine design and plan 1

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```
Expected: one commit with two files. `git status --short` then shows only `?? .idea/`.

- [ ] **Step 2: Move the Next.js app into `apps/web`**

Run:
```bash
mkdir -p apps/web
git mv app components lib tailwind.config.ts postcss.config.mjs next.config.ts tsconfig.json .env.example apps/web/
git mv next-env.d.ts apps/web/ 2>/dev/null || mv next-env.d.ts apps/web/
git rm -q vercel.json package-lock.json
git rm -q --cached --ignore-unmatch tsconfig.tsbuildinfo
[ -f .env ] && mv .env apps/web/.env
rm -rf .next node_modules tsconfig.tsbuildinfo
git status --short | head -20
```
Expected: renames listed as `R  app/... -> apps/web/app/...`, deletions `D  vercel.json`, `D  package-lock.json`. The `.env` move is silent because the file is gitignored.

- [ ] **Step 3: Write the workspace root `package.json`**

Replace the whole file:
```json
{
  "name": "nazariitsubera",
  "version": "0.1.0",
  "private": true,
  "packageManager": "pnpm@10.6.1",
  "engines": {
    "node": ">=22"
  },
  "scripts": {
    "dev": "pnpm --filter web dev",
    "build": "pnpm --filter web build",
    "start": "pnpm --filter web start",
    "lint": "eslint .",
    "typecheck": "pnpm -r typecheck",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "eslint": "^9.30.0",
    "eslint-config-next": "^16.2.10",
    "typescript": "^5.7.0",
    "vitest": "^4.1.8"
  }
}
```

- [ ] **Step 4: Write `pnpm-workspace.yaml`**

```yaml
packages:
  - apps/*
  - packages/*
```

- [ ] **Step 5: Write `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "noEmit": true
  }
}
```

- [ ] **Step 6: Write `apps/web/package.json`**

```json
{
  "name": "web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^16.2.10",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@types/node": "^22.13.0",
    "@types/react": "^19.1.0",
    "@types/react-dom": "^19.1.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.5.0",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 7: Make `apps/web/tsconfig.json` extend the base**

Replace the whole file:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2017",
    "allowJs": false,
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    },
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 8: Write the root `eslint.config.mjs`, scoped to the web app**

Replace the whole file:
```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  globalIgnores([
    "**/.next/**",
    "**/out/**",
    "**/node_modules/**",
    "**/next-env.d.ts",
  ]),
  {
    files: ["apps/web/**/*.{js,jsx,mjs,ts,tsx}"],
    extends: [nextVitals, nextTs],
    settings: {
      next: { rootDir: "apps/web" },
    },
  },
]);
```

- [ ] **Step 9: Update `.gitignore`, `.claude/launch.json`, and `README.md`**

`.gitignore`, replace the whole file:
```
.DS_Store
node_modules/
dist/
.env
.next/
out/
*.tsbuildinfo
.idea/
```

`.claude/launch.json`, replace the whole file:
```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "web-dev",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["dev"],
      "port": 3000
    }
  ]
}
```

`README.md`, replace the whole file:
```markdown
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
```

- [ ] **Step 10: Install and verify the web app still builds**

Run:
```bash
pnpm install
```
Expected: ends with `Done in Ns`. A line like `Ignored build scripts: unrs-resolver` is fine. A new `pnpm-lock.yaml` exists at the root.

Run:
```bash
pnpm build
```
Expected: `✓ Compiled successfully` and a route table listing `/`, `/api/leads`, `/icon.svg`. No errors about multiple lockfiles.

Run:
```bash
pnpm lint && pnpm --filter web typecheck
```
Expected: both exit 0 with no output besides pnpm's filter banner.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "chore: convert repo to pnpm workspace with apps/web

Moves the Next.js site into apps/web unchanged, adds the workspace root,
shared tsconfig base, and a root ESLint config scoped to the web app.
Removes vercel.json and the npm lockfile; deployment is Railway.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

- [ ] **Step 12: Manual step for the user, before this branch is merged**

The Railway `web` service currently builds with npm defaults. In the Railway dashboard, service `web`, Settings:

- Build command: `pnpm install --frozen-lockfile && pnpm --filter web build`
- Start command: `pnpm --filter web start`
- Watch paths: `apps/web/**`, `packages/**`, `pnpm-lock.yaml`, `package.json`, `pnpm-workspace.yaml`
- Root directory: leave at `/`.

Next reads `PORT` from the environment, so no port flag is needed. After the merge deploys, verify:
```bash
curl -sI https://nazariitsubera.com/ | grep -iE '^(HTTP|x-railway-request-id)'
```
Expected: `HTTP/2 200` and an `x-railway-request-id` header.

---

### Task 2: Create `@nazariitsubera/core` with the `contracts` module and prove the wiring

**Files:**
- Create: `packages/core/package.json`, `packages/core/tsconfig.json`, `packages/core/vitest.config.ts`, `vitest.config.ts` (root)
- Create: `packages/core/src/contracts/index.ts`, `packages/core/src/contracts/theme-id.ts`, `packages/core/src/contracts/content.ts`, `packages/core/src/contracts/render.ts`
- Test: `packages/core/src/contracts/content.test.ts`, `packages/core/src/contracts/render.test.ts`
- Modify: `apps/web/package.json` (add `@nazariitsubera/core`), `apps/web/next.config.ts` (transpilePackages), `eslint.config.mjs` (boundary rules)
- Create: `apps/web/app/api/health/route.ts`

**Interfaces:**
- Produces, from `@nazariitsubera/core/contracts`:
  - `CONTENT_SCHEMA_VERSION: 1`
  - `THEME_IDS: readonly ["market","studio","garden","night","candy","workshop"]`, `themeIdSchema`, `type ThemeId`
  - `TONES`, `toneSchema`, `type Tone = "warm"|"playful"|"crafted"|"technical"|"minimal"`
  - `productSchema`, `type Product`, `marketRefSchema`, `type MarketRef`, `contentJsonSchema`, `type ContentJson`, `E164_PHONE`
  - `assetKindSchema`, `type AssetKind`, `renderAssetSchema`, `type RenderAsset`, `renderFlagsSchema`, `type RenderFlags` (consumed by `finalizePage` in Plan 2, not by the template), `renderContextSchema`, `type RenderContext`, `renderInputSchema`, `type RenderInput` (content, themeId, assets, context)

- [ ] **Step 1: Write the package manifest and configs**

`packages/core/package.json`:
```json
{
  "name": "@nazariitsubera/core",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    "./contracts": "./src/contracts/index.ts",
    "./themes": "./src/themes/index.ts",
    "./template": "./src/template/index.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit -p tsconfig.json",
    "test": "vitest run",
    "render:fixture": "tsx scripts/render-fixture.ts"
  },
  "dependencies": {
    "@fontsource-variable/bricolage-grotesque": "^5.3.0",
    "@fontsource-variable/fraunces": "^5.3.0",
    "@fontsource-variable/inter": "^5.3.0",
    "@fontsource-variable/lora": "^5.3.0",
    "@fontsource-variable/nunito": "^5.3.0",
    "@fontsource-variable/nunito-sans": "^5.3.0",
    "@fontsource-variable/playfair-display": "^5.3.0",
    "@fontsource-variable/source-sans-3": "^5.3.0",
    "@fontsource-variable/space-grotesk": "^5.3.0",
    "@fontsource-variable/work-sans": "^5.3.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "zod": "^4.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.13.0",
    "@types/react": "^19.1.0",
    "@types/react-dom": "^19.1.0",
    "tsx": "^4.22.0",
    "typescript": "^5.7.0",
    "vitest": "^4.1.8"
  }
}
```

`packages/core/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "types": ["node"]
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "scripts/**/*.ts", "fixtures/**/*.json"]
}
```

`packages/core/vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "core",
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});
```

Root `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: ["packages/*"],
  },
});
```

- [ ] **Step 2: Write the failing contract tests**

`packages/core/src/contracts/content.test.ts`:
```ts
import { describe, expect, it } from "vitest";

import { contentJsonSchema, type ContentJson } from "./content";

function validContent(): ContentJson {
  return {
    schemaVersion: 1,
    businessName: "Pearl Street Pottery",
    tagline: "Small-batch stoneware from San Antonio",
    heroHeadline: "Mugs made for slow mornings",
    heroSub: "Wheel-thrown stoneware, glazed by hand. Find us at the Pearl every Saturday.",
    about: null,
    tone: "warm",
    heroAssetId: "scene-1",
    personAssetId: null,
    products: [
      { assetId: "p1", name: "Speckled mug", blurb: null, priceHint: null, checkoutUrl: null, source: null },
      { assetId: "p2", name: "Serving bowl", blurb: "Wide and shallow.", priceHint: "$48", checkoutUrl: "https://square.link/u/abc", source: null },
    ],
    visit: { markets: [], note: null },
    contact: { phone: "+12105550123", instagramHandle: null, ctaLabel: "Call or text" },
  };
}

describe("contentJsonSchema", () => {
  it("accepts a valid document", () => {
    expect(contentJsonSchema.parse(validContent())).toEqual(validContent());
  });

  it("rejects a tagline over 60 characters", () => {
    const c = { ...validContent(), tagline: "x".repeat(61) };
    expect(contentJsonSchema.safeParse(c).success).toBe(false);
  });

  it("rejects duplicate product asset ids", () => {
    const c = validContent();
    c.products[1] = { ...c.products[1], assetId: "p1" };
    const result = contentJsonSchema.safeParse(c);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("product assetIds must be unique");
    }
  });

  it("rejects a phone that is not E.164", () => {
    const c = validContent();
    c.contact = { ...c.contact, phone: "210-555-0123" };
    expect(contentJsonSchema.safeParse(c).success).toBe(false);
  });

  it("rejects an unknown tone", () => {
    const c = { ...validContent(), tone: "sassy" };
    expect(contentJsonSchema.safeParse(c).success).toBe(false);
  });

  it("rejects a non-URL checkout link", () => {
    const c = validContent();
    c.products[0] = { ...c.products[0], checkoutUrl: "square.link/abc" };
    expect(contentJsonSchema.safeParse(c).success).toBe(false);
  });
});
```

`packages/core/src/contracts/render.test.ts`:
```ts
import { describe, expect, it } from "vitest";

import { renderAssetSchema, renderFlagsSchema, renderInputSchema } from "./render";

describe("render contracts", () => {
  it("accepts a render asset with three variants", () => {
    const asset = {
      id: "p1",
      kind: "product",
      alt: "Speckled mug",
      variants: { w480: "images/p1-w480.webp", w960: "images/p1-w960.webp", w1440: "images/p1-w1440.webp" },
      width: 1440,
      height: 1440,
    };
    expect(renderAssetSchema.parse(asset)).toEqual(asset);
  });

  it("rejects an asset missing a variant", () => {
    const asset = {
      id: "p1",
      kind: "product",
      alt: "",
      variants: { w480: "a", w960: "b" },
      width: 1,
      height: 1,
    };
    expect(renderAssetSchema.safeParse(asset).success).toBe(false);
  });

  it("requires previewDaysLeft to be null or a non-negative integer", () => {
    expect(renderFlagsSchema.safeParse({ preview: true, noindex: true, previewDaysLeft: 6 }).success).toBe(true);
    expect(renderFlagsSchema.safeParse({ preview: false, noindex: false, previewDaysLeft: null }).success).toBe(true);
    expect(renderFlagsSchema.safeParse({ preview: true, noindex: true, previewDaysLeft: -1 }).success).toBe(false);
  });

  it("rejects an unknown theme id on the render input", () => {
    const result = renderInputSchema.safeParse({
      content: {},
      themeId: "neon",
      assets: {},
      context: { siteUrl: "x", claimUrl: "x", assetsBaseUrl: ".", operatorName: "N", operatorUrl: "x" },
    });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 3: Install and run the tests to verify they fail**

Run:
```bash
pnpm install && pnpm --filter @nazariitsubera/core test
```
Expected: `pnpm install` succeeds and links `@nazariitsubera/core`. Vitest reports `FAIL` for both files with `Failed to resolve import "./content"` (or `"./render"`).

- [ ] **Step 4: Write the contracts**

`packages/core/src/contracts/theme-id.ts`:
```ts
import { z } from "zod";

export const THEME_IDS = ["market", "studio", "garden", "night", "candy", "workshop"] as const;
export const themeIdSchema = z.enum(THEME_IDS);
export type ThemeId = z.infer<typeof themeIdSchema>;
```

`packages/core/src/contracts/content.ts`:
```ts
import { z } from "zod";

export const CONTENT_SCHEMA_VERSION = 1 as const;

export const TONES = ["warm", "playful", "crafted", "technical", "minimal"] as const;
export const toneSchema = z.enum(TONES);
export type Tone = z.infer<typeof toneSchema>;

/** E.164: a plus sign, a non-zero country code digit, then 6 to 14 more digits. */
export const E164_PHONE = /^\+[1-9]\d{6,14}$/;

export const productSchema = z.object({
  assetId: z.string().min(1),
  name: z.string().min(1).max(32),
  blurb: z.string().min(1).max(90).nullable(),
  priceHint: z.string().min(1).max(24).nullable(),
  checkoutUrl: z.url().nullable(),
  source: z.object({ provider: z.string().min(1), itemId: z.string().min(1) }).nullable(),
});
export type Product = z.infer<typeof productSchema>;

export const marketRefSchema = z.object({
  name: z.string().min(1).max(80),
  mapsUrl: z.url().nullable(),
  scheduleNote: z.string().min(1).max(120).nullable(),
});
export type MarketRef = z.infer<typeof marketRefSchema>;

export const contentJsonSchema = z
  .object({
    schemaVersion: z.literal(CONTENT_SCHEMA_VERSION),
    businessName: z.string().min(1).max(80),
    tagline: z.string().min(1).max(60),
    heroHeadline: z.string().min(1).max(48),
    heroSub: z.string().min(1).max(110),
    about: z.string().min(1).max(600).nullable(),
    tone: toneSchema,
    heroAssetId: z.string().min(1).nullable(),
    personAssetId: z.string().min(1).nullable(),
    products: z.array(productSchema).max(20),
    visit: z.object({
      markets: z.array(marketRefSchema).max(6),
      note: z.string().min(1).max(120).nullable(),
    }),
    contact: z.object({
      phone: z.string().regex(E164_PHONE, "phone must be E.164, for example +12105550123"),
      instagramHandle: z.string().min(1).max(30).nullable(),
      ctaLabel: z.string().min(1).max(20),
    }),
  })
  .refine((c) => new Set(c.products.map((p) => p.assetId)).size === c.products.length, {
    message: "product assetIds must be unique",
    path: ["products"],
  });
export type ContentJson = z.infer<typeof contentJsonSchema>;
```

`packages/core/src/contracts/render.ts`:
```ts
import { z } from "zod";

import { contentJsonSchema } from "./content";
import { themeIdSchema } from "./theme-id";

export const assetKindSchema = z.enum(["product", "scene", "person"]);
export type AssetKind = z.infer<typeof assetKindSchema>;

/** One image as the template needs it: three widths plus the intrinsic size of the largest. */
export const renderAssetSchema = z.object({
  id: z.string().min(1),
  kind: assetKindSchema,
  alt: z.string().max(160),
  variants: z.object({
    w480: z.string().min(1),
    w960: z.string().min(1),
    w1440: z.string().min(1),
  }),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});
export type RenderAsset = z.infer<typeof renderAssetSchema>;

export const renderFlagsSchema = z.object({
  preview: z.boolean(),
  noindex: z.boolean(),
  previewDaysLeft: z.number().int().nonnegative().nullable(),
});
export type RenderFlags = z.infer<typeof renderFlagsSchema>;

/** Everything about the surrounding world the page needs: where it lives, where to claim it, where assets are. */
export const renderContextSchema = z.object({
  siteUrl: z.string().min(1),
  claimUrl: z.string().min(1),
  assetsBaseUrl: z.string().min(1),
  operatorName: z.string().min(1),
  operatorUrl: z.string().min(1),
});
export type RenderContext = z.infer<typeof renderContextSchema>;

/** Input to the template. Flags (preview, noindex) are not here: finalizePage applies them at publish. */
export const renderInputSchema = z.object({
  content: contentJsonSchema,
  themeId: themeIdSchema,
  assets: z.record(z.string(), renderAssetSchema),
  context: renderContextSchema,
});
export type RenderInput = z.infer<typeof renderInputSchema>;
```

`packages/core/src/contracts/index.ts`:
```ts
export {
  CONTENT_SCHEMA_VERSION,
  E164_PHONE,
  TONES,
  contentJsonSchema,
  marketRefSchema,
  productSchema,
  toneSchema,
} from "./content";
export type { ContentJson, MarketRef, Product, Tone } from "./content";
export {
  assetKindSchema,
  renderAssetSchema,
  renderContextSchema,
  renderFlagsSchema,
  renderInputSchema,
} from "./render";
export type { AssetKind, RenderAsset, RenderContext, RenderFlags, RenderInput } from "./render";
export { THEME_IDS, themeIdSchema } from "./theme-id";
export type { ThemeId } from "./theme-id";
```

- [ ] **Step 5: Run the tests to verify they pass**

Run:
```bash
pnpm --filter @nazariitsubera/core test
```
Expected: `Test Files  2 passed`, `Tests  10 passed`.

- [ ] **Step 6: Wire core into the web app and prove it compiles through Next**

`apps/web/package.json`, add to `dependencies`:
```json
    "@nazariitsubera/core": "workspace:*",
```

`apps/web/next.config.ts`, replace the whole file:
```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@nazariitsubera/core"],
};

export default nextConfig;
```

`apps/web/app/api/health/route.ts`:
```ts
import { NextResponse } from "next/server";

import { CONTENT_SCHEMA_VERSION } from "@nazariitsubera/core/contracts";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ ok: true, contentSchemaVersion: CONTENT_SCHEMA_VERSION });
}
```

Run:
```bash
pnpm install && pnpm build
```
Expected: `✓ Compiled successfully` with `/api/health` in the route table.

Run:
```bash
(pnpm --filter web start > /tmp/web.log 2>&1 & echo $! > /tmp/web.pid); sleep 5; curl -s http://localhost:3000/api/health; echo; kill $(cat /tmp/web.pid)
```
Expected: `{"ok":true,"contentSchemaVersion":1}`

- [ ] **Step 7: Add the dependency-direction rules to ESLint**

`eslint.config.mjs`, replace the whole file:
```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const forbidNextInCore = {
  group: ["next", "next/*", "@/*"],
  message: "packages/core must not depend on the Next app (design 4.3).",
};

export default defineConfig([
  globalIgnores([
    "**/.next/**",
    "**/out/**",
    "**/node_modules/**",
    "**/next-env.d.ts",
  ]),
  {
    files: ["apps/web/**/*.{js,jsx,mjs,ts,tsx}"],
    extends: [nextVitals, nextTs],
    settings: {
      next: { rootDir: "apps/web" },
    },
  },
  {
    files: ["packages/core/**/*.{ts,tsx}"],
    extends: [nextTs],
  },
  {
    files: ["packages/core/src/**/*.{ts,tsx}"],
    ignores: ["packages/core/src/template/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react-dom/server",
              message: "Only packages/core/src/template may render React (design 4.3).",
            },
          ],
          patterns: [forbidNextInCore],
        },
      ],
    },
  },
  {
    files: ["packages/core/src/template/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [forbidNextInCore] }],
    },
  },
]);
```

Verify the rule fires, then clean up:
```bash
printf 'import { NextResponse } from "next/server";\nexport const x = NextResponse;\n' > packages/core/src/contracts/_boundary-probe.ts
pnpm lint; echo "exit=$?"
rm packages/core/src/contracts/_boundary-probe.ts
pnpm lint; echo "exit=$?"
```
Expected: first run reports `no-restricted-imports` error on `_boundary-probe.ts` and `exit=1`; second run is clean with `exit=0`.

- [ ] **Step 8: Typecheck everything and commit**

Run:
```bash
pnpm typecheck
```
Expected: both `web` and `@nazariitsubera/core` typecheck with no errors.

```bash
git add -A
git commit -m "feat(core): add @nazariitsubera/core with contracts module and web wiring

Creates the core package as TypeScript source with an explicit exports map,
the content JSON and render input schemas, a root vitest projects config,
a health route in web that imports core through transpilePackages, and
ESLint rules that forbid core from importing the Next app.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: The `themes` module

**Files:**
- Create: `packages/core/src/themes/types.ts`, `packages/core/src/themes/contrast.ts`, `packages/core/src/themes/fonts.ts`, `packages/core/src/themes/themes.ts`, `packages/core/src/themes/index.ts`
- Test: `packages/core/src/themes/contrast.test.ts`, `packages/core/src/themes/themes.test.ts`

**Interfaces:**
- Consumes: `THEME_IDS`, `ThemeId`, `TONES`, `Tone` from `../contracts/theme-id` and `../contracts/content`.
- Produces, from `@nazariitsubera/core/themes`:
  - `type ColorTokens = { bg; surface; ink; muted; accent; onAccent; ground; border }` (all `#rrggbb` strings)
  - `type FontSpec = { family: string; package: string; file: string; fallback: string }`
  - `type Theme = { id: ThemeId; label: string; colors: { light: ColorTokens; dark: ColorTokens }; fonts: { heading: FontSpec; body: FontSpec }; radius: { sm: string; md: string; lg: string }; density: "compact"|"regular"|"airy"; headingWeight: number; headingLetterSpacing: string }`
  - `themes: Record<ThemeId, Theme>`, `getTheme(id: ThemeId): Theme`, `themeForTone(tone: Tone): Theme`, `TONE_THEME: Record<Tone, ThemeId>`
  - `contrastRatio(a: string, b: string): number`, `relativeLuminance(hex: string): number`
  - `fontFilePath(font: FontSpec): string`, `fontFileExists(font: FontSpec): boolean`

- [ ] **Step 1: Write the failing contrast test**

`packages/core/src/themes/contrast.test.ts`:
```ts
import { describe, expect, it } from "vitest";

import { contrastRatio, relativeLuminance } from "./contrast";

describe("contrast", () => {
  it("computes luminance of white and black", () => {
    expect(relativeLuminance("#FFFFFF")).toBeCloseTo(1, 5);
    expect(relativeLuminance("#000000")).toBeCloseTo(0, 5);
  });

  it("gives 21:1 for black on white and 1:1 for identical colors", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 2);
    expect(contrastRatio("#777777", "#777777")).toBeCloseTo(1, 5);
  });

  it("is symmetric", () => {
    expect(contrastRatio("#B8462B", "#FBF6EE")).toBeCloseTo(contrastRatio("#FBF6EE", "#B8462B"), 6);
  });

  it("rejects malformed hex", () => {
    expect(() => relativeLuminance("red")).toThrow(/Expected #rrggbb/);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @nazariitsubera/core test -- contrast`
Expected: `FAIL` with `Failed to resolve import "./contrast"`.

- [ ] **Step 3: Write the contrast utilities**

`packages/core/src/themes/contrast.ts`:
```ts
/** WCAG 2.x relative luminance and contrast ratio for #rrggbb colors. */

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) {
    throw new Error(`Expected #rrggbb, got ${hex}`);
  }
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((channel) => {
    const s = channel / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm --filter @nazariitsubera/core test -- contrast`
Expected: `4 passed`.

- [ ] **Step 5: Write the failing theme tests**

`packages/core/src/themes/themes.test.ts`:
```ts
import { describe, expect, it } from "vitest";

import { THEME_IDS } from "../contracts/theme-id";
import { TONES } from "../contracts/content";
import { contrastRatio } from "./contrast";
import { fontFileExists } from "./fonts";
import { TONE_THEME, getTheme, themeForTone, themes } from "./index";
import type { ColorTokens } from "./types";

const TEXT_PAIRS: Array<[keyof ColorTokens, keyof ColorTokens, number]> = [
  ["ink", "bg", 4.5],
  ["ink", "surface", 4.5],
  ["ink", "ground", 4.5],
  ["muted", "bg", 4.5],
  ["muted", "surface", 4.5],
  ["onAccent", "accent", 4.5],
  ["accent", "bg", 3],
  ["accent", "surface", 3],
];

describe("themes", () => {
  it("defines every theme id exactly once", () => {
    expect(Object.keys(themes).sort()).toEqual([...THEME_IDS].sort());
    for (const id of THEME_IDS) expect(getTheme(id).id).toBe(id);
  });

  it.each(THEME_IDS)("%s passes WCAG AA in light and dark", (id) => {
    const theme = getTheme(id);
    for (const mode of ["light", "dark"] as const) {
      const c = theme.colors[mode];
      for (const [fg, bg, min] of TEXT_PAIRS) {
        const ratio = contrastRatio(c[fg], c[bg]);
        expect(ratio, `${id}/${mode}: ${fg} on ${bg} = ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(min);
      }
    }
  });

  it("maps every tone to an existing theme", () => {
    for (const tone of TONES) {
      expect(THEME_IDS).toContain(TONE_THEME[tone]);
      expect(themeForTone(tone).id).toBe(TONE_THEME[tone]);
    }
  });

  it.each(THEME_IDS)("%s font files are installed", (id) => {
    const { heading, body } = getTheme(id).fonts;
    expect(fontFileExists(heading), `${heading.package}/files/${heading.file}`).toBe(true);
    expect(fontFileExists(body), `${body.package}/files/${body.file}`).toBe(true);
  });
});
```

- [ ] **Step 6: Run it to verify it fails**

Run: `pnpm --filter @nazariitsubera/core test -- themes`
Expected: `FAIL` with `Failed to resolve import "./fonts"` (or `./index`).

- [ ] **Step 7: Write the theme types, fonts helper, definitions, and index**

`packages/core/src/themes/types.ts`:
```ts
import type { ThemeId } from "../contracts/theme-id";

export type ColorTokens = {
  bg: string;
  surface: string;
  ink: string;
  muted: string;
  accent: string;
  onAccent: string;
  ground: string;
  border: string;
};

export type FontSpec = {
  /** CSS font-family name used in @font-face and font stacks. */
  family: string;
  /** npm package that ships the woff2, for example "@fontsource-variable/inter". */
  package: string;
  /** File name inside the package's files/ directory. */
  file: string;
  /** Fallback stack appended after the family. */
  fallback: string;
};

export type Density = "compact" | "regular" | "airy";

export type Theme = {
  id: ThemeId;
  label: string;
  colors: { light: ColorTokens; dark: ColorTokens };
  fonts: { heading: FontSpec; body: FontSpec };
  radius: { sm: string; md: string; lg: string };
  density: Density;
  headingWeight: number;
  headingLetterSpacing: string;
};
```

`packages/core/src/themes/fonts.ts`:
```ts
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { FontSpec } from "./types";

/** packages/core/, resolved from this file so it works under tsx, vitest, and Next. */
const coreRoot = fileURLToPath(new URL("../../", import.meta.url));

/** Absolute path of a theme font's woff2 inside core's own node_modules. Direct deps are always linked there by pnpm. */
export function fontFilePath(font: FontSpec): string {
  return path.join(coreRoot, "node_modules", font.package, "files", font.file);
}

export function fontFileExists(font: FontSpec): boolean {
  return existsSync(fontFilePath(font));
}
```

`packages/core/src/themes/themes.ts`:
```ts
import type { ThemeId } from "../contracts/theme-id";
import type { FontSpec, Theme } from "./types";

const SANS_FALLBACK = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const SERIF_FALLBACK = "Georgia, 'Times New Roman', serif";

const FONTS = {
  fraunces: { family: "Fraunces Variable", package: "@fontsource-variable/fraunces", file: "fraunces-latin-wght-normal.woff2", fallback: SERIF_FALLBACK },
  sourceSans: { family: "Source Sans 3 Variable", package: "@fontsource-variable/source-sans-3", file: "source-sans-3-latin-wght-normal.woff2", fallback: SANS_FALLBACK },
  inter: { family: "Inter Variable", package: "@fontsource-variable/inter", file: "inter-latin-wght-normal.woff2", fallback: SANS_FALLBACK },
  lora: { family: "Lora Variable", package: "@fontsource-variable/lora", file: "lora-latin-wght-normal.woff2", fallback: SERIF_FALLBACK },
  nunitoSans: { family: "Nunito Sans Variable", package: "@fontsource-variable/nunito-sans", file: "nunito-sans-latin-wght-normal.woff2", fallback: SANS_FALLBACK },
  spaceGrotesk: { family: "Space Grotesk Variable", package: "@fontsource-variable/space-grotesk", file: "space-grotesk-latin-wght-normal.woff2", fallback: SANS_FALLBACK },
  bricolage: { family: "Bricolage Grotesque Variable", package: "@fontsource-variable/bricolage-grotesque", file: "bricolage-grotesque-latin-wght-normal.woff2", fallback: SANS_FALLBACK },
  nunito: { family: "Nunito Variable", package: "@fontsource-variable/nunito", file: "nunito-latin-wght-normal.woff2", fallback: SANS_FALLBACK },
  playfair: { family: "Playfair Display Variable", package: "@fontsource-variable/playfair-display", file: "playfair-display-latin-wght-normal.woff2", fallback: SERIF_FALLBACK },
  workSans: { family: "Work Sans Variable", package: "@fontsource-variable/work-sans", file: "work-sans-latin-wght-normal.woff2", fallback: SANS_FALLBACK },
} satisfies Record<string, FontSpec>;

export const themes: Record<ThemeId, Theme> = {
  market: {
    id: "market",
    label: "Market",
    colors: {
      light: { bg: "#FBF6EE", surface: "#FFFFFF", ink: "#2B2118", muted: "#6B5D50", accent: "#B8462B", onAccent: "#FFFFFF", ground: "#F3EBDF", border: "#E7DCCB" },
      dark: { bg: "#1E1814", surface: "#2A221C", ink: "#F5EDE2", muted: "#C9B9A6", accent: "#E4845F", onAccent: "#1E1814", ground: "#33291F", border: "#3D3129" },
    },
    fonts: { heading: FONTS.fraunces, body: FONTS.sourceSans },
    radius: { sm: "6px", md: "12px", lg: "20px" },
    density: "regular",
    headingWeight: 600,
    headingLetterSpacing: "-0.015em",
  },
  studio: {
    id: "studio",
    label: "Studio",
    colors: {
      light: { bg: "#FFFFFF", surface: "#F6F6F4", ink: "#111111", muted: "#5E5E5E", accent: "#111111", onAccent: "#FFFFFF", ground: "#F1F1EE", border: "#E4E4E1" },
      dark: { bg: "#0F0F0F", surface: "#1A1A1A", ink: "#F2F2F2", muted: "#B3B3B3", accent: "#F2F2F2", onAccent: "#0F0F0F", ground: "#202020", border: "#2C2C2C" },
    },
    fonts: { heading: FONTS.inter, body: FONTS.inter },
    radius: { sm: "2px", md: "4px", lg: "8px" },
    density: "airy",
    headingWeight: 500,
    headingLetterSpacing: "-0.03em",
  },
  garden: {
    id: "garden",
    label: "Garden",
    colors: {
      light: { bg: "#F4F6F0", surface: "#FFFFFF", ink: "#1F2A1D", muted: "#56634F", accent: "#2F6B3A", onAccent: "#FFFFFF", ground: "#EAEFE3", border: "#D9E0D0" },
      dark: { bg: "#161C15", surface: "#1F2A1E", ink: "#EDF2E8", muted: "#B9C6B0", accent: "#8FCB93", onAccent: "#161C15", ground: "#26332A", border: "#33402F" },
    },
    fonts: { heading: FONTS.lora, body: FONTS.nunitoSans },
    radius: { sm: "8px", md: "14px", lg: "24px" },
    density: "regular",
    headingWeight: 600,
    headingLetterSpacing: "-0.01em",
  },
  night: {
    id: "night",
    label: "Night",
    colors: {
      light: { bg: "#F4F4F8", surface: "#FFFFFF", ink: "#15151F", muted: "#575768", accent: "#3B3BD9", onAccent: "#FFFFFF", ground: "#ECECF4", border: "#DCDCE8" },
      dark: { bg: "#0B0B12", surface: "#15151F", ink: "#EEEEF6", muted: "#A9A9BD", accent: "#8B8BFF", onAccent: "#0B0B12", ground: "#1B1B28", border: "#262636" },
    },
    fonts: { heading: FONTS.spaceGrotesk, body: FONTS.inter },
    radius: { sm: "4px", md: "8px", lg: "12px" },
    density: "compact",
    headingWeight: 600,
    headingLetterSpacing: "-0.02em",
  },
  candy: {
    id: "candy",
    label: "Candy",
    colors: {
      light: { bg: "#FFF7FA", surface: "#FFFFFF", ink: "#2A1B22", muted: "#6E5560", accent: "#C2185B", onAccent: "#FFFFFF", ground: "#FDECF2", border: "#F5D7E2" },
      dark: { bg: "#1C1218", surface: "#281A22", ink: "#FBEFF4", muted: "#D2B7C3", accent: "#FF7AA8", onAccent: "#1C1218", ground: "#33212B", border: "#3F2A35" },
    },
    fonts: { heading: FONTS.bricolage, body: FONTS.nunito },
    radius: { sm: "10px", md: "18px", lg: "28px" },
    density: "regular",
    headingWeight: 700,
    headingLetterSpacing: "-0.02em",
  },
  workshop: {
    id: "workshop",
    label: "Workshop",
    colors: {
      light: { bg: "#F7F3EC", surface: "#FFFFFF", ink: "#23201B", muted: "#625B50", accent: "#6B4E2E", onAccent: "#FFFFFF", ground: "#EFE7DA", border: "#E1D7C6" },
      dark: { bg: "#1A1714", surface: "#26211C", ink: "#F2EBE0", muted: "#C5B9A8", accent: "#D2A46E", onAccent: "#1A1714", ground: "#302922", border: "#3A322A" },
    },
    fonts: { heading: FONTS.playfair, body: FONTS.workSans },
    radius: { sm: "3px", md: "6px", lg: "10px" },
    density: "regular",
    headingWeight: 600,
    headingLetterSpacing: "-0.01em",
  },
};
```

`packages/core/src/themes/index.ts`:
```ts
import type { Tone } from "../contracts/content";
import type { ThemeId } from "../contracts/theme-id";
import { themes } from "./themes";
import type { Theme } from "./types";

export { contrastRatio, relativeLuminance } from "./contrast";
export { fontFileExists, fontFilePath } from "./fonts";
export { themes } from "./themes";
export type { ColorTokens, Density, FontSpec, Theme } from "./types";

/** Static tone-to-theme map (design 7.1). "garden" is reachable only through the operator override. */
export const TONE_THEME: Record<Tone, ThemeId> = {
  warm: "market",
  playful: "candy",
  crafted: "workshop",
  technical: "night",
  minimal: "studio",
};

export function getTheme(id: ThemeId): Theme {
  return themes[id];
}

export function themeForTone(tone: Tone): Theme {
  return themes[TONE_THEME[tone]];
}
```

- [ ] **Step 8: Run the theme tests to verify they pass**

Run: `pnpm --filter @nazariitsubera/core test -- themes`
Expected: `Test Files  2 passed`, `Tests  18 passed`. The filter matches both files under `src/themes/`: 14 theme tests plus the 4 contrast tests.

- [ ] **Step 9: Lint, typecheck, commit**

Run: `pnpm lint && pnpm typecheck`
Expected: clean.

```bash
git add -A
git commit -m "feat(core): add themes module with six AA-checked token sets

Six curated themes with light and dark tokens, self-hosted variable font
pairings from fontsource, a static tone-to-theme map, WCAG contrast
utilities, and tests that assert AA for every text pair in every theme
and that every referenced font file is installed.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: The stylesheet builder

**Files:**
- Create: `packages/core/src/template/styles.ts`
- Test: `packages/core/src/template/styles.test.ts`

**Interfaces:**
- Consumes: `Theme`, `ColorTokens` from `../themes/types`.
- Produces: `buildStylesheet(theme: Theme, fontsBaseUrl: string): string`. The returned CSS defines custom properties `--bg --surface --ink --muted --accent --on-accent --ground --border --radius-sm --radius-md --radius-lg --unit --font-heading --font-body --heading-weight --heading-tracking`, overrides the color tokens under `@media (prefers-color-scheme:dark)`, emits one `@font-face` per distinct font file, and styles these class names used by Task 5: `wrap section eyebrow hero hero-grid sub hero-media btn grid card card-media card-body blurb price about-grid portrait markets market note contact links`.

- [ ] **Step 1: Write the failing test**

`packages/core/src/template/styles.test.ts`:
```ts
import { describe, expect, it } from "vitest";

import { getTheme } from "../themes";
import { buildStylesheet } from "./styles";

describe("buildStylesheet", () => {
  it("emits light tokens on :root and dark tokens under the media query", () => {
    const css = buildStylesheet(getTheme("market"), "./fonts");
    expect(css).toContain(":root{--bg:#FBF6EE;");
    expect(css).toContain("@media (prefers-color-scheme:dark){:root{--bg:#1E1814;");
  });

  it("emits one @font-face per distinct font file, pointing at the fonts base url", () => {
    const market = buildStylesheet(getTheme("market"), "https://img.example.com/fonts");
    expect(market.match(/@font-face/g)).toHaveLength(2);
    expect(market).toContain('src:url("https://img.example.com/fonts/fraunces-latin-wght-normal.woff2") format("woff2")');

    const studio = buildStylesheet(getTheme("studio"), "./fonts");
    expect(studio.match(/@font-face/g)).toHaveLength(1);
  });

  it("maps density to the spacing unit", () => {
    expect(buildStylesheet(getTheme("night"), ".")).toContain("--unit:0.875rem");
    expect(buildStylesheet(getTheme("studio"), ".")).toContain("--unit:1.25rem");
    expect(buildStylesheet(getTheme("market"), ".")).toContain("--unit:1rem");
  });

  it("contains no script and no external url other than fonts", () => {
    const css = buildStylesheet(getTheme("candy"), "./fonts");
    expect(css).not.toMatch(/<script/i);
    expect(css.match(/url\(/g)).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @nazariitsubera/core test -- styles`
Expected: `FAIL` with `Failed to resolve import "./styles"`.

- [ ] **Step 3: Write the stylesheet builder**

`packages/core/src/template/styles.ts`:
```ts
import type { ColorTokens, Density, Theme } from "../themes/types";

const DENSITY_UNIT: Record<Density, string> = {
  compact: "0.875rem",
  regular: "1rem",
  airy: "1.25rem",
};

function tokenBlock(c: ColorTokens): string {
  return (
    `--bg:${c.bg};--surface:${c.surface};--ink:${c.ink};--muted:${c.muted};` +
    `--accent:${c.accent};--on-accent:${c.onAccent};--ground:${c.ground};--border:${c.border};`
  );
}

function fontFace(family: string, url: string): string {
  return (
    `@font-face{font-family:"${family}";src:url("${url}") format("woff2");` +
    `font-weight:100 900;font-style:normal;font-display:swap;}`
  );
}

/**
 * Layout and component styles. Mobile first, safe at 360px, no horizontal scroll.
 * Everything visual is driven by the custom properties set in buildStylesheet.
 */
const BASE_CSS = `
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--font-body);font-size:1.0625rem;line-height:1.55;-webkit-font-smoothing:antialiased}
img{display:block;max-width:100%;height:auto}
a{color:inherit}
h1,h2,h3{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);line-height:1.1;margin:0}
p,ul{margin:0}
.wrap{width:min(calc(100% - 2.5 * var(--unit)),72rem);margin-inline:auto}
.section{padding-block:calc(var(--unit) * 3)}
.section + .section{border-top:1px solid var(--border)}
.eyebrow{font-family:var(--font-body);font-weight:600;font-size:.8125rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:calc(var(--unit) * 1)}
.hero{padding-block:calc(var(--unit) * 2.5) calc(var(--unit) * 3)}
.hero-grid{display:grid;gap:calc(var(--unit) * 1.5)}
@media (min-width:48rem){.hero-grid{grid-template-columns:1.1fr 1fr;align-items:center;gap:calc(var(--unit) * 3)}}
.hero h1{font-size:clamp(2rem,6vw,3.5rem);margin-bottom:calc(var(--unit) * .75)}
.hero .sub{font-size:1.125rem;color:var(--muted);max-width:34ch}
.hero-media img{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:var(--radius-lg)}
.btn{display:inline-flex;align-items:center;gap:.5rem;background:var(--accent);color:var(--on-accent);text-decoration:none;font-weight:600;padding:.85rem 1.25rem;border-radius:var(--radius-md);min-height:44px}
.btn:hover{filter:brightness(1.06)}
.hero .btn{margin-top:calc(var(--unit) * 1.5)}
.grid{list-style:none;padding:0;display:grid;gap:calc(var(--unit) * 1.25);grid-template-columns:repeat(2,minmax(0,1fr))}
@media (min-width:40rem){.grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (min-width:64rem){.grid{grid-template-columns:repeat(4,minmax(0,1fr))}}
.card{display:flex;flex-direction:column;height:100%;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;color:inherit;text-decoration:none}
.card-media{background:var(--ground);aspect-ratio:1/1}
.card-media img{width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 10px 14px rgba(0,0,0,.16))}
.card-body{padding:calc(var(--unit) * .9) var(--unit) var(--unit);display:grid;gap:.25rem}
.card h3{font-size:1.0625rem;line-height:1.25}
.card .blurb{font-size:.9375rem;color:var(--muted)}
.card .price{font-weight:600;font-size:.9375rem}
.about-grid{display:grid;gap:calc(var(--unit) * 1.5)}
@media (min-width:48rem){.about-grid{grid-template-columns:2fr 1fr;align-items:start}}
.about p{font-size:1.125rem;max-width:60ch}
.portrait img{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:var(--radius-lg)}
.markets{list-style:none;padding:0;display:grid;gap:var(--unit)}
.market{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-md);padding:var(--unit);display:grid;gap:.25rem}
.market a{color:var(--accent);font-weight:600}
.note{margin-top:var(--unit);color:var(--muted)}
.contact{display:grid;gap:var(--unit);justify-items:start}
.contact .btn{font-size:1.125rem}
.links{display:flex;flex-wrap:wrap;gap:var(--unit);color:var(--muted)}
.links a{color:var(--accent)}
footer{padding-block:calc(var(--unit) * 2) calc(var(--unit) * 4);color:var(--muted);font-size:.875rem;border-top:1px solid var(--border)}
footer a{color:inherit}
`.trim();

/**
 * Builds the complete stylesheet for one theme. Pure: same inputs, same string.
 * fontsBaseUrl has no trailing slash; font files are referenced as `${fontsBaseUrl}/${file}`.
 */
export function buildStylesheet(theme: Theme, fontsBaseUrl: string): string {
  const { heading, body } = theme.fonts;
  const faces = [fontFace(heading.family, `${fontsBaseUrl}/${heading.file}`)];
  if (body.file !== heading.file) {
    faces.push(fontFace(body.family, `${fontsBaseUrl}/${body.file}`));
  }

  const root =
    `:root{${tokenBlock(theme.colors.light)}` +
    `--radius-sm:${theme.radius.sm};--radius-md:${theme.radius.md};--radius-lg:${theme.radius.lg};` +
    `--unit:${DENSITY_UNIT[theme.density]};` +
    `--font-heading:"${heading.family}",${heading.fallback};` +
    `--font-body:"${body.family}",${body.fallback};` +
    `--heading-weight:${theme.headingWeight};--heading-tracking:${theme.headingLetterSpacing};` +
    `color-scheme:light dark;}`;

  const dark = `@media (prefers-color-scheme:dark){:root{${tokenBlock(theme.colors.dark)}}}`;

  return [...faces, root, dark, BASE_CSS].join("\n");
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm --filter @nazariitsubera/core test -- styles`
Expected: `4 passed`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(core): add stylesheet builder for the vendor template

Generates the full CSS for a theme: custom properties for light, a dark
override under prefers-color-scheme, one @font-face per distinct font
file, and the mobile-first layout for every section class.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: Template components and `renderSite`

**Files:**
- Create: `packages/core/src/template/format.ts`, `packages/core/src/template/components/picture.tsx`, `hero.tsx`, `products.tsx`, `about.tsx`, `visit.tsx`, `contact.tsx`, `document.tsx` (all under `packages/core/src/template/components/`), `packages/core/src/template/render.tsx`, `packages/core/src/template/index.ts`
- Create: `packages/core/fixtures/demo-vendor/render-input.json`
- Test: `packages/core/src/template/format.test.ts`, `packages/core/src/template/render.test.tsx`

**Interfaces:**
- Consumes: `RenderInput`, `RenderAsset`, `ContentJson`, `Product`, `renderInputSchema` from `../contracts/*`; `Theme`, `getTheme` from `../themes`; `buildStylesheet` from `./styles`.
- Produces, from `@nazariitsubera/core/template`:
  - `renderSite(input: RenderInput): RenderResult` where `type RenderResult = { html: string; bytes: number }`. `html` starts with `<!doctype html>`, has CSS inlined in one `<style>`, contains no `<script>`.
  - `buildStylesheet` re-exported.
  - `formatPhone(e164: string): string` formats `+1NXXNXXXXXX` as `(NXX) NXX-XXXX`, anything else unchanged.

- [ ] **Step 1: Write the fixture**

`packages/core/fixtures/demo-vendor/render-input.json`:
```json
{
  "content": {
    "schemaVersion": 1,
    "businessName": "Pearl Street Pottery",
    "tagline": "Small-batch stoneware from San Antonio",
    "heroHeadline": "Mugs made for slow mornings",
    "heroSub": "Wheel-thrown stoneware, glazed by hand in a home studio off Broadway. Find us at the Pearl every Saturday.",
    "about": "Maria started throwing pots in a community studio and never stopped. Every piece is thrown, trimmed, and glazed by hand, so no two mugs are quite the same. Most weekends you will find her at the Pearl Farmers Market with a table full of new work.",
    "tone": "warm",
    "heroAssetId": "scene-1",
    "personAssetId": "person-1",
    "products": [
      { "assetId": "product-1", "name": "Speckled mug", "blurb": "Twelve ounces with a comfortable, wide handle.", "priceHint": null, "checkoutUrl": null, "source": null },
      { "assetId": "product-2", "name": "Serving bowl", "blurb": "Wide and shallow, made for a table full of people.", "priceHint": "$48", "checkoutUrl": "https://square.link/u/demo-bowl", "source": null },
      { "assetId": "product-3", "name": "Bud vase", "blurb": "Holds one stem and a lot of attention.", "priceHint": null, "checkoutUrl": null, "source": null },
      { "assetId": "product-4", "name": "Pour-over set", "blurb": "Dripper and carafe, glazed to match.", "priceHint": "$72", "checkoutUrl": null, "source": null },
      { "assetId": "product-5", "name": "Salt cellar", "blurb": null, "priceHint": null, "checkoutUrl": null, "source": null },
      { "assetId": "product-6", "name": "Dinner plate", "blurb": "Ten inches, stackable, quietly speckled.", "priceHint": null, "checkoutUrl": null, "source": null }
    ],
    "visit": {
      "markets": [
        { "name": "Pearl Farmers Market", "mapsUrl": "https://maps.google.com/?q=Pearl+Farmers+Market+San+Antonio", "scheduleNote": "Saturdays, 9am to 1pm" }
      ],
      "note": "Look for the blue tent near the fountain."
    },
    "contact": { "phone": "+12105550123", "instagramHandle": "pearlstreetpottery", "ctaLabel": "Call or text" }
  },
  "themeId": "market",
  "assets": {
    "scene-1": { "id": "scene-1", "kind": "scene", "alt": "The Pearl Street Pottery booth at the market", "variants": { "w480": "images/scene-1-w480.svg", "w960": "images/scene-1-w960.svg", "w1440": "images/scene-1-w1440.svg" }, "width": 1440, "height": 810 },
    "person-1": { "id": "person-1", "kind": "person", "alt": "Maria at the wheel", "variants": { "w480": "images/person-1-w480.svg", "w960": "images/person-1-w960.svg", "w1440": "images/person-1-w1440.svg" }, "width": 1152, "height": 1440 },
    "product-1": { "id": "product-1", "kind": "product", "alt": "Speckled mug", "variants": { "w480": "images/product-1-w480.svg", "w960": "images/product-1-w960.svg", "w1440": "images/product-1-w1440.svg" }, "width": 1440, "height": 1440 },
    "product-2": { "id": "product-2", "kind": "product", "alt": "Serving bowl", "variants": { "w480": "images/product-2-w480.svg", "w960": "images/product-2-w960.svg", "w1440": "images/product-2-w1440.svg" }, "width": 1440, "height": 1440 },
    "product-3": { "id": "product-3", "kind": "product", "alt": "Bud vase", "variants": { "w480": "images/product-3-w480.svg", "w960": "images/product-3-w960.svg", "w1440": "images/product-3-w1440.svg" }, "width": 1440, "height": 1440 },
    "product-4": { "id": "product-4", "kind": "product", "alt": "Pour-over set", "variants": { "w480": "images/product-4-w480.svg", "w960": "images/product-4-w960.svg", "w1440": "images/product-4-w1440.svg" }, "width": 1440, "height": 1440 },
    "product-5": { "id": "product-5", "kind": "product", "alt": "Salt cellar", "variants": { "w480": "images/product-5-w480.svg", "w960": "images/product-5-w960.svg", "w1440": "images/product-5-w1440.svg" }, "width": 1440, "height": 1440 },
    "product-6": { "id": "product-6", "kind": "product", "alt": "Dinner plate", "variants": { "w480": "images/product-6-w480.svg", "w960": "images/product-6-w960.svg", "w1440": "images/product-6-w1440.svg" }, "width": 1440, "height": 1440 }
  },
  "context": {
    "siteUrl": "https://pearl-street-pottery.nazariitsubera.com",
    "claimUrl": "https://nazariitsubera.com/claim/pearl-street-pottery",
    "assetsBaseUrl": ".",
    "operatorName": "Nazarii Tsubera",
    "operatorUrl": "https://nazariitsubera.com"
  }
}
```

- [ ] **Step 2: Write the failing tests**

`packages/core/src/template/format.test.ts`:
```ts
import { describe, expect, it } from "vitest";

import { formatPhone } from "./format";

describe("formatPhone", () => {
  it("formats a US E.164 number for display", () => {
    expect(formatPhone("+12105550123")).toBe("(210) 555-0123");
  });

  it("leaves non-US numbers unchanged", () => {
    expect(formatPhone("+442071234567")).toBe("+442071234567");
  });
});
```

`packages/core/src/template/render.test.tsx`:
```tsx
import { describe, expect, it } from "vitest";

import { THEME_IDS } from "../contracts/theme-id";
import { renderInputSchema } from "../contracts/render";
import fixture from "../../fixtures/demo-vendor/render-input.json";
import { renderSite } from "./render";

const input = renderInputSchema.parse(fixture);

describe("renderSite", () => {
  it("is deterministic and matches the snapshot", () => {
    const first = renderSite(input).html;
    const second = renderSite(input).html;
    expect(first).toBe(second);
    expect(first).toMatchSnapshot();
  });

  it("emits a full document with inlined CSS and no script", () => {
    const { html } = renderSite(input);
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain('<html lang="en">');
    expect(html.match(/<style>/g)).toHaveLength(1);
    expect(html).not.toMatch(/<script/i);
    expect(html).not.toMatch(/<link[^>]+rel="stylesheet"/i);
  });

  it("renders one card per product with a three-width srcset and explicit dimensions", () => {
    const { html } = renderSite(input);
    expect(html.match(/class="card"/g)).toHaveLength(input.content.products.length);
    expect(html).toContain('srcset="images/product-1-w480.svg 480w, images/product-1-w960.svg 960w, images/product-1-w1440.svg 1440w"');
    expect(html).toContain('width="1440" height="1440"');
  });

  it("links a product card only when it has a checkout url", () => {
    const { html } = renderSite(input);
    expect(html).toContain('<a class="card" href="https://square.link/u/demo-bowl" target="_blank" rel="noopener">');
    expect(html.match(/<a class="card"/g)).toHaveLength(1);
  });

  it("uses a tel: link as the primary call to action and formats the number", () => {
    const { html } = renderSite(input);
    expect(html).toContain('href="tel:+12105550123"');
    expect(html).toContain("(210) 555-0123");
  });

  it("loads the hero eagerly and everything else lazily", () => {
    const { html } = renderSite(input);
    expect(html).toContain('loading="eager"');
    expect(html).toContain('fetchpriority="high"');
    expect(html.match(/loading="lazy"/g)).toHaveLength(input.content.products.length + 1);
  });

  it("renders neither a banner nor a robots tag; finalizePage owns those at publish", () => {
    const { html } = renderSite(input);
    expect(html).not.toContain('name="robots"');
    expect(html).not.toContain("banner");
  });

  it("omits about and visit when they are empty", () => {
    const content = { ...input.content, about: null, personAssetId: null, visit: { markets: [], note: null } };
    const { html } = renderSite({ ...input, content });
    expect(html).not.toContain('id="about"');
    expect(html).not.toContain('id="visit"');
    expect(html).toContain('id="products"');
    expect(html).toContain('id="contact"');
  });

  it("falls back to a text-only hero when there is no hero asset", () => {
    const { html } = renderSite({ ...input, content: { ...input.content, heroAssetId: null } });
    expect(html).not.toContain('class="hero-media"');
    expect(html).toContain(input.content.heroHeadline);
  });

  it("stays under the HTML budget", () => {
    expect(renderSite(input).bytes).toBeLessThan(40_000);
  });

  it.each(THEME_IDS)("renders with theme %s", (themeId) => {
    const { html } = renderSite({ ...input, themeId });
    expect(html).toContain("<!doctype html>");
    expect(html).toContain("@font-face");
  });

  it("rejects invalid input", () => {
    expect(() => renderSite({ ...input, themeId: "neon" as never })).toThrow();
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `pnpm --filter @nazariitsubera/core test -- template`
Expected: `FAIL` for both new files with `Failed to resolve import "./format"` and `"./render"`.

- [ ] **Step 4: Write the formatter and the components**

`packages/core/src/template/format.ts`:
```ts
/** Display form for E.164 numbers. US numbers become (NXX) NXX-XXXX; everything else is returned as given. */
export function formatPhone(e164: string): string {
  const us = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(e164);
  return us ? `(${us[1]}) ${us[2]}-${us[3]}` : e164;
}
```

`packages/core/src/template/components/picture.tsx`:
```tsx
import type { RenderAsset } from "../../contracts/render";

type Props = {
  asset: RenderAsset;
  /** The sizes attribute, describing the rendered width at each breakpoint. */
  sizes: string;
  /** Above the fold: eager, high priority. Everything else is lazy. */
  priority?: boolean;
};

export function Picture({ asset, sizes, priority = false }: Props) {
  const { w480, w960, w1440 } = asset.variants;
  return (
    <img
      src={w960}
      srcSet={`${w480} 480w, ${w960} 960w, ${w1440} 1440w`}
      sizes={sizes}
      width={asset.width}
      height={asset.height}
      alt={asset.alt}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : undefined}
    />
  );
}
```

`packages/core/src/template/components/hero.tsx`:
```tsx
import type { ContentJson } from "../../contracts/content";
import type { RenderAsset } from "../../contracts/render";
import { Picture } from "./picture";

type Props = { content: ContentJson; hero: RenderAsset | null };

export function Hero({ content, hero }: Props) {
  return (
    <header className="hero">
      <div className="wrap hero-grid">
        <div>
          <p className="eyebrow">{content.businessName}</p>
          <h1>{content.heroHeadline}</h1>
          <p className="sub">{content.heroSub}</p>
          <a className="btn" href={`tel:${content.contact.phone}`}>
            {content.contact.ctaLabel}
          </a>
        </div>
        {hero ? (
          <div className="hero-media">
            <Picture asset={hero} sizes="(min-width: 48rem) 45vw, 100vw" priority />
          </div>
        ) : null}
      </div>
    </header>
  );
}
```

`packages/core/src/template/components/products.tsx`:
```tsx
import type { Product } from "../../contracts/content";
import type { RenderAsset } from "../../contracts/render";
import { Picture } from "./picture";

type Props = { products: Product[]; assets: Record<string, RenderAsset> };

const CARD_SIZES = "(min-width: 64rem) 22vw, (min-width: 40rem) 30vw, 45vw";

function CardBody({ product, asset }: { product: Product; asset: RenderAsset | undefined }) {
  return (
    <>
      <div className="card-media">{asset ? <Picture asset={asset} sizes={CARD_SIZES} /> : null}</div>
      <div className="card-body">
        <h3>{product.name}</h3>
        {product.blurb ? <p className="blurb">{product.blurb}</p> : null}
        {product.priceHint ? <p className="price">{product.priceHint}</p> : null}
      </div>
    </>
  );
}

export function Products({ products, assets }: Props) {
  if (products.length === 0) return null;
  return (
    <section className="section" id="products" aria-labelledby="products-title">
      <div className="wrap">
        <h2 className="eyebrow" id="products-title">
          Products
        </h2>
        <ul className="grid">
          {products.map((product) => {
            const asset = assets[product.assetId];
            return (
              <li key={product.assetId}>
                {product.checkoutUrl ? (
                  <a className="card" href={product.checkoutUrl} target="_blank" rel="noopener">
                    <CardBody product={product} asset={asset} />
                  </a>
                ) : (
                  <div className="card">
                    <CardBody product={product} asset={asset} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
```

`packages/core/src/template/components/about.tsx`:
```tsx
import type { RenderAsset } from "../../contracts/render";
import { Picture } from "./picture";

type Props = { about: string | null; person: RenderAsset | null };

export function About({ about, person }: Props) {
  if (!about) return null;
  return (
    <section className="section about" id="about" aria-labelledby="about-title">
      <div className="wrap about-grid">
        <div>
          <h2 className="eyebrow" id="about-title">
            About
          </h2>
          <p>{about}</p>
        </div>
        {person ? (
          <div className="portrait">
            <Picture asset={person} sizes="(min-width: 48rem) 30vw, 100vw" />
          </div>
        ) : null}
      </div>
    </section>
  );
}
```

`packages/core/src/template/components/visit.tsx`:
```tsx
import type { ContentJson } from "../../contracts/content";

type Props = { visit: ContentJson["visit"] };

export function Visit({ visit }: Props) {
  if (visit.markets.length === 0) return null;
  return (
    <section className="section" id="visit" aria-labelledby="visit-title">
      <div className="wrap">
        <h2 className="eyebrow" id="visit-title">
          Where to find us
        </h2>
        <ul className="markets">
          {visit.markets.map((market) => (
            <li className="market" key={market.name}>
              <strong>{market.name}</strong>
              {market.scheduleNote ? <span>{market.scheduleNote}</span> : null}
              {market.mapsUrl ? (
                <a href={market.mapsUrl} target="_blank" rel="noopener">
                  Open in Maps
                </a>
              ) : null}
            </li>
          ))}
        </ul>
        {visit.note ? <p className="note">{visit.note}</p> : null}
      </div>
    </section>
  );
}
```

`packages/core/src/template/components/contact.tsx`:
```tsx
import type { ContentJson } from "../../contracts/content";
import { formatPhone } from "../format";

type Props = { contact: ContentJson["contact"]; businessName: string };

export function Contact({ contact, businessName }: Props) {
  const handle = contact.instagramHandle?.replace(/^@/, "") ?? null;
  return (
    <section className="section" id="contact" aria-labelledby="contact-title">
      <div className="wrap contact">
        <h2 className="eyebrow" id="contact-title">
          Get in touch
        </h2>
        <a className="btn" href={`tel:${contact.phone}`}>
          {contact.ctaLabel} {formatPhone(contact.phone)}
        </a>
        <div className="links">
          {handle ? (
            <a href={`https://instagram.com/${handle}`} target="_blank" rel="noopener">
              @{handle}
            </a>
          ) : null}
          <span>{businessName}</span>
        </div>
      </div>
    </section>
  );
}
```

`packages/core/src/template/components/document.tsx`:
```tsx
import type { RenderInput } from "../../contracts/render";
import type { Theme } from "../../themes/types";
import { About } from "./about";
import { Contact } from "./contact";
import { Hero } from "./hero";
import { Products } from "./products";
import { Visit } from "./visit";

type Props = { input: RenderInput; theme: Theme; css: string; fontsBaseUrl: string };

export function Document({ input, theme, css, fontsBaseUrl }: Props) {
  const { content, assets, context } = input;
  const hero = content.heroAssetId ? (assets[content.heroAssetId] ?? null) : null;
  const person = content.personAssetId ? (assets[content.personAssetId] ?? null) : null;
  const title = `${content.businessName} · ${content.tagline}`;

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <meta name="description" content={content.heroSub} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={content.heroSub} />
        {hero ? <meta property="og:image" content={hero.variants.w960} /> : null}
        <link rel="canonical" href={context.siteUrl} />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href={`${fontsBaseUrl}/${theme.fonts.heading.file}`}
          crossOrigin="anonymous"
        />
        <style dangerouslySetInnerHTML={{ __html: css }} />
      </head>
      <body>
        <Hero content={content} hero={hero} />
        <main>
          <Products products={content.products} assets={assets} />
          <About about={content.about} person={person} />
          <Visit visit={content.visit} />
          <Contact contact={content.contact} businessName={content.businessName} />
        </main>
        <footer>
          <div className="wrap">
            <span>{content.businessName}</span> · <a href={context.operatorUrl}>Site by {context.operatorName}</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
```

`packages/core/src/template/render.tsx`:
```tsx
import { renderToStaticMarkup } from "react-dom/server";

import { renderInputSchema, type RenderInput } from "../contracts/render";
import { getTheme } from "../themes";
import { Document } from "./components/document";
import { buildStylesheet } from "./styles";

export type RenderResult = { html: string; bytes: number };

/**
 * The template's single entry point. Pure: identical input yields identical HTML.
 * Validates the input, resolves the theme, inlines the stylesheet, and returns a complete document.
 */
export function renderSite(rawInput: RenderInput): RenderResult {
  const input = renderInputSchema.parse(rawInput);
  const theme = getTheme(input.themeId);
  const fontsBaseUrl = `${input.context.assetsBaseUrl.replace(/\/$/, "")}/fonts`;
  const css = buildStylesheet(theme, fontsBaseUrl);
  const markup = renderToStaticMarkup(
    <Document input={input} theme={theme} css={css} fontsBaseUrl={fontsBaseUrl} />,
  );
  const html = `<!doctype html>\n${markup}`;
  return { html, bytes: new TextEncoder().encode(html).length };
}
```

`packages/core/src/template/index.ts`:
```ts
export { formatPhone } from "./format";
export { renderSite } from "./render";
export type { RenderResult } from "./render";
export { buildStylesheet } from "./styles";
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `pnpm --filter @nazariitsubera/core test -- template`
Expected: `Test Files  3 passed` (styles, format, render), `Tests  23 passed`, and a line `Snapshots  1 written`. The render file has 17 tests: eleven single cases and the six per-theme cases. A new file `packages/core/src/template/__snapshots__/render.test.tsx.snap` exists.

If the `loading="lazy"` count fails, count the images: six products plus one person portrait is seven lazy images, and the hero is the only eager one. If the `srcset` assertion fails, check that React emitted the attribute as lowercase `srcset`; it does in static markup.

- [ ] **Step 6: Lint, typecheck, commit**

Run: `pnpm lint && pnpm typecheck`
Expected: clean. The template files import `react-dom/server` only inside `packages/core/src/template/`, so the boundary rule passes.

```bash
git add -A
git commit -m "feat(core): add vendor site template and renderSite

Server-rendered React components for hero, products, about, visit, and
contact, a document shell with font preload, and the pure renderSite
entry point that inlines the theme stylesheet. This is the fallback
renderer and quality floor; the model authors production pages. Includes the demo fixture and tests for determinism, zero
JavaScript, srcset, lazy loading, section omission, and
the HTML size budget.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: The render CLI and the Lighthouse check

**Files:**
- Create: `packages/core/scripts/render-fixture.ts`, `packages/core/fixtures/demo-vendor/README.md`
- Modify: `packages/core/tsconfig.json` (already includes `scripts/**`), `.gitignore` (already ignores `out/`)

**Interfaces:**
- Consumes: `renderInputSchema`, `themeIdSchema` from `../src/contracts`; `getTheme`, `fontFilePath` from `../src/themes`; `renderSite` from `../src/template`.
- Produces: `pnpm --filter @nazariitsubera/core render:fixture [--fixture <dir>] [--theme <id>] [--out <dir>]` writes `index.html`, `fonts/*.woff2`, and `images/*` into `packages/core/out/<fixture>[-<theme>]/`.

- [ ] **Step 1: Write the CLI**

`packages/core/scripts/render-fixture.ts`:
```ts
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { renderInputSchema, themeIdSchema } from "../src/contracts";
import { fontFilePath, getTheme } from "../src/themes";
import { renderSite } from "../src/template";

const coreRoot = fileURLToPath(new URL("..", import.meta.url));
const args = process.argv.slice(2);

function opt(name: string, fallback: string): string {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}

const fixtureDir = path.resolve(coreRoot, opt("fixture", "fixtures/demo-vendor"));
const themeArg = opt("theme", "");
const defaultOut = `out/${path.basename(fixtureDir)}${themeArg ? `-${themeArg}` : ""}`;
const outDir = path.resolve(coreRoot, opt("out", defaultOut));

const raw: unknown = JSON.parse(readFileSync(path.join(fixtureDir, "render-input.json"), "utf8"));
const input = renderInputSchema.parse(
  themeArg ? { ...(raw as Record<string, unknown>), themeId: themeIdSchema.parse(themeArg) } : raw,
);

const { html, bytes } = renderSite(input);

mkdirSync(path.join(outDir, "fonts"), { recursive: true });
writeFileSync(path.join(outDir, "index.html"), html);

const theme = getTheme(input.themeId);
for (const font of [theme.fonts.heading, theme.fonts.body]) {
  copyFileSync(fontFilePath(font), path.join(outDir, "fonts", font.file));
}

const PLACEHOLDER_FILL: Record<string, string> = { product: "#D9C9B6", scene: "#B9C6B0", person: "#C9B7C0" };

/** Real photos arrive with the pipeline. Until then, an SVG of the right aspect stands in for any missing image. */
function placeholderSvg(width: number, height: number, label: string, kind: string): string {
  const fill = PLACEHOLDER_FILL[kind] ?? "#CCCCCC";
  const fontSize = Math.round(width / 16);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<rect width="100%" height="100%" fill="${fill}"/>` +
    `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="${fontSize}" fill="#3A342E">${label}</text>` +
    `</svg>\n`
  );
}

let placeholders = 0;
for (const asset of Object.values(input.assets)) {
  for (const [key, rel] of Object.entries(asset.variants)) {
    const src = path.join(fixtureDir, rel);
    const dest = path.join(outDir, rel);
    mkdirSync(path.dirname(dest), { recursive: true });
    if (existsSync(src)) {
      copyFileSync(src, dest);
      continue;
    }
    if (!rel.endsWith(".svg")) {
      throw new Error(`Missing image ${rel} for asset ${asset.id}; only .svg variants get placeholders.`);
    }
    const width = Number(key.slice(1));
    const height = Math.round((width * asset.height) / asset.width);
    writeFileSync(dest, placeholderSvg(width, height, asset.alt || asset.id, asset.kind));
    placeholders += 1;
  }
}

console.log(
  `Rendered "${input.content.businessName}" with theme ${input.themeId} -> ${path.relative(coreRoot, outDir)}/index.html (${bytes} bytes, ${placeholders} placeholder images)`,
);
```

`packages/core/fixtures/demo-vendor/README.md`:
```markdown
# demo-vendor fixture

`render-input.json` is a complete `RenderInput` for a fictional vendor. It is the input for the
template snapshot tests and for the render CLI.

Render it:

    pnpm --filter @nazariitsubera/core render:fixture
    pnpm --filter @nazariitsubera/core render:fixture --theme candy

Output lands in `packages/core/out/demo-vendor[-<theme>]/`. Images referenced under `images/` are
generated as SVG placeholders of the right aspect when no file exists in this directory's
`images/` folder. Drop real files with the same names here to render with photos.

Serve the output for a Lighthouse run:

    python3 -m http.server 4173 --directory packages/core/out/demo-vendor
```

- [ ] **Step 2: Run the CLI for the default theme and one override**

Run:
```bash
pnpm --filter @nazariitsubera/core render:fixture && pnpm --filter @nazariitsubera/core render:fixture --theme candy
```
Expected: two lines like `Rendered "Pearl Street Pottery" with theme market -> out/demo-vendor/index.html (NNNNN bytes, 24 placeholder images)` and the same for `candy` into `out/demo-vendor-candy/`. `NNNNN` is under 40000.

Run:
```bash
ls packages/core/out/demo-vendor packages/core/out/demo-vendor/fonts && grep -c '<script' packages/core/out/demo-vendor/index.html || true
```
Expected: `fonts  images  index.html`, two `.woff2` files, and `0` from grep.

- [ ] **Step 3: Verify the output in a browser**

Run in one terminal:
```bash
python3 -m http.server 4173 --directory packages/core/out/demo-vendor
```
Open http://localhost:4173 and check on a phone-width viewport (360px) and a desktop width: no horizontal scroll, two product columns at 360px, fonts loaded (headline is Fraunces, not Georgia). Toggle the OS dark mode and confirm the page follows it.

Run Lighthouse in Chrome DevTools, Mobile, categories Performance and Accessibility. Expected: both at least 95. Placeholder SVGs make LCP trivial; the real-image run happens in Plan 4. If Accessibility is below 95, the report names the failing audit; fix it in the component and re-render before committing.

Stop the server with Ctrl+C.

- [ ] **Step 4: Typecheck and commit**

Run: `pnpm typecheck && pnpm lint`
Expected: clean. `out/` is ignored by git.

```bash
git add -A
git commit -m "feat(core): add render-fixture CLI for local preview and Lighthouse

Renders a fixture RenderInput to out/, copies the theme's font files, and
writes SVG placeholders for missing images so the template can be viewed
and audited before the image pipeline exists.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: Working guide and decision records

**Files:**
- Create: `AGENTS.md` (replaces the stale Lumen Tools guide), `CLAUDE.md`, `docs/decisions/ADR-0002-workspace-with-single-core-package.md`, `docs/decisions/ADR-0003-static-zero-js-vendor-sites.md`

**Interfaces:** none. Documentation only.

- [ ] **Step 1: Write `AGENTS.md`**

Replace the whole file:
```markdown
# nazariitsubera.com Working Guide

## Purpose
One repository holds the personal consulting site and the Booth to MRR engine: an operator
console that turns a recorded booth conversation plus photos into a live vendor website on a
subdomain, a seven-day preview, and a Stripe purchase path that makes it permanent.

Design: `docs/superpowers/specs/2026-09-05-booth-to-mrr-engine-design.md`.
Plans: `docs/superpowers/plans/`. Decisions: `docs/decisions/`.

## Layout
- `apps/web`: Next.js App Router. Marketing pages, `/console`, API route handlers, vendor-site
  serving by hostname. Port 3000.
- `apps/worker`: Node process run with `tsx`. BullMQ processors. Arrives in Plan 3.
- `packages/core` (`@nazariitsubera/core`): every domain module, shipped as TypeScript source with one
  `exports` entry per module. No build step.

## Commands
- `pnpm install`, `pnpm dev`, `pnpm build`
- `pnpm lint`, `pnpm typecheck`, `pnpm test`
- `pnpm --filter @nazariitsubera/core render:fixture [--theme <id>]` renders the demo vendor to `packages/core/out/`

## Architecture rules
- Dependency direction is `apps -> core`, never the reverse, never app to app. ESLint enforces it.
- Browser code imports only `@nazariitsubera/core/contracts`. Every other core module is server-only.
- Only `packages/core/src/template` renders React to a string.
- Domain modules follow `service + repository`: route handlers parse, authenticate, call a
  service, return. Services own business rules and transactions. Repositories own queries.
- Zod schemas live next to their domain; types are inferred from them. No duplicate DTOs.
- Every table carries `vendorId`. Site versions are immutable; publish is a pointer swap.
- External providers sit behind adapters with a real and a fake implementation.

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

## Testing
- Unit: `pnpm test` (vitest, node environment for core). Fast, hermetic.
- Integration (ephemeral Postgres and Redis via docker compose) and e2e (Playwright) lanes
  arrive with Plan 2 and Plan 3.

## Decision logging
When an architecture, schema, API, auth, billing, pipeline, or template convention materially
changes, add an ADR under `docs/decisions/` following the existing `ADR-NNNN-title.md` pattern.

## Deployment
Railway. `web` builds with `pnpm install --frozen-lockfile && pnpm --filter web build` and
starts with `pnpm --filter web start`. Custom domains `nazariitsubera.com` and
`*.nazariitsubera.com` are attached to `web`. DNS is on Cloudflare, proxied, SSL mode Full.
```

`CLAUDE.md`:
```markdown
# CLAUDE.md

This file defers to `AGENTS.md`. Read it first. All working rules, layout, commands,
architecture rules, and decision-logging expectations live there and in the docs it points to.
Do not duplicate guidance here.
```

- [ ] **Step 2: Write the two ADRs**

`docs/decisions/ADR-0002-workspace-with-single-core-package.md`:
```markdown
# ADR-0002: pnpm workspace with a single core package consumed as source

- Status: Accepted
- Date: 2026-09-05

## Context
The repository gains two runtime applications with different dependency profiles: a Next.js app
and a Node worker with native image libraries. Both render the same vendor-site template and share
every domain module. A flat single project with a second worker entrypoint works when the worker is
light and there is one runtime; here the worker is the heavy process.

## Decision
Use a pnpm workspace with `apps/web`, `apps/worker`, and one package, `packages/core`
(`@nazariitsubera/core`). Core ships TypeScript source with an explicit `exports` map, one entry per module.
Next consumes it through `transpilePackages`; the worker and tests consume it through `tsx` and
`vitest`. There is no build step and no `dist/`. ESLint `no-restricted-imports` forbids core from
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
```

`docs/decisions/ADR-0003-static-zero-js-vendor-sites.md`:
```markdown
# ADR-0003: Vendor pages are static and zero-JavaScript, authored by the model within a gate, with a template fallback

- Status: Accepted
- Date: 2026-09-05

## Context
The product moment is a vendor seeing their own products on a live URL minutes after saying yes,
often on a phone with poor signal at a market. The page must load instantly and score at least 95
on mobile Lighthouse performance and accessibility. It must also look like that vendor and not like
the vendor three booths over: fixed templates make sites read as cookie-cutter and turn every
design improvement into template work. Sites are served multi-tenant from stored artifacts, so
anything that runs in the browser is cost and risk multiplied by every vendor.

## Decision
Every vendor page is a single static HTML document with inlined CSS and no JavaScript, enforced at
serving time by `Content-Security-Policy: script-src 'none'`.

The model authors each page from a design brief that fixes the rules (static, allowlisted URLs,
mobile first, alt and dimensions and srcset on every image, copy used verbatim) and leaves design
to the author. A deterministic gate verifies the result: HTML lint, the content guard on visible
text, and headless Chromium at three widths in light and dark with axe and an overflow check.
Violations and screenshots go back to the author for at most two repairs.

A curated template with six AA-tested themes (`packages/core/src/template`, `src/themes`) is the
floor. It renders the same content when the gate still fails, serves the first hand-built sites
before the pipeline exists, and is shown to the author as the quality bar. The preview banner and
noindex tag are injected at publish by `finalizePage`, so they never depend on who wrote the page.

## Consequences
- Each vendor gets a design of their own, with a floor that never drops below the template.
- Guarantees are properties of the gate and the template tests, not of prompt compliance.
- The worker image carries Chromium; generation takes two to four minutes longer when a repair is
  needed, and roughly fifty cents more per site.
- Edits are instructions to the author against the stored HTML, run through the same gate.

## Alternatives Considered
- Fixed template with variants chosen by the model: safer, but a ceiling on how different two
  sites can be, and every new look is engineering work.
- Free-form authoring without a gate: the failure mode lands at the booth in front of the vendor.
- Per-vendor Astro or Next builds: build time and a build container for the same static output.
- A client-side app: JavaScript weight and a Lighthouse ceiling on cheap phones.
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "docs: rewrite working guide and add ADRs for workspace and static sites

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

- [ ] **Step 4: Final verification of the whole plan**

Run:
```bash
pnpm install --frozen-lockfile && pnpm lint && pnpm typecheck && pnpm test && pnpm build
```
Expected: every command exits 0. Vitest reports 7 test files passed in the `core` project. `next build` lists `/`, `/api/health`, `/api/leads`, `/icon.svg`.

Run:
```bash
git log --oneline main..HEAD
```
Expected: eight commits, oldest to newest: design and plan docs, workspace conversion, core contracts, themes, stylesheet, template, CLI, working guide and ADRs.

Hand back to the user: the branch is ready to merge after the Railway build and start commands from Task 1 Step 12 are set.
