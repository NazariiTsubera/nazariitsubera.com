"use client";

import { useEffect } from "react";

/**
 * Mounts once and wires the page's ambient motion by querying the DOM:
 *  - reveal: fades sections in as they enter the viewport
 *  - parallax: drifts / scales [data-parallax] elements on scroll
 *  - tilt: nudges [data-depth] layers toward the pointer inside [data-tilt]
 * Tilt is skipped under reduced-motion; reveal still resolves so content shows.
 */
export default function ScrollFX() {
  useEffect(() => {
    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanup: Array<() => void> = [];

    // reveal
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    document.querySelectorAll<HTMLElement>(".reveal").forEach((el, i) => {
      el.style.transitionDelay = (i % 3) * 80 + "ms";
      io.observe(el);
    });
    cleanup.push(() => io.disconnect());

    // parallax
    const pxEls = Array.from(
      document.querySelectorAll<HTMLElement>("[data-parallax]"),
    );
    if (pxEls.length) {
      let ticking = false;
      const upd = () => {
        ticking = false;
        const y = window.scrollY || window.pageYOffset || 0;
        pxEls.forEach((el) => {
          const s = parseFloat(el.dataset.parallax || "0.2") || 0.2;
          el.style.setProperty("--sy", (y * s).toFixed(1) + "px");
          if (el.dataset.scale) {
            const sc = Math.min(1.35, 1 + y * (parseFloat(el.dataset.scale) || 0));
            el.style.setProperty("--scl", sc.toFixed(3));
          }
        });
      };
      const onScroll = () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(upd);
        }
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      upd();
      cleanup.push(() => window.removeEventListener("scroll", onScroll));
    }

    // tilt
    if (!reduce) {
      const wrap = document.querySelector<HTMLElement>("[data-tilt]");
      if (wrap) {
        const depths = wrap.querySelectorAll<HTMLElement>("[data-depth]");
        let raf: number | null = null;
        let tx = 0;
        let ty = 0;
        const apply = () => {
          raf = null;
          depths.forEach((el) => {
            const d = (parseFloat(el.dataset.depth || "0") || 0) * 0.5;
            el.style.setProperty("--mx", (tx * d).toFixed(2) + "px");
            el.style.setProperty("--my", (ty * d).toFixed(2) + "px");
          });
        };
        const onMove = (e: PointerEvent) => {
          const r = wrap.getBoundingClientRect();
          tx = -((e.clientX - r.left) / r.width - 0.5);
          ty = -((e.clientY - r.top) / r.height - 0.5);
          if (raf == null) raf = requestAnimationFrame(apply);
        };
        const onLeave = () => {
          tx = 0;
          ty = 0;
          if (raf == null) raf = requestAnimationFrame(apply);
        };
        wrap.addEventListener("pointermove", onMove);
        wrap.addEventListener("pointerleave", onLeave);
        cleanup.push(() => {
          if (raf) cancelAnimationFrame(raf);
          wrap.removeEventListener("pointermove", onMove);
          wrap.removeEventListener("pointerleave", onLeave);
        });
      }
    }

    return () => cleanup.forEach((fn) => fn());
  }, []);

  return null;
}
