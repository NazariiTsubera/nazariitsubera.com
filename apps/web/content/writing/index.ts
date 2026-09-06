import type { MDXContent } from "mdx/types";

type Body = () => Promise<{ default: MDXContent }>;

/** One MDX body per post slug in content/writing.ts. Add a file here when you add a post. */
export const WRITING: Record<string, Body> = {
  "what-to-automate-first": () => import("./what-to-automate-first.mdx"),
  "invoices-that-send-themselves": () => import("./invoices-that-send-themselves.mdx"),
  "where-ai-earns-its-keep": () => import("./where-ai-earns-its-keep.mdx"),
  "idempotent-jobs": () => import("./idempotent-jobs.mdx"),
  "testing-a-legacy-monolith": () => import("./testing-a-legacy-monolith.mdx"),
  "making-deployments-boring": () => import("./making-deployments-boring.mdx"),
};
