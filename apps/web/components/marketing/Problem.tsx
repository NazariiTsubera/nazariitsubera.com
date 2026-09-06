import { Band, GRID, H2, Label } from "./Section";

export function Problem() {
  return (
    <Band className={GRID.even}>
      <div className="rv">
        <Label className="mb-5">The problem</Label>
        <H2 measure={16}>You already know the work should be automatic.</H2>
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
