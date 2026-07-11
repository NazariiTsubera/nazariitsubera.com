import type { ReactNode } from "react";

type Variant = "primary" | "gradient" | "ghost";

const VARIANT: Record<Variant, string> = {
  primary: "btn-primary",
  gradient: "btn-gradient",
  ghost: "btn-ghost",
};

export default function Button({
  href,
  variant = "primary",
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a href={href} className={`${VARIANT[variant]} ${className}`}>
      {children}
    </a>
  );
}
