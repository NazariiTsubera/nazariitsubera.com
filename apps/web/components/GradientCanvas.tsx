"use client";

import { useEffect, useRef, type CSSProperties } from "react";

type Variant = "ambient" | "orb" | "cta";

const PALETTES: Record<
  Variant,
  { bg: string | null; colors: string[] }
> = {
  ambient: {
    bg: null,
    colors: ["#3b49e0", "#6d28d9", "#c81d68", "#ef6a2a", "#8b5cf6", "#2f3bd6"],
  },
  orb: {
    bg: null,
    colors: ["#3b49e0", "#6d28d9", "#c81d68", "#ef6a2a", "#8b5cf6", "#2f3bd6"],
  },
  cta: {
    bg: "#0a0912",
    colors: ["#2f3bd6", "#6d28d9", "#c81d68", "#ef6a2a", "#8b5cf6"],
  },
};

/**
 * Painterly "liquid" gradient field rendered to a <canvas>. Three variants:
 *  - ambient: full-bleed hero wash, animates briefly on scroll/pointer then holds
 *  - orb: circular liquid sphere, animates continuously while on screen
 *  - cta: static single frame on the dark band
 * Renders below CSS resolution and upscales — the art is soft, so the
 * fill-rate saving is invisible. Reduced-motion renders one static frame.
 */
