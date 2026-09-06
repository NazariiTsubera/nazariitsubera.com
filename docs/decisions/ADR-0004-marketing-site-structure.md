# ADR-0004: The marketing site is a set of indexable pages sharing one shell, in the Mineral design language

- Status: Accepted
- Date: 2026-09-06

## Context
The site has two audiences with different questions: local business owners deciding whether to
hire help, and recruiters and engineers checking credentials. A single long landing page served
both badly: one title and one description competed for every search, the page could carry only one
`h1`, and every call to action was a `mailto:` link that gave no signal back. A Claude Design
project ("Mineral") set the visual language: light Newsreader display type, IBM Plex Sans body,
spaced Plex Mono labels, a grey-green paper ground, one blue accent, and full-bleed bands inside a
1120px column.

## Decision
Marketing pages live in `apps/web/app/(marketing)` and share one layout: header, footer, and the
scroll-reveal root. Each page owns one `h1`, its own title, description and canonical, and appears
in `app/sitemap.ts`. The pages are `/` (landing), `/business`, `/engineering`, `/work`, `/about`,
`/contact`, and `/storefront` (the vendor-website offer, unchanged URL). `robots.ts` excludes
`/console`, `/api` and uploads. One generated Open Graph image serves every page.

Calls to action lead to `/contact`, which carries the HubSpot lead form (ADR-0001) next to the
direct email and phone; the page still works with the form unavailable.

Copy is data (`apps/web/content/`), components render it. Each project in `content/projects.ts` has
a long-form article in `content/work/<slug>.mdx` (via `@next/mdx`), statically generated at
`/work/<slug>` and listed in the sitemap; the `/work` index groups them by who they were for.
Essays live the same way under `content/writing.ts` and `content/writing/<slug>.mdx`, served at
`/writing/<slug>` with an RSS feed at `/feed.xml`. Every page sets its own title, description,
canonical and `og:url`; articles add BlogPosting or TechArticle and BreadcrumbList structured data.
`www` redirects to the apex. `pnpm smoke:marketing` walks the sitemap and checks all of it. The design is a language, not a fixed
composition: sections were kept, removed or reshaped by what a visitor needs. Sections whose
content does not exist yet (reviews, writing) are not rendered; nothing on the live site is a
placeholder except the four work screenshots, which show a labelled frame until the file exists.

## Consequences
- Each audience lands on a page written for them, with search metadata to match.
- The console keeps the root layout (fonts, metadata) but not the marketing shell.
- Adding a page means one folder, one metadata export, and one line in the sitemap.
- Tailwind keeps the token names the console already uses (`cream`, `ink`, `eyebrow`, ...) mapped
  onto the Mineral palette, so one theme serves all surfaces.

## Alternatives Considered
- One landing page with anchors: cheapest, but one title, one `h1`, no per-audience search entry.
- Per-project case study pages: better for search only with substantial copy; deferred until it
  exists, projects are anchors on `/work` for now.
- A CMS or MDX for copy: more moving parts than a few typed arrays justify today.
