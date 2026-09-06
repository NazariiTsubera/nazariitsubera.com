// Fetches every marketing page and checks the things search engines care about:
// a 200, exactly one <h1>, a unique <title>, and a canonical link.
const base = (process.argv[2] ?? "http://www.localhost:3000").replace(/\/$/, "");
const pages = ["/", "/business", "/engineering", "/work", "/about", "/contact", "/storefront"];
const files = ["/sitemap.xml", "/robots.txt", "/opengraph-image"];
const titles = new Set();
let failed = false;

for (const path of [...pages, ...files]) {
  const res = await fetch(base + path);
  const problems = res.status === 200 ? [] : [`status ${res.status}`];
  if (pages.includes(path)) {
    const html = await res.text();
    const h1s = (html.match(/<h1[\s>]/g) ?? []).length;
    if (h1s !== 1) problems.push(`${h1s} h1 elements`);
    const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
    if (!title) problems.push("no title");
    else if (titles.has(title)) problems.push(`duplicate title "${title}"`);
    if (title) titles.add(title);
    if (!/rel="canonical"/.test(html)) problems.push("no canonical");
    if (!/name="description"/.test(html)) problems.push("no description");
  }
  console.log(problems.length ? `FAIL ${path}: ${problems.join(", ")}` : `ok   ${path}`);
  failed ||= problems.length > 0;
}
process.exit(failed ? 1 : 0);
