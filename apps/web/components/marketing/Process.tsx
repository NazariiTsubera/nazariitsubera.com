import { STEPS } from "@/content/services";

import { H2, Label, Section } from "./Section";

export function Process() {
  return (
    <Section>
      <Label className="rv mb-[22px]">How it works</Label>
      <H2 className="rv mb-[34px] max-w-[24ch]">Simple on your side. All the work on mine.</H2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-[clamp(20px,3vw,34px)]">
        {STEPS.map((step) => (
          <div key={step.n} className="rv border-t-2 border-accent pt-4">
            <div className="l mb-3 text-accent">{step.n}</div>
            <h3 className="n mb-2.5 text-[21px] leading-[1.2] tracking-[-0.02em]">{step.title}</h3>
            <p className="text-body">{step.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
