import { STEPS } from "@/content/services";

import { STEP_ICONS } from "./Icons";
import { CenteredHead, GRID, Section } from "./Section";

export function Process() {
  return (
    <Section>
      <CenteredHead label="How it works" title="Simple on your side. All the work on mine." />
      <div className={GRID.cards3}>
        {STEPS.map((step) => (
          <div key={step.n} className="rv flex flex-col items-center px-2 text-center">
            <span className="chip mb-5">{STEP_ICONS[step.n]}</span>
            <div className="l mb-2.5 text-accent">{step.n}</div>
            <h3 className="n mb-2.5 text-[22px] leading-[1.2] tracking-[-0.02em]">{step.title}</h3>
            <p className="max-w-[34ch] text-body">{step.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
