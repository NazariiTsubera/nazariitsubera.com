"use client";

import { useEffect, useRef } from "react";

/**
 * Wraps the page and fades `.rv` children in as they enter the viewport. The `armed` class is
 * added only after this effect runs, so without JavaScript everything is simply visible.
 */
export function RevealRoot({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || !("IntersectionObserver" in window)) return;
    const items = root.querySelectorAll<HTMLElement>(".rv");
    if (items.length === 0) return;

    root.classList.add("armed");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="overflow-x-clip">
      {children}
    </div>
  );
}
