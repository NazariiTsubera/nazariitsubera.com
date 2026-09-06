export type Project = {
  slug: string;
  file: string;
  alt: string;
  title: string;
  tag: string;
  summary: string;
  detail: string;
  under?: string[];
  href?: string;
};

/** Screenshots are 3230x1626 and live in public/work/. */
export const PROJECTS: Project[] = [
  {
    slug: "marco-flores-cpa",
    file: "work-marcoflores.png",
    alt: "Marco A. Flores, CPA website homepage",
    title: "Marco A. Flores, CPA",
    tag: "Client",
    summary:
      "A website and secure client portal for a San Antonio CPA, built so his clients can find him and send documents without a phone call.",
    detail:
      "Marco needed two things: to be found by people looking for an accountant in San Antonio, and a safe way for clients to hand over documents without an email thread or a trip to the office. The site does the first. The portal does the second, keeping client files behind a login instead of in an inbox.",
    href: "https://www.marcoflores.cpa/",
  },
  {
    slug: "markomax",
    file: "work-markomax.png",
    alt: "MarkoMax publishing calendar",
    title: "MarkoMax",
    tag: "Global Virtual Opportunities",
    summary:
      "A scheduling and publishing platform serving two thousand people at once, producing around ten thousand posts a day.",
    detail:
      "MarkoMax started as a basic post composer. I re-architected it into a social-media orchestration platform that serves more than two thousand users and produces around ten thousand posts a day, running on a three-node Docker Swarm backed by PostgreSQL, Redis and Ceph.",
    under: [
      "Asynchronous media-processing and generation pipelines with live status streamed over SSE",
      "Idempotent job handling with heartbeat and stale-job detection, so work recovers on its own after a worker fails",
      "Per-post AI generation cost cut by chunking source video and caching fragments by cosine similarity over vector embeddings",
      "A public MCP server and an auto-reply system handling more than seventy thousand social messages a day",
    ],
  },
  {
    slug: "sheetx",
    file: "work-sheetx.png",
    alt: "SheetX project data view",
    title: "SheetX",
    tag: "My own product",
    summary:
      "Turns a spreadsheet into a real API, and keeps both sides in step when people and software edit at the same time.",
    detail:
      "SheetX makes a Google Sheet behave like a database with an API, while the people who live in the spreadsheet keep editing it as before. The hard part is both sides changing the same rows at the same time without either one silently losing work.",
    under: [
      "A bidirectional sync engine for concurrent human and API edits",
      "Stable row identity and diff3 reconciliation, so conflicting edits merge instead of overwriting",
      "A durable, eventually consistent write pipeline: bursts are debounced and coalesced into batched Google API jobs",
      "Quota-limited jobs re-enqueue until reconciliation completes",
    ],
    href: "https://sheetx.co/",
  },
  {
    slug: "lovefund",
    file: "work-lovefund.png",
    alt: "LoveFund campaign discovery page",
    title: "LoveFund",
    tag: "Global Virtual Opportunities",
    summary: "A donation platform where every campaign is reviewed and published by hand before it goes live.",
    detail:
      "LoveFund is a donation platform where a person reviews every campaign before it is published. The platform is built around that review step rather than around self-service, so trust is part of the workflow instead of something added afterwards.",
  },
];
