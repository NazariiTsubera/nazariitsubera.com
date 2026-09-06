import { formatPhone } from "../template/format";

const STYLE =
  "*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f1eee6;color:#17161c;" +
  "font:17px/1.55 system-ui,-apple-system,sans-serif}main{max-width:32rem;padding:2rem}h1{font-size:2rem;line-height:1.1;margin:0 0 1rem}" +
  "p{margin:0 0 1rem;color:#403c35}a{color:#17161c}" +
  ".btn{display:inline-block;background:#17161c;color:#f4f2ee;padding:.85rem 1.25rem;border-radius:12px;text-decoration:none;font-weight:600}";

function page(title: string, body: string): string {
  return (
    `<!doctype html>\n<html lang="en"><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width, initial-scale=1">` +
    `<meta name="robots" content="noindex"><title>${title}</title><style>${STYLE}</style></head>` +
    `<body><main>${body}</main></body></html>`
  );
}

export function notFoundPage(): string {
  return page("Not found", "<h1>Nothing here yet.</h1><p>There is no site at this address.</p>");
}

export function expiredPage(ctx: { operatorName: string; operatorPhone: string; claimUrl: string }): string {
  return page(
    "This preview has ended",
    `<h1>This preview has ended.</h1>` +
      `<p>Text ${ctx.operatorName} at <a href="tel:${ctx.operatorPhone}">${formatPhone(ctx.operatorPhone)}</a> ` +
      `to bring it back, or claim it now.</p>` +
      `<p><a class="btn" href="${ctx.claimUrl}">Make it yours</a></p>`,
  );
}
