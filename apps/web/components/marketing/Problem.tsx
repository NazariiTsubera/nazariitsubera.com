import { Band, Label } from "./Section";

export function Problem() {
  return (
    <Band>
      <div className="rv mx-auto max-w-[52ch] text-center">
        <Label className="mb-5 justify-center">The problem</Label>
        <h2 className="n text-[clamp(27px,3.4vw,40px)] leading-[1.12] tracking-[-0.024em]">
          You already know the work should be automatic.
        </h2>
      </div>
      <div className="rv mx-auto mt-[clamp(28px,3.5vw,44px)] grid max-w-[76ch] gap-5 sm:grid-cols-2">
        <p className="text-body">
          Every week there is a louder headline about what software and AI could be doing for your business. But you are
          busy actually running it, and the tools are a maze of jargon, half-finished apps, and consultants who talk over
          your head.
        </p>
        <p className="text-body">
          That is my job. I take the problems you already feel &mdash; the hours lost to admin, the work that should not
          need a person &mdash; and turn them into software that runs itself.
        </p>
      </div>
    </Band>
  );
}