export default function GradientCanvas({
  variant,
  className,
  style,
}: {
  variant: Variant;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const P = PALETTES[variant];
    const isOrb = variant === "orb";
    const SCALE = variant === "ambient" ? 0.42 : 0.6;

    let w = 0;
    let h = 0;
    let scrollY = 0;
    const cleanup: Array<() => void> = [];

    const resize = () => {
      const r = cv.getBoundingClientRect();
      w = cv.width = Math.max(2, Math.round(r.width * SCALE));
      h = cv.height = Math.max(2, Math.round(r.height * SCALE));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    cleanup.push(() => ro.disconnect());

    // Full-bleed field: big soft radial masses drifting on sine paths. The
    // orb reuses the same blobs, just clipped to a circle.
    const cols = variant === "ambient" || isOrb ? P.colors.slice(0, 4) : P.colors;
    const blobs = cols.map((c) => ({
      c,
      fx: 0.22 + Math.random() * 0.5,
      fy: 0.22 + Math.random() * 0.5,
      px: Math.random() * Math.PI * 2,
      py: Math.random() * Math.PI * 2,
      rot: Math.random() * Math.PI,
      spin: Math.random() - 0.5,
      sq: 0.32 + Math.random() * 0.42,
      rr: 0.55 + Math.random() * 0.4,
    }));

    // The orb is the same liquid as the ambient field, viewed through a
    // circular window: identical blobs and drift math, clipped to the circle,
    // with scroll flowing it and a faint top gloss.
    const drawOrb = (t: number) => {
      const R = Math.min(w, h) / 2;
      const ox = w / 2;
      const oy = h / 2;
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, w, h);
      const sc = scrollY * 0.0018;
      ctx.save();
      ctx.beginPath();
      ctx.arc(ox, oy, R, 0, Math.PI * 2);
      ctx.clip();
      ctx.globalCompositeOperation = "lighter";
      for (const b of blobs) {
        const cx = (0.5 + 0.42 * Math.sin(t * b.fx + b.px + sc)) * w;
        const cy = (0.5 + 0.42 * Math.cos(t * b.fy + b.py + sc * 0.7)) * h;
        const rad = b.rr * Math.max(w, h);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(b.rot + t * 0.06 * b.spin);
        ctx.scale(1, b.sq);
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rad);
        g.addColorStop(0, b.c + "cc");
        g.addColorStop(0.45, b.c + "55");
        g.addColorStop(1, b.c + "00");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      // faint top gloss for a hint of dimension (no dark shading)
      ctx.globalCompositeOperation = "source-over";
      const hi = ctx.createRadialGradient(
        ox - R * 0.3,
        oy - R * 0.34,
        0,
        ox - R * 0.3,
        oy - R * 0.34,
        R,
      );
      hi.addColorStop(0, "rgba(255,255,255,0.18)");
      hi.addColorStop(0.42, "rgba(255,255,255,0.03)");
      hi.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = hi;
      ctx.beginPath();
      ctx.arc(ox, oy, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawField = (t: number) => {
      if (P.bg) {
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = P.bg;
        ctx.fillRect(0, 0, w, h);
      } else {
        ctx.clearRect(0, 0, w, h);
      }
      ctx.globalCompositeOperation = "lighter";
      for (const b of blobs) {
        const sc = variant === "ambient" ? scrollY * 0.0018 : 0;
        const cx = (0.5 + 0.42 * Math.sin(t * b.fx + b.px + sc)) * w;
        const cy = (0.5 + 0.42 * Math.cos(t * b.fy + b.py + sc * 0.7)) * h;
        const rad = b.rr * Math.max(w, h);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(b.rot + t * 0.06 * b.spin);
        ctx.scale(1, b.sq);
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rad);
        g.addColorStop(0, b.c + "cc");
        g.addColorStop(0.45, b.c + "55");
        g.addColorStop(1, b.c + "00");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };

    const drawFrame = isOrb ? drawOrb : drawField;

    // static paths: reduced motion, or the decorative CTA band
    if (reduce || variant === "cta") {
      drawFrame(2.5);
      return () => cleanup.forEach((fn) => fn());
    }

    // Orb: always-alive liquid — continuous loop while on-screen.
    if (isOrb) {
      const onScroll = () => {
        scrollY = window.scrollY || window.pageYOffset || 0;
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      cleanup.push(() => window.removeEventListener("scroll", onScroll));

      const FRAME = 1000 / 30;
      let rid: number | null = null;
      let last = 0;
      let onScreen = false;
      const loop = (tm: number) => {
        rid = requestAnimationFrame(loop);
        if (tm - last < FRAME) return;
        last = tm;
        drawFrame(tm * 0.001);
      };
      const start = () => {
        if (rid == null && onScreen && !document.hidden) {
          last = 0;
          rid = requestAnimationFrame(loop);
        }
      };
      const stop = () => {
        if (rid != null) {
          cancelAnimationFrame(rid);
          rid = null;
        }
      };
      const io = new IntersectionObserver(
        (es) => {
          onScreen = es[0].isIntersecting;
          if (onScreen) start();
          else stop();
        },
        { threshold: 0 },
      );
      io.observe(cv);
      const onVis = () => {
        if (document.hidden) stop();
        else start();
      };
      document.addEventListener("visibilitychange", onVis);
      drawFrame(0);
      cleanup.push(() => {
        stop();
        io.disconnect();
        document.removeEventListener("visibilitychange", onVis);
      });
      return () => cleanup.forEach((fn) => fn());
    }

    // Ambient: activity-driven loop — animates for a short window after any
    // interaction (scroll / pointer) or after entering view, then stops.
    const FRAME = 1000 / 22;
    const RUN_MS = 3200;
    let rid: number | null = null;
    let last = 0;
    let deadline = 0;
    let onScreen = false;
    const loop = (tm: number) => {
      if (tm >= deadline) {
        rid = null;
        return;
      }
      rid = requestAnimationFrame(loop);
      if (tm - last < FRAME) return;
      last = tm;
      drawFrame(tm * 0.001);
    };
    const start = () => {
      if (
        rid == null &&
        onScreen &&
        !document.hidden &&
        performance.now() < deadline
      ) {
        last = 0;
        rid = requestAnimationFrame(loop);
      }
    };
    const stop = () => {
      if (rid != null) {
        cancelAnimationFrame(rid);
        rid = null;
      }
    };
    const poke = () => {
      deadline = performance.now() + RUN_MS;
      start();
    };
    const onScroll = () => {
      scrollY = window.scrollY || window.pageYOffset || 0;
      poke();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", poke, { passive: true });
    cleanup.push(() => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", poke);
    });
    const io = new IntersectionObserver(
      (es) => {
        onScreen = es[0].isIntersecting;
        if (onScreen) poke();
        else stop();
      },
      { threshold: 0 },
    );
    io.observe(cv);
    const onVis = () => {
      if (document.hidden) stop();
      else poke();
    };
    document.addEventListener("visibilitychange", onVis);
    drawFrame(2.5);
    cleanup.push(() => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    });
    return () => cleanup.forEach((fn) => fn());
  }, [variant]);

  return <canvas ref={ref} className={className} style={style} aria-hidden="true" />;
}
