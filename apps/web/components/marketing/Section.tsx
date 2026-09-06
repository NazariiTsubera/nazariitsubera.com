import type { ReactNode } from "react";

const PAD = "py-[clamp(34px,4.5vw,56px)]";

export function Section({ id, className = "", children }: { id?: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} className={`scroll-mt-6 border-t border-ink/[.14] ${PAD} ${className}`}>
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
    tone === "dark" ? "bg-ink text-on-dark shadow-[0_0_0_100vmax_#171a1a]" : "bg-band shadow-[0_0_0_100vmax_#eaece9]";
  return <section className={`band ${PAD} ${fill} ${className}`}>{children}</section>;
}

export function Label({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`l text-muted ${className}`}>{children}</div>;
}

export function H2({ id, className = "", children }: { id?: string; className?: string; children: ReactNode }) {
  return (
    <h2 id={id} className={`n scroll-mt-6 text-[clamp(24px,2.8vw,33px)] leading-[1.15] tracking-[-0.022em] ${className}`}>
      {children}
    </h2>
  );
}

/** The opening block of every inner page: label, the page's one h1, a lead paragraph, actions. */
export function PageIntro({
  label,
  title,
  children,
  actions,
}: {
  label: string;
  title: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="rv border-t border-ink/[.14] pb-[clamp(36px,5vw,60px)] pt-[clamp(40px,6vw,74px)]">
      <Label className="mb-6">{label}</Label>
      <h1 className="n mb-6 max-w-[20ch] text-[clamp(32px,4.8vw,54px)] leading-[1.05] tracking-[-0.026em]">{title}</h1>
      {children ? <div className="max-w-[58ch] space-y-4 text-lg leading-[1.65] text-body">{children}</div> : null}
      {actions ? <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3.5">{actions}</div> : null}
    </header>
  );
}
