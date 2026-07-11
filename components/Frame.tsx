import type { ReactNode } from "react";

export default function Frame({
  tone = "light",
  className = "",
  children,
}: {
  tone?: "light" | "dark";
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`frame ${tone === "dark" ? "frame-dark" : ""} ${className}`}>
      {children}
    </div>
  );
}
