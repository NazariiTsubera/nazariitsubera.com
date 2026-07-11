import type { ReactNode } from "react";

export default function Section({
  id,
  tone = "light",
  padded = true,
  className = "",
  children,
}: {
  id?: string;
  tone?: "light" | "canvas" | "ink";
  padded?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const bg =
    tone === "ink"
      ? "bg-ink-deep text-on-dark"
      : tone === "canvas"
        ? "bg-canvas text-ink"
        : "bg-paper text-ink";

  return (
    <section
      id={id}
      className={`relative w-full ${bg} ${
        padded ? "py-[clamp(56px,9vw,112px)]" : ""
      } ${className}`}
    >
      {children}
    </section>
  );
}
