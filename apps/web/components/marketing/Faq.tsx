import { FAQ } from "@/content/faq";

import { GRID, H2, Label, Section } from "./Section";

export function Faq() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <Section id="faq" className={GRID.side}>
      <div className="rv">
        <Label className="mb-5">Questions</Label>
        <H2 measure={14}>The things people ask first.</H2>
      </div>
      <div className="rv min-w-0 border-t border-ink/[.16]">
        {FAQ.map((item) => (
          <details key={item.q} className="group border-b border-ink/[.16]">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-5 py-5 [&::-webkit-details-marker]:hidden">
              <span className="n text-[19px] leading-[1.3] tracking-[-0.02em] sm:text-[21px] sm:leading-[1.25]">{item.q}</span>
              {/* One glyph that turns from a plus into a cross, rather than two labels swapping. */}
              <span
                aria-hidden
                className="relative mt-1.5 block size-[18px] flex-none text-accent transition-transform duration-300 ease-soft group-open:rotate-45 group-open:text-muted"
              >
                <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
                <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current" />
              </span>
            </summary>
            <p className="max-w-[60ch] pb-6 text-body">{item.a}</p>
          </details>
        ))}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </Section>
  );
}
