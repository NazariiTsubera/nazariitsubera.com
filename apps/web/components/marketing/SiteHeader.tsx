"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { LINKS, NAV } from "./links";

/**
 * The sticky bar. The small-screen menu stays a `<details>` element so it opens with no
 * JavaScript; the effects here only add what markup alone cannot: a hairline once the page has
 * scrolled, and closing the menu after a client-side navigation, which would otherwise leave it
 * hanging open over the new page.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const menu = useRef<HTMLDetailsElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (menu.current) menu.current.open = false;
  }, [pathname]);

  const close = () => {
    if (menu.current) menu.current.open = false;
  };

  return (
    <header className="site-header" data-scrolled={scrolled}>
      <div className="relative mx-auto flex h-header max-w-frame items-center gap-5 px-gutter">
        {/* The link fills the bar height so the whole left end is tappable; the wordmark itself
            stays baseline-aligned inside it. */}
        <Link href={LINKS.home} className="mr-auto flex h-full items-center">
          <span className="flex items-baseline gap-[10px] leading-none">
            <span className="n text-[22px] tracking-[-0.03em] md:text-2xl">
              nt<span className="text-accent">.</span>
            </span>
            <span className="n text-[16px] tracking-[-0.01em] md:text-lg">Nazarii Tsubera</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-baseline gap-6 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className={`go navlink tap whitespace-nowrap ${pathname === item.href ? "text-accent" : "text-body"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href={LINKS.contact} className="inkbtn hidden md:inline-flex">
          Contact
        </Link>

        <details ref={menu} className="group md:hidden">
          {/* No aria-label: the visible word is the accessible name, and only one of the two is
              rendered at a time, so it reads "Menu" closed and "Close" open. */}
          <summary className="inkbtn cursor-pointer list-none gap-2 [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">Menu</span>
            <span className="hidden group-open:inline">Close</span>
            {/* Two rules that cross into a close mark when the sheet is open. */}
            <span aria-hidden className="relative block size-4">
              <span className="absolute left-0 top-1/2 h-px w-full -translate-y-[3.5px] bg-current transition-transform duration-300 ease-soft group-open:translate-y-0 group-open:rotate-45" />
              <span className="absolute left-0 top-1/2 h-px w-full translate-y-[3.5px] bg-current transition-transform duration-300 ease-soft group-open:translate-y-0 group-open:-rotate-45" />
            </span>
          </summary>

          {/* Tapping anywhere off the sheet closes it, the way a phone menu is expected to. */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={close}
            className="fixed inset-x-0 bottom-0 top-header z-0 w-full cursor-default bg-ink/25"
          />
          <nav
            aria-label="Primary"
            className="absolute inset-x-0 top-full z-10 flex flex-col border-y border-ink/[.14] bg-paper px-gutter pb-4 pt-1 shadow-[0_24px_50px_-30px_rgba(22,26,26,.55)]"
          >
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                aria-current={pathname === item.href ? "page" : undefined}
                className={`go flex min-h-[54px] items-center border-b border-ink/[.10] text-[14px] ${
                  pathname === item.href ? "text-accent" : "text-ink"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link href={LINKS.contact} onClick={close} className="cta mt-4">
              Contact <span className="arw">&rarr;</span>
            </Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
