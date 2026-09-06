# Booth to MRR Plan 4: Generation Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Turn a capture (recording plus tagged photos) into a published vendor site, unattended: transcribe, process images with cutouts, generate content under the fabrication guard, have the model author the page, verify it through a deterministic gate, repair or fall back to the template, then publish.

**Architecture:** New core modules `images`, `transcription`, `ai` (content + design), `gate`, and `pipeline`. Every external provider sits behind an adapter with a real implementation and a fake, selected by `PROVIDERS_MODE`. The worker's `runPipelineJob` becomes the real step runner. Steps record progress on the durable `Job` row and skip work whose artifact already exists.

**Tech Stack:** sharp 0.35 for image work, `@anthropic-ai/sdk` 0.124 with `claude-opus-5`, Playwright with Chromium plus `@axe-core/playwright` for the gate, parse5 for HTML lint.

**Spec:** design sections 6.1, 7.1–7.5, 8. Plan 1 built the template floor; Plan 2 built publish and serving; Plan 3 built captures, assets, storage, and jobs.

## Global Constraints

- **No provider credentials exist in this environment.** Everything is built and verified against fakes; real adapters are written but are not live-tested. `PROVIDERS_MODE=fake` must produce a complete published site end to end.
- Every derived image has all metadata stripped, EXIF and GPS included. Verified by reading the output.
- Derived artifacts are content addressed and skipped when they already exist, so regeneration never redoes image work.
- The content guard runs on model output and on the visible text of any authored page. A violation nulls the field rather than publishing a fabricated claim.
- The gate rejects any page with a `<script>`, an inline handler, an off-allowlist URL, a missing `alt`/`width`/`height`, or horizontal overflow at 360px; and any axe violation at WCAG 2 A or AA.
- At most two repair passes, then the template renders the same content as the fallback. A vendor always gets a site.
- Branch `booth-to-mrr/04-pipeline`. Commit at every task boundary. Do not push.
- Commit messages end with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

---

### Task 1: Image processing with sharp

**Files:** `packages/core/src/images/{index,normalize,variants,compose}.ts`, tests, fixtures.

**Interfaces:**
- `normalize(input: Uint8Array): Promise<{ data: Uint8Array; width: number; height: number }>` applies EXIF orientation, converts HEIC/PNG to JPEG, strips all metadata, applies a conservative auto-level.
- `productCard(cutout: Uint8Array, groundHex: string): Promise<Uint8Array>` trims to the alpha bounding box, pads to 1:1 with an 8% margin, composites onto the ground with a soft contact shadow.
- `crop(input, aspect: "16:9" | "3:2" | "4:5"): Promise<Uint8Array>`
- `variants(input: Uint8Array, widths: number[]): Promise<Record<string, Uint8Array>>` WebP at each width.

- [ ] Failing tests: metadata is absent after normalize; orientation is applied; product card is square with the ground colour at the corners; variants have the requested widths.
- [ ] Implement, then commit `feat(core): add sharp image processing with EXIF stripping`.

### Task 2: Background removal adapter

**Files:** `packages/core/src/images/background/{index,hosted,local}.ts`, tests.

**Interfaces:** `removeBackground(image: Uint8Array): Promise<Uint8Array>` returning PNG with alpha. The hosted adapter posts to the configured endpoint; the local fake keys out a near-uniform border colour, which is exactly the foam-board case the field playbook describes, so local output is genuinely usable.

- [ ] Failing test: a photo with a uniform white border comes back with transparent corners and an opaque centre.
- [ ] Implement, then commit `feat(core): add background removal with a local key-out fallback`.

### Task 3: Transcription adapter

**Files:** `packages/core/src/transcription/{index,deepgram,fake}.ts`, tests.

**Interfaces:** `transcribe(audio: Uint8Array, mime: string): Promise<{ text: string; durationSec: number | null }>`. The fake returns a fixture transcript so the pipeline runs offline.

- [ ] Test the selector and the fake; commit `feat(core): add transcription adapter`.

### Task 4: Content generation and the fabrication guard

**Files:** `packages/core/src/ai/{index,client,content,content-guard,prompts}.ts`, tests.

**Interfaces:**
- `checkContent(content: ContentJson, allowedAssetIds: string[]): Violation[]` — pure. Flags prices, years in business, awards, certifications, guarantees, policy claims, and any product id that is not the vendor's.
- `scrubContent(content, violations): ContentJson` — nulls offending fields.
- `generateContent(input: ContentInput): Promise<ContentJson>` — one `claude-opus-5` call with `zodOutputFormat`, adaptive thinking, effort high, cached system prompt, images as base64. One retry listing violations, then scrub.

- [ ] Failing guard tests over a table of fabricated claims. Implement guard, prompts, client, and the fake. Commit `feat(core): add content generation with the fabrication guard`.

### Task 5: Page authoring

**Files:** `packages/core/src/ai/{design,design-brief}.ts`, tests.

**Interfaces:** `authorPage(input: DesignInput): Promise<string>` and `repairPage(html, violations, screenshots): Promise<string>`. The brief carries the rules from design 7.1 plus the template's own output as the quality bar. The fake returns the template's HTML, so the fake pipeline still publishes a real page.

- [ ] Commit `feat(core): add model page authoring with a template-backed fake`.

### Task 6: The gate

**Files:** `packages/core/src/gate/{index,lint,text-guard,browser,report}.ts`, tests.

**Interfaces:**
- `lintHtml(html, allowedHosts): Violation[]` — parse5. Rejects scripts, inline handlers, iframes/objects/embeds/forms, `javascript:` URLs, off-allowlist URLs, images missing alt/width/height/srcset, missing or duplicate `<h1>`, missing head requirements, oversized documents.
- `checkVisibleText(html, content): Violation[]` — strips tags, runs the content guard, requires every product name and the phone number to appear.
- `inspectPage(html, baseUrl): Promise<GateReport>` — Chromium at 360/768/1280 in light and dark: overflow, axe violations, eager bytes, screenshots.
- `runGate(html, content, opts): Promise<GateReport>` — all three.

- [ ] Failing tests with fixture pages carrying planted violations. Implement. Commit `feat(core): add the page gate with lint, text guard, and Chromium checks`.

### Task 7: Pipeline orchestration

**Files:** `packages/core/src/pipeline/{index,steps,generate-site}.ts`, `apps/worker/src/processors/pipeline.ts` rewritten, integration test.

**Interfaces:** `runGenerateSite(jobId, vendorId)` runs the steps from design section 8 in order, recording each on the job row and skipping those whose artifact exists. Failure semantics: a first generation failing returns the vendor to `captured`; a later job failing leaves the live site untouched.

- [ ] Integration test: a vendor with a capture and photos, fake providers, ends `preview_live` with a published version whose HTML passes the gate; a rerun skips image steps.
- [ ] Commit `feat: add the generation pipeline end to end`.

### Task 8: Docs and verification

- [ ] AGENTS.md pipeline rules, env additions, design deviations, full verification. Commit `docs: document the generation pipeline`.
