import type { MetadataRoute } from "next";

import { SITE_URL } from "@/components/marketing/links";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/console", "/api/", "/media/uploads/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
