export type Service = {
  id: string;
  n: string;
  title: string;
  summary: string;
  detail: string;
  examples: string[];
  tags: string;
};

export const SERVICES: Service[] = [
  {
    id: "automation",
    n: "01",
    title: "Automate the jobs that repeat",
    summary:
      "Invoicing, scheduling, reminders, moving numbers between two places. It happens on time whether or not anyone remembers it.",
    detail:
      "Most small businesses run on a handful of routines that someone does by hand every day or every week: sending the invoices, chasing the late ones, filling the calendar, copying figures from one system into another. Each one is small. Together they eat the week. I connect the tools you already use so those routines run on their own, and tell you when something genuinely needs a person.",
    examples: [
      "Invoices generated and sent from your calendar or job list",
      "Payment reminders that escalate politely and stop the moment someone pays",
      "Appointment booking and confirmations by text",
      "A nightly report pulled from two systems into one sheet",
    ],
    tags: "Scheduled jobs · Integrations · Reporting",
  },
  {
    id: "tools",
    n: "02",
    title: "Build the tool you keep improvising",
    summary:
      "One clear place to see your jobs, customers or stock, built around how you already work rather than the other way round.",
    detail:
      "Somewhere in your business a spreadsheet, a group chat or a whiteboard is doing a job it was never meant to do. It works until two people edit it at once, or the one person who understands it takes a day off. I build the small, sturdy tool that replaces it: one place to see your jobs, customers or stock, shaped around how you already work.",
    examples: [
      "A job board your crew updates from their phones",
      "A client portal for documents, approvals and status",
      "A dashboard that shows today’s numbers without logging in to five systems",
      "Inventory that stays right when the shop and the website both sell",
    ],
    tags: "Internal tools · Dashboards · Client portals",
  },
  {
    id: "ai",
    n: "03",
    title: "Apply AI where it pays",
    summary:
      "Drafting replies, sorting enquiries, summarising long documents. Used where it genuinely helps, and left alone where it does not.",
    detail:
      "Language models are good at a narrow set of chores: drafting a reply from your past ones, sorting a full inbox into what matters, turning a long document into the three lines you need. They are bad at anything that has to be exactly right. I use them for the first kind, keep a person in the loop for the second, and say plainly when the honest answer is not to use them at all.",
    examples: [
      "Reply drafts for routine customer messages, sent only after you approve",
      "Triage that routes each enquiry to the right person with a one-line summary",
      "Summaries of contracts, reviews or call recordings",
      "Product descriptions and captions written from your photos and notes",
    ],
    tags: "Reply drafting · Triage · Summarisation",
  },
];

export const STEPS = [
  {
    n: "01",
    title: "We talk",
    body: "You tell me where the friction is. No technical vocabulary required, just how the work actually feels.",
  },
  {
    n: "02",
    title: "I build",
    body: "I design, build and run the solution end to end. You approve the direction; I handle the rest.",
  },
  {
    n: "03",
    title: "You run lighter",
    body: "The work happens in the background. You stay focused on the parts only you can do.",
  },
];
