import type { Metadata } from "next";

import { prisma } from "@nazariitsubera/core/db";
import { env } from "@nazariitsubera/core/env";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Websites for market vendors — Nazarii Tsubera",
  description:
    "A real website for your booth, built the same day, on your own domain. $299 to set up, $59 a month, cancel any time.",
};

const INCLUDED = [
  "Your own domain, set up for you",
  "Photos of your products, cut out and lit to match",
  "A phone number people can tap to call or text",
  "Links to wherever you already take orders",
  "Google Business Profile set up",
  "Text me any change and I make it",
];

const STEPS = [
  { n: "01", title: "We talk for ten minutes", body: "At your booth. I record it so I get your words right, and take photos of your work." },
  { n: "02", title: "You get a link", body: "Usually before you have packed up. A real site on a real address, not a mockup." },
  { n: "03", title: "You decide", body: "Keep it and it moves to your own domain. Walk away and it costs you nothing." },
];

export default async function StorefrontPage() {
  const rootDomain = env().SITE_ROOT_DOMAIN;
  const portfolio = await prisma.vendor.findMany({
    where: { showInPortfolio: true, status: "won", publishedVersionId: { not: null } },
    orderBy: { createdAt: "desc" },
    take: 12,
    include: { market: true },
  });

  return (
    <main className="mx-auto flex max-w-frame flex-col gap-16 px-6 py-16">
      <header className="flex flex-col gap-4">
        <p className="font-mono text-xs uppercase tracking-[0.08em] text-eyebrow">For market vendors</p>
        <h1 className="max-w-3xl font-serif text-4xl leading-[1.1] sm:text-5xl">
          A real website for your booth, live the same day.
        </h1>
        <p className="max-w-2xl text-lg text-body">
          People ask if you have a website. Now you do. I come to your booth, we talk for ten
          minutes, and you get a link before you pack up.
        </p>
      </header>

      <section className="flex flex-col gap-4 rounded-2xl bg-ink px-6 py-8 text-on-dark sm:px-10">
        <p className="font-serif text-3xl">$299 to set up, then $59 a month.</p>
        <p className="max-w-2xl text-on-dark/80">
          Less than one weekend&rsquo;s booth fee. Cancel any time and the site comes down. Texas
          sales tax is added at checkout.
        </p>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          {INCLUDED.map((item) => (
            <li key={item} className="text-on-dark/90">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="font-serif text-2xl">How it works</h2>
        <ol className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.n} className="flex flex-col gap-2">
              <span className="font-mono text-xs text-mono">{step.n}</span>
              <h3 className="font-serif text-xl">{step.title}</h3>
              <p className="text-body-2">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {portfolio.length > 0 ? (
        <section className="flex flex-col gap-6">
          <h2 className="font-serif text-2xl">Vendors I have built for</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {portfolio.map((vendor) => (
              <li key={vendor.id}>
                <a
                  href={`https://${vendor.slug}.${rootDomain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col gap-1 rounded-xl border border-ink/15 p-4 hover:border-ink/40"
                >
                  <span className="font-serif text-lg">{vendor.businessName}</span>
                  {vendor.market ? <span className="text-sm text-mono">{vendor.market.name}</span> : null}
                  <span className="text-xs text-faint">
                    {vendor.slug}.{rootDomain}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-2xl">Find me at the market</h2>
        <p className="max-w-2xl text-body">
          I work San Antonio markets on weekends. If you would rather not wait, text me and I will
          come to you.
        </p>
        <a href={`tel:${env().OPERATOR_PHONE}`} className="w-fit rounded-lg bg-ink px-5 py-3 font-medium text-on-dark">
          Call or text {env().OPERATOR_NAME}
        </a>
      </section>
    </main>
  );
}
