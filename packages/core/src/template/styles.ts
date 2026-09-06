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
