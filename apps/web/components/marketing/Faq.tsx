import { FAQ } from "@/content/faq";

import { H2, Label, Section } from "./Section";

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
    <Section id="faq" className="grid grid-cols-1 items-start gap-[clamp(24px,4vw,52px)] min-[860px]:grid-cols-[minmax(240px,1fr)_minmax(0,1.9fr)]">
      <div className="rv">
        <Label className="mb-5">Questions</Label>
        <H2 className="max-w-[14ch]">The things people ask first.</H2>
      </div>
      <div className="rv min-w-0 border-t border-ink/[.16]">
        {FAQ.map((item) => (
          <details key={item.q} className="group border-b border-ink/[.16]">
            <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
              <span className="n text-[21px] leading-[1.25] tracking-[-0.02em]">{item.q}</span>
              <span className="l flex-none text-accent group-open:hidden">Open</span>
              <span className="l hidden flex-none text-muted group-open:inline">Close</span>
            </summary>
            <p className="max-w-[60ch] pb-6 text-body">{item.a}</p>
          </details>
        ))}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </Section>
  );
}
