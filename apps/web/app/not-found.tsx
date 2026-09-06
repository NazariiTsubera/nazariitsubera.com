import type { Metadata } from "next";
import Link from "next/link";

import { RevealRoot } from "@/components/marketing/Reveal";
import { H1, Label } from "@/components/marketing/Section";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { LINKS } from "@/components/marketing/links";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: true } };

/** The 404 wears the marketing shell, so a dead link still lands somewhere that looks like the site. */
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <RevealRoot>
        <div className="mx-auto max-w-frame px-gutter">
          <main id="main">
            <section className="border-t border-ink/[.14] pb-page-bottom pt-page-top">
              <Label className="mb-5">404</Label>
              <H1 measure={18} className="mb-6">
                There is nothing at this address.
              </H1>
              <p className="max-w-[52ch] text-[19px] leading-[1.6] text-body">
                The page may have moved, or the link had a typo in it. Everything on the site is one step from here.
              </p>
              <div className="actions mt-8">
                <Link href={LINKS.home} className="cta">
                  Back to the start <span className="arw">&rarr;</span>
                </Link>
                <Link href={LINKS.work} className="cta-ghost">
                  See the work
                </Link>
              </div>
            </section>
          </main>
        </div>
        <SiteFooter />
      </RevealRoot>
    </>
  );
}
