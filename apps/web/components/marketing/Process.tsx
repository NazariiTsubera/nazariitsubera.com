import { STEPS } from "@/content/services";

import { GRID, H2, Label, Section } from "./Section";

export function Process() {
  return (
    <Section>
      <Label className="rv mb-5">How it works</Label>
      <H2 measure={24} className="rv mb-[34px]">
        Simple on your side. All the work on mine.
      </H2>
      <div className={GRID.cards3}>
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
