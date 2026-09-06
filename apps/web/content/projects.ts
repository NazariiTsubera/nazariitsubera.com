export type Shot = {
  /** File in public/work. */
  file: string;
  alt: string;
  width: number;
  height: number;
  /** Shown under the image when an article places it with <Figure>. */
  caption: string;
};

export type Project = {
  slug: string;
  title: string;
  /** Who it was for. Groups the /work index. */
  tag: "Client" | "Global Virtual Opportunities" | "My own";
  summary: string;
  period: string;
  stack?: string;
  /** Shown on the landing page. */
  featured?: boolean;
  /** Screenshots. The first is the hero on the article and the card image everywhere else. */
  shots?: Shot[];
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
    shots: [
      {
        file: "marco-flores-cpa-1.png",
        alt: "Marco A. Flores, CPA home page",
        width: 3456,
        height: 1924,
        caption: "The home page: who it is for, in plain language, with the licences up front.",
      },
      {
        file: "marco-flores-cpa-2.png",
        alt: "Service page for small-business owners",
        width: 3456,
        height: 1924,
        caption: "A service page written for small-business owners rather than for other accountants.",
      },
      {
        file: "marco-flores-cpa-3.png",
        alt: "Client reviews page",
        width: 3456,
        height: 1924,
        caption: "Reviews reproduced from the firm’s Google Business Profile, unedited.",
      },
    ],
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
    shots: [
      {
        file: "markomax-1.png",
        alt: "MarkoMax calendar showing a week of scheduled posts across channels",
        width: 3456,
        height: 1826,
        caption: "A week on the calendar. Every card is a post scheduled for one of the connected channels.",
      },
      {
        file: "markomax-2.png",
        alt: "A MarkoMax campaign: a grid of generated posts",
        width: 3456,
        height: 1822,
        caption: "A campaign: posts generated from source media, ready for review before they go out.",
      },
    ],
    published: "2026-09-06",
  },
  {
    slug: "social-auto-reply",
    title: "Answering seventy thousand social messages a day",
    tag: "Global Virtual Opportunities",
    summary: "A public MCP server and an agent-based auto-reply system for Instagram, Facebook and LinkedIn comments and DMs.",
    period: "2025 — present",
    stack: "MCP · Mastra · LangGraph",
    shots: [
      {
        file: "social-auto-reply-1.png",
        alt: "Auto Reply configuration for a Facebook page",
        width: 3456,
        height: 1820,
        caption: "Per-page configuration: the public reply, the private message, an optional button, and the running count of replies sent.",
      },
    ],
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
    shots: [
      {
        file: "lovefund-1.png",
        alt: "LoveFund discover page listing hand-picked campaigns",
        width: 3456,
        height: 1924,
        caption: "Discover: every campaign here was chosen and published by the team.",
      },
      {
        file: "lovefund-2.png",
        alt: "A LoveFund campaign page",
        width: 3456,
        height: 1924,
        caption: "A campaign page: the story, the goal, and one clear way to give.",
      },
      {
        file: "lovefund-3.png",
        alt: "LoveFund donation checkout",
        width: 3456,
        height: 1924,
        caption: "Checkout: preset amounts, an optional tip, and the total shown before any details are asked for.",
      },
    ],
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
    shots: [
      {
        file: "sheetx-1.png",
        alt: "SheetX workspace overview",
        width: 3454,
        height: 1922,
        caption: "The workspace: every resource, its endpoint, and how many records it holds.",
      },
      {
        file: "sheetx-2.png",
        alt: "The API tab for a SheetX resource",
        width: 3456,
        height: 1922,
        caption: "Each resource is a REST endpoint. The API tab shows the calls and the query parameters it accepts.",
      },
      {
        file: "sheetx-3.png",
        alt: "A synced table of rows in SheetX",
        width: 3456,
        height: 1922,
        caption: "A resource’s data: rows the sheet and the API both edit, kept in step by reconciliation. Sample data.",
      },
    ],
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

export function findShot(file: string) {
  for (const project of PROJECTS) {
    const shot = project.shots?.find((s) => s.file === file);
    if (shot) return shot;
  }
  return undefined;
}
