// Reads the sitemap and checks every listed page for what search engines care about:
// a 200, exactly one <h1>, a unique <title>, a description, and a canonical link.
const base = (process.argv[2] ?? "http://www.localhost:3000").replace(/\/$/, "");
const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
const pages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
if (pages.length === 0) {
  console.log("FAIL /sitemap.xml lists no pages");
  process.exit(1);
}
const titles = new Set();
let failed = false;

for (const path of pages) {
  const res = await fetch(base + path);
  const problems = res.status === 200 ? [] : [`status ${res.status}`];
  const html = await res.text();
  const h1s = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1s !== 1) problems.push(`${h1s} h1 elements`);
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
  if (!title) problems.push("no title");
  else if (titles.has(title)) problems.push(`duplicate title "${title}"`);
  if (title) titles.add(title);
  if (!/rel="canonical"/.test(html)) problems.push("no canonical");
  const description = html.match(/name="description" content="([^"]*)"/)?.[1];
  if (!description) problems.push("no description");
  else if (description.length < 70 || description.length > 165) problems.push(`description ${description.length} chars`);
  if (title && title.length > 70) problems.push(`title ${title.length} chars`);
  if (!/property="og:url"/.test(html)) problems.push("no og:url");
  console.log(problems.length ? `FAIL ${path}: ${problems.join(", ")}` : `ok   ${path}`);
  failed ||= problems.length > 0;
}
for (const path of ["/robots.txt", "/opengraph-image", "/feed.xml", "/apple-icon"]) {
  const status = (await fetch(base + path)).status;
  console.log(status === 200 ? `ok   ${path}` : `FAIL ${path}: status ${status}`);
  failed ||= status !== 200;
}
process.exit(failed ? 1 : 0);
