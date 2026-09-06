import { LINKS, SITE_URL } from "@/components/marketing/links";
import { POSTS } from "@/content/writing";

const escape = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** RSS for the writing section. Readers and crawlers both use it to find new posts. */
export function GET() {
  const items = POSTS.map(
    (post) => `    <item>
      <title>${escape(post.title)}</title>
      <link>${SITE_URL}${LINKS.writing}/${post.slug}</link>
      <guid isPermaLink="true">${SITE_URL}${LINKS.writing}/${post.slug}</guid>
      <pubDate>${new Date(post.published).toUTCString()}</pubDate>
      <category>${escape(post.topic)}</category>
      <description>${escape(post.description)}</description>
    </item>`,
  ).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Nazarii Tsubera — Writing</title>
    <link>${SITE_URL}${LINKS.writing}</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Notes on automation, applied AI and infrastructure, for business owners and engineers.</description>
    <language>en-us</language>
${items}
  </channel>
</rss>
`;
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
