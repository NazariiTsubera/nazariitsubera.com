import type { MetadataRoute } from "next";

import { LINKS, SITE_URL } from "@/components/marketing/links";
import { PROJECTS } from "@/content/projects";
import { POSTS } from "@/content/writing";

const PAGES: { path: string; priority: number }[] = [
  { path: LINKS.home, priority: 1 },
  { path: LINKS.business, priority: 0.9 },
  { path: LINKS.engineering, priority: 0.9 },
  { path: LINKS.work, priority: 0.8 },
  { path: LINKS.writing, priority: 0.8 },
  { path: LINKS.about, priority: 0.6 },
  { path: LINKS.contact, priority: 0.7 },
  { path: LINKS.storefront, priority: 0.7 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    ...PAGES.map((page) => ({ url: `${SITE_URL}${page.path}`, lastModified, priority: page.priority })),
    ...PROJECTS.map((project) => ({
      url: `${SITE_URL}${LINKS.work}/${project.slug}`,
      lastModified: new Date(project.published),
      priority: 0.6,
    })),
    ...POSTS.map((post) => ({
      url: `${SITE_URL}${LINKS.writing}/${post.slug}`,
      lastModified: new Date(post.published),
      priority: 0.7,
    })),
  ];
}
