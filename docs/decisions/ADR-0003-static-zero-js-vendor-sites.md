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
