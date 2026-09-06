import type { RenderFlags } from "../contracts/render";

const NOINDEX_RE = /<!--nt:noindex-->[\s\S]*?<!--\/nt:noindex-->/g;
const BANNER_RE = /<!--nt:banner-->[\s\S]*?<!--\/nt:banner-->/g;
const BANNER_STYLE_RE = /<!--nt:banner-style-->[\s\S]*?<!--\/nt:banner-style-->/g;

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function expiry(daysLeft: number | null): string | null {
  if (daysLeft === null) return null;
  if (daysLeft === 0) return "Expires today.";
  if (daysLeft === 1) return "Expires tomorrow.";
  return `Expires in ${daysLeft} days.`;
}

/** Self-contained: inline styles only, so it never depends on the page's own CSS. */
function banner(claimUrl: string, daysLeft: number | null): string {
  const when = expiry(daysLeft);
  return (
    `<!--nt:banner--><a href="${escapeAttr(claimUrl)}" style="position:fixed;left:0;right:0;bottom:0;z-index:2147483647;` +
    `display:flex;justify-content:center;flex-wrap:wrap;gap:.5rem;padding:.75rem 1rem;background:#17161c;color:#f4f2ee;` +
    `font:500 15px/1.4 system-ui,-apple-system,sans-serif;text-decoration:none">` +
    `<span>Preview.</span>${when ? `<span>${when}</span>` : ""}` +
    `<strong style="text-decoration:underline">Make it yours</strong></a><!--/nt:banner-->`
  );
}

const BANNER_STYLE = `<!--nt:banner-style--><style>body{padding-bottom:72px}</style><!--/nt:banner-style-->`;

/**
 * Apply status-dependent chrome to any well-formed page, authored or template. Idempotent:
 * previously injected blocks are stripped first, so republishing with different flags is a
 * plain string transform.
 */
export function finalizePage(html: string, flags: RenderFlags, ctx: { claimUrl: string }): string {
  let out = html.replace(NOINDEX_RE, "").replace(BANNER_RE, "").replace(BANNER_STYLE_RE, "");
  if (flags.noindex) {
    out = out.replace(/<\/head>/i, `<!--nt:noindex--><meta name="robots" content="noindex"><!--/nt:noindex--></head>`);
  }
  if (flags.preview) {
    out = out
      .replace(/<\/head>/i, `${BANNER_STYLE}</head>`)
      .replace(/<\/body>/i, `${banner(ctx.claimUrl, flags.previewDaysLeft)}</body>`);
  }
  return out;
}
