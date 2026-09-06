import type { MDXContent } from "mdx/types";

type Article = () => Promise<{ default: MDXContent }>;

/** One MDX article per project slug in content/projects.ts. Add a file here when you add a project. */
export const ARTICLES: Record<string, Article> = {
  "marco-flores-cpa": () => import("./marco-flores-cpa.mdx"),
  markomax: () => import("./markomax.mdx"),
  "social-auto-reply": () => import("./social-auto-reply.mdx"),
  "payments-monolith": () => import("./payments-monolith.mdx"),
  infrastructure: () => import("./infrastructure.mdx"),
  "sms-dunning": () => import("./sms-dunning.mdx"),
  lovefund: () => import("./lovefund.mdx"),
  sheetx: () => import("./sheetx.mdx"),
  "booth-to-mrr": () => import("./booth-to-mrr.mdx"),
  openrenderer: () => import("./openrenderer.mdx"),
  "circuit-x": () => import("./circuit-x.mdx"),
};
