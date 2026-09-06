import { RevealRoot } from "@/components/marketing/Reveal";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";

/** The shell every marketing page shares. The console has its own. */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="skip">
        Skip to content
      </a>
      <SiteHeader />
      <RevealRoot>
        <div className="mx-auto max-w-frame px-gutter">
          <main id="main">{children}</main>
        </div>
        <SiteFooter />
      </RevealRoot>
    </>
  );
}
