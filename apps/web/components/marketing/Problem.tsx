import { Band, H2, Label } from "./Section";

export function Problem() {
  return (
    <Band className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] items-start gap-[clamp(24px,4vw,52px)]">
      <div className="rv">
        <Label className="mb-5">The problem</Label>
        <H2 className="max-w-[16ch]">You already know the work should be automatic.</H2>
      </div>
      <div className="rv space-y-4">
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
