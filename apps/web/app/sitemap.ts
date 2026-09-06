import type { MetadataRoute } from "next";

import { LINKS, SITE_URL } from "@/components/marketing/links";

const PAGES: { path: string; priority: number }[] = [
  { path: LINKS.home, priority: 1 },
  { path: LINKS.business, priority: 0.9 },
  { path: LINKS.engineering, priority: 0.9 },
  { path: LINKS.work, priority: 0.8 },
  { path: LINKS.about, priority: 0.6 },
  { path: LINKS.contact, priority: 0.7 },
  { path: LINKS.storefront, priority: 0.7 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return PAGES.map((page) => ({ url: `${SITE_URL}${page.path}`, lastModified, priority: page.priority }));
}
