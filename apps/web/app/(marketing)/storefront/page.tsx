import type { Metadata } from "next";

import { prisma } from "@nazariitsubera/core/db";
import { env } from "@nazariitsubera/core/env";

import { Band, GRID, H2, Label, PageIntro, Section } from "@/components/marketing/Section";
import { LINKS } from "@/components/marketing/links";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Websites for market vendors",
  description:
    "A real website for your booth, built the same day, on your own domain. $299 to set up, $59 a month, cancel any time. San Antonio markets.",
  alternates: { canonical: LINKS.storefront },
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
  const { SITE_ROOT_DOMAIN: rootDomain, OPERATOR_PHONE, OPERATOR_NAME } = env();
  const portfolio = await prisma.vendor.findMany({
    where: { showInPortfolio: true, status: "won", publishedVersionId: { not: null } },
    orderBy: { createdAt: "desc" },
    take: 12,
    include: { market: true },
  });

  return (
    <>
      <PageIntro
        label="For market vendors"
        title="A real website for your booth, live the same day."
        actions={
          <a href={`tel:${OPERATOR_PHONE}`} className="cta">
            Call or text {OPERATOR_NAME} <span className="arw">&rarr;</span>
          </a>
        }
      >
        <p>
          People ask if you have a website. Now you do. I come to your booth, we talk for ten minutes, and you get a link
          before you pack up.
        </p>
      </PageIntro>

      <Band tone="dark" className={GRID.even}>
        <div className="rv">
          <div className="l mb-5 text-dark-label">The price</div>
          <p className="n text-[clamp(28px,4vw,44px)] leading-[1.06] tracking-[-0.026em]">$299 to set up, then $59 a month.</p>
          <p className="mt-5 max-w-[40ch] text-dark-muted">
            Less than one weekend&rsquo;s booth fee. Cancel any time and the site comes down. Texas sales tax is added at
            checkout.
          </p>
        </div>
        <ul className="rv">
          {INCLUDED.map((item) => (
            <li key={item} className="border-t border-white/[.16] py-3 text-dark-muted">
              {item}
            </li>
          ))}
        </ul>
      </Band>

      <Section>
        <Label className="rv mb-5">How it works</Label>
        <H2 measure={24} className="rv mb-[34px]">
          Ten minutes at your booth.
        </H2>
        <ol className={GRID.cards3}>
          {STEPS.map((step) => (
            <li key={step.n} className="rv border-t-2 border-accent pt-4">
              <div className="l mb-3 text-accent">{step.n}</div>
              <h3 className="n mb-2.5 text-[21px] leading-[1.2] tracking-[-0.02em]">{step.title}</h3>
              <p className="text-body">{step.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      {portfolio.length > 0 ? (
        <Section>
          <H2 className="rv mb-7">Vendors I have built for</H2>
          <ul className={GRID.cards2}>
            {portfolio.map((vendor) => (
              <li key={vendor.id} className="rv">
                <a
                  href={`https://${vendor.slug}.${rootDomain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="path flex flex-col gap-1.5 border border-ink/[.18] px-[clamp(20px,5vw,26px)] py-6"
                >
                  <span className="n text-[21px] tracking-[-0.02em]">{vendor.businessName}</span>
                  {vendor.market ? <span className="text-body">{vendor.market.name}</span> : null}
                  <span className="font-mono text-[13px] text-muted">
                    {vendor.slug}.{rootDomain}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Band className={`${GRID.even} wide:items-end`}>
        <div className="rv">
          <Label className="mb-5">Find me at the market</Label>
          <h2 className="n measure mb-5 text-[clamp(28px,4vw,44px)] leading-[1.06] tracking-[-0.026em] [--measure:16ch]">
            I work San Antonio markets on weekends.
          </h2>
          <p className="max-w-[44ch] text-body">If you would rather not wait, text me and I will come to you.</p>
        </div>
        <div className="rv flex flex-col gap-3.5">
          <div className="actions">
            <a href={`tel:${OPERATOR_PHONE}`} className="cta">
              Call or text {OPERATOR_NAME} <span className="arw">&rarr;</span>
            </a>
          </div>
          <span className="l text-muted">{OPERATOR_PHONE}</span>
        </div>
      </Band>
    </>
  );
}
