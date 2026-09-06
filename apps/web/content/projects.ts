export type Project = {
  slug: string;
  title: string;
  /** Who it was for. Groups the /work index. */
  tag: "Client" | "Global Virtual Opportunities" | "My own";
  summary: string;
  period: string;
  stack?: string;
  /** Shown on the landing page. Featured projects have a screenshot. */
  featured?: boolean;
  /** Screenshot in public/work, 3230x1626. */
  file?: string;
  alt?: string;
  /** Live site or repository. */
  href?: string;
  /** Date the article went up, ISO. */
  published: string;
};

/** Each project has an article at content/work/<slug>.mdx. */
export const PROJECTS: Project[] = [
  {
    slug: "marco-flores-cpa",
    title: "Marco A. Flores, CPA",
    tag: "Client",
    summary:
      "A website and secure client portal for a San Antonio CPA, built so his clients can find him and send documents without a phone call.",
    period: "2025",
    featured: true,
    file: "work-marcoflores.png",
    alt: "Marco A. Flores, CPA website homepage",
    href: "https://www.marcoflores.cpa/",
    published: "2026-09-06",
  },
  {
    slug: "markomax",
    title: "MarkoMax: from a post composer to ten thousand posts a day",
    tag: "Global Virtual Opportunities",
    summary:
      "Re-architecting a basic composer into a social-media orchestration platform serving more than two thousand users.",
    period: "2025 — present",
    stack: "Docker Swarm · PostgreSQL · Redis · Ceph · SSE",
    featured: true,
    file: "work-markomax.png",
    alt: "MarkoMax publishing calendar",
    published: "2026-09-06",
  },
  {
    slug: "social-auto-reply",
    title: "Answering seventy thousand social messages a day",
    tag: "Global Virtual Opportunities",
    summary: "A public MCP server and an agent-based auto-reply system for Instagram, Facebook and LinkedIn comments and DMs.",
    period: "2025 — present",
    stack: "MCP · Mastra · LangGraph",
    published: "2026-09-06",
  },
  {
    slug: "payments-monolith",
    title: "Testing and migrating a legacy payments monolith",
    tag: "Global Virtual Opportunities",
    summary:
      "Integration tests against real dependencies, four parallel CI forks, and a PHP 7.4 to 8.4 migration with no big-bang release.",
    period: "2025 — present",
    stack: "PHP 7.4 → 8.4 · Vitest · Testcontainers · Kubernetes",
    published: "2026-09-06",
  },
  {
    slug: "infrastructure",
    title: "Modernising a hundred and forty Linux servers",
    tag: "Global Virtual Opportunities",
    summary: "Ansible as the source of truth, playbooks run from CI, state moved into Ceph, and one place to look when something breaks.",
    period: "2025 — present",
    stack: "Ansible · GitLab CI · Ceph · OpenObserve",
    published: "2026-09-06",
  },
  {
    slug: "sms-dunning",
    title: "The SMS sequence that halved failed payments",
    tag: "Global Virtual Opportunities",
    summary: "Four messages, escalating with the risk of losing the account, that took failed payments from 10.7% to 5.2% for a 15,000-user CRM.",
    period: "2025",
    stack: "Affiliate CRM · SMS · Magic links",
    published: "2026-09-06",
  },
  {
    slug: "lovefund",
    title: "LoveFund",
    tag: "Global Virtual Opportunities",
    summary: "A donation platform where every campaign is reviewed and published by hand before it goes live.",
    period: "2025 — present",
    featured: true,
    file: "work-lovefund.png",
    alt: "LoveFund campaign discovery page",
    published: "2026-09-06",
  },
  {
    slug: "sheetx",
    title: "SheetX: a spreadsheet that behaves like a database",
    tag: "My own",
    summary: "Turns a Google Sheet into a real API, and keeps both sides in step when people and software edit at the same time.",
    period: "2025 — present",
    stack: "Google Sheets API · diff3 reconciliation",
    featured: true,
    file: "work-sheetx.png",
    alt: "SheetX project data view",
    href: "https://sheetx.co/",
    published: "2026-09-06",
  },
  {
    slug: "booth-to-mrr",
    title: "A website for a market vendor in twenty minutes",
    tag: "My own",
    summary:
      "An operator console and pipeline that turn a recorded booth conversation and a few photos into a live, static site on a subdomain.",
    period: "2026 — building now",
    stack: "Next.js · BullMQ · Playwright · Claude",
    href: "/storefront",
    published: "2026-09-06",
  },
  {
    slug: "openrenderer",
    title: "OpenRenderer",
    tag: "My own",
    summary: "A modular rendering engine in C++ and OpenGL with configurable render passes and experimental ray-marching shaders.",
    period: "Side project",
    stack: "C++ · OpenGL · CMake · GLSL",
    href: "https://github.com/NazariiTsubera/OpenRenderer",
    published: "2026-09-06",
  },
  {
    slug: "circuit-x",
    title: "Circuit X",
    tag: "My own",
    summary: "A real-time circuit simulator that turns drawn schematics into solvable node trees.",
    period: "Side project",
    stack: "C++ · SFML · ImGui · Eigen",
    href: "https://github.com/NazariiTsubera/circuitx",
    published: "2026-09-06",
  },
];

export const TAG_ORDER: Project["tag"][] = ["Client", "Global Virtual Opportunities", "My own"];

export function findProject(slug: string) {
  return PROJECTS.find((project) => project.slug === slug);
}
