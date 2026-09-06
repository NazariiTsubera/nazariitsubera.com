"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import LeadForm from "@/components/LeadForm";

type InquiryContextValue = {
  open: (trigger: HTMLButtonElement) => void;
};

const InquiryContext = createContext<InquiryContextValue | null>(null);

export function InquiryProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  function close() {
    setIsOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute("hidden"));
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <InquiryContext.Provider
      value={{
        open: (trigger) => {
          triggerRef.current = trigger;
          setIsOpen(true);
        },
      }}
    >
      {children}
      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-deep/70 p-3 backdrop-blur-[10px] sm:p-6"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) close();
            }}
          >
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="inquiry-title"
              className="relative w-full max-w-[680px] overflow-hidden rounded-[24px] bg-cream shadow-[0_30px_100px_rgba(10,9,18,0.45)] sm:rounded-[26px]"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-[5px] rounded-t-[26px] bg-grad-bar" />
              <div className="relative overflow-hidden px-5 pb-5 pt-6 sm:px-8 sm:pb-7 sm:pt-7">
                <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(109,40,217,0.18),rgba(214,38,110,0.08)_45%,transparent_72%)]" />
                <div className="relative mb-5 pr-11 sm:pr-12">
                  <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-eyebrow">
                    Start a conversation
                  </div>
                  <h2
                    id="inquiry-title"
                    className="max-w-[18ch] font-serif text-[clamp(30px,4.5vw,42px)] font-normal leading-[0.98] tracking-[-0.03em] text-ink"
                  >
                    Tell me where the work gets stuck.
                  </h2>
                  <p className="mt-2 max-w-[56ch] text-[14.5px] leading-[1.45] text-body">
                    A few sentences are enough. I&apos;ll read your note personally and
                    reply within one business day.
                  </p>
                </div>
                <LeadForm tone="light" />
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Close inquiry form"
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-ink/[0.12] bg-cream/80 font-mono text-[18px] text-body-2 backdrop-blur transition-colors hover:bg-white sm:right-6 sm:top-6"
              >
                ×
              </button>
            </div>
          </div>,
          document.body,
        )}
    </InquiryContext.Provider>
  );
}

export function InquiryTrigger({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = useContext(InquiryContext);
  if (!context) throw new Error("InquiryTrigger must be used inside InquiryProvider.");

  return (
    <button
      {...props}
      type="button"
      onClick={(event) => {
        props.onClick?.(event);
        if (!event.defaultPrevented) context.open(event.currentTarget);
      }}
    >
      {children}
    </button>
  );
}
