export type Post = {
  slug: string;
  title: string;
  /** Shorter title for the browser tab, search snippet and social card when the display title runs long. */
  metaTitle?: string;
  /** The search snippet. 120 to 160 characters. */
  description: string;
  topic: "Automation" | "Applied AI" | "Engineering";
  /** ISO date. */
  published: string;
  /** Slugs of work articles this piece draws on. */
  related?: string[];
};

/** Each post has a body at content/writing/<slug>.mdx. Newest first. */
export const POSTS: Post[] = [
  {
    slug: "what-to-automate-first",
    title: "What to automate first in a small business",
    description:
      "A plain-language way to pick the first thing to automate in a small business: the work that repeats, costs real hours, and never needs judgement. With examples.",
    topic: "Automation",
    published: "2026-09-06",
    related: ["marco-flores-cpa"],
  },
  {
    slug: "invoices-that-send-themselves",
    title: "Invoices that send themselves",
    metaTitle: "Automated invoicing for a small business",
    description:
      "How automated invoicing works for a small business: where the invoice comes from, when it goes out, how reminders escalate and stop, and what still needs a person.",
    topic: "Automation",
    published: "2026-09-06",
    related: ["sms-dunning"],
  },
  {
    slug: "where-ai-earns-its-keep",
    title: "Where AI earns its keep in a small business, and where it does not",
    metaTitle: "Where AI earns its keep in a small business",
    description:
      "A plain-language test for whether a task is a good fit for AI in a small business. Drafting, sorting and summarising, yes. Anything that has to be exactly right, no.",
    topic: "Applied AI",
    published: "2026-09-06",
    related: ["social-auto-reply"],
  },
  {
    slug: "idempotent-jobs",
    title: "Idempotent jobs: the difference between a retry you trust and one you fear",
    metaTitle: "Idempotent jobs and retries you can trust",
    description:
      "How to make background jobs safe to retry: idempotency keys, at-least-once delivery, heartbeats and stale-job recovery. Learned running ten thousand posts a day.",
    topic: "Engineering",
    published: "2026-09-06",
    related: ["markomax"],
  },
  {
    slug: "testing-a-legacy-monolith",
    title: "Testing a legacy monolith with real dependencies, and keeping it fast",
    metaTitle: "Integration-testing a legacy monolith, fast",
    description:
      "Characterisation tests, Testcontainers, tmpfs-backed databases and parallel CI forks: how to put a safety net under a codebase nobody fully remembers.",
    topic: "Engineering",
    published: "2026-09-06",
    related: ["payments-monolith"],
  },
  {
    slug: "making-deployments-boring",
    title: "Making deployments boring: Ansible from CI across a hundred and forty servers",
    metaTitle: "Making deployments boring with Ansible from CI",
    description:
      "How configuration as code, playbooks run from CI, state moved off the machines and one logging system turned 140 hand-built Linux servers into replaceable ones.",
    topic: "Engineering",
    published: "2026-09-06",
    related: ["infrastructure"],
  },
];

export const TOPIC_ORDER: Post["topic"][] = ["Automation", "Applied AI", "Engineering"];

export function findPost(slug: string) {
  return POSTS.find((post) => post.slug === slug);
}
