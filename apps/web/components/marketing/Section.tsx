import type { ReactNode } from "react";

/** Every section, band and page opening shares one vertical rhythm. */
const PAD = "py-section";
const RULE = "border-t border-ink/[.14]";

/**
 * The layouts the marketing pages are built from. Sections pick one of these instead of writing
 * their own tracks, so a two-column section always breaks at the same width as every other.
 */
export const GRID = {
  /** A narrow label column beside the wide content column. The site's default two-up. */
  side: "grid grid-cols-1 items-start gap-[clamp(28px,4vw,52px)] wide:grid-cols-[minmax(240px,1fr)_minmax(0,1.9fr)]",
  /** Two columns of equal weight. */
  even: "grid grid-cols-1 items-start gap-[clamp(28px,4vw,52px)] wide:grid-cols-2",
  /** Two cards. */
  cards2: "grid grid-cols-1 gap-[clamp(18px,2.5vw,26px)] sm:grid-cols-2",
  /** Three cards, or three figures. */
  cards3: "grid grid-cols-1 gap-[clamp(22px,3vw,34px)] sm:grid-cols-3",
} as const;

export function Section({ id, className = "", children }: { id?: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} className={`${RULE} ${PAD} ${className}`}>
      {children}
    </section>
  );
}

/** Full-bleed band inside the centred column. The layout root clips the overflow. */
export function Band({
  tone = "light",
  className = "",
  children,
}: {
  tone?: "light" | "dark";
  className?: string;
  children: ReactNode;
}) {
  const fill =
    tone === "dark"
      ? "bg-ink text-on-dark shadow-[0_0_0_100vmax_var(--ink-bg)]"
      : "bg-band shadow-[0_0_0_100vmax_var(--band-bg)]";
  return <section className={`band py-band ${fill} ${className}`}>{children}</section>;
}

/**
 * A section's eyebrow. The accent rule in front of it is the one non-text mark most sections
 * had, and it gives each opening a spot of colour instead of another line of grey type.
 */
export function Label({
  mark = true,
  className = "",
  children,
}: {
  mark?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`l text-muted ${mark ? "flex items-center gap-2.5" : ""} ${className}`}>
      {mark ? <span aria-hidden className="h-px w-6 flex-none bg-accent" /> : null}
      {children}
    </div>
  );
}

/** A section opening that sits in the middle of the column rather than against its left edge. */
export function CenteredHead({ label, title, children }: { label: string; title: ReactNode; children?: ReactNode }) {
  return (
    <div className="rv mx-auto mb-[clamp(32px,4vw,48px)] max-w-[46ch] text-center">
      <Label className="mb-5 justify-center">{label}</Label>
      <H2 measure={26} className="mx-auto">
        {title}
      </H2>
      {children ? <p className="mt-4 text-body">{children}</p> : null}
    </div>
  );
}

/**
 * `measure` is the width the heading is allowed to wrap inside, in characters. It only applies
 * once the column is wide enough to make a short measure read as deliberate; on a phone the
 * heading uses the full width instead of wrapping into a ribbon beside empty space.
 */
export function H2({
  id,
  measure,
  className = "",
  children,
}: {
  id?: string;
  measure?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <h2
      id={id}
      className={`n text-[clamp(25px,2.8vw,33px)] leading-[1.15] tracking-[-0.022em] ${measure ? "measure" : ""} ${className}`}
      style={measure ? ({ "--measure": `${measure}ch` } as React.CSSProperties) : undefined}
    >
      {children}
    </h2>
  );
}

/** The page's one h1, sized and measured the same way on every page. */
export function H1({ measure = 20, className = "", children }: { measure?: number; className?: string; children: ReactNode }) {
  return (
    <h1
      className={`n measure text-[clamp(32px,4.8vw,54px)] leading-[1.06] tracking-[-0.026em] ${className}`}
      style={{ "--measure": `${measure}ch` } as React.CSSProperties}
    >
      {children}
    </h1>
  );
}

/** The opening block of every page: label, the page's one h1, a lead paragraph, actions. */
export function PageIntro({
  label,
  title,
  measure,
  children,
  actions,
}: {
  label: string;
  title: ReactNode;
  measure?: number;
  children?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className={`rv ${RULE} pb-page-bottom pt-page-top`}>
      <Label className="mb-5">{label}</Label>
      <H1 measure={measure} className="mb-6">
        {title}
      </H1>
      {children ? <div className="max-w-[58ch] space-y-4 text-lg leading-[1.65] text-body">{children}</div> : null}
      {actions ? <div className="actions mt-8">{actions}</div> : null}
    </header>
  );
}
