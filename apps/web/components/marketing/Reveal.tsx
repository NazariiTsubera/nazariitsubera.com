"use client";

import { useEffect, useRef } from "react";

/**
 * Wraps the marketing shell and fades `.rv` elements in as they enter the viewport. The `armed`
 * class is added only after this effect runs, so without JavaScript everything is simply visible.
 * The shell persists across client-side navigations, so a MutationObserver picks up the `.rv`
 * elements each new page renders; otherwise they would stay dimmed until a reload.
 */
export function RevealRoot({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || !("IntersectionObserver" in window)) return;

    const seen = new WeakSet<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    const watch = () => {
      for (const el of root.querySelectorAll<HTMLElement>(".rv:not(.in)")) {
        if (seen.has(el)) continue;
        seen.add(el);
        io.observe(el);
      }
    };

    root.classList.add("armed");
    watch();
    const mo = new MutationObserver(watch);
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className="overflow-x-clip">
      {children}
    </div>
  );
}
