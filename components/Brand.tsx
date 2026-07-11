export default function Brand({ tone = "light" }: { tone?: "light" | "dark" }) {
  const text = tone === "dark" ? "text-on-dark" : "text-ink";
  return (
    <a
      href="#top"
      aria-label="Lumen home"
      className={`inline-flex items-center gap-2.5 ${text}`}
    >
      <span
        aria-hidden="true"
        className="grid h-[22px] w-[22px] place-items-center rounded-[6px] bg-vivid-line shadow-glow"
      >
        <span className="h-2 w-2 rounded-[2px] bg-white/90" />
      </span>
      <span className="font-serif text-[1.15rem] tracking-[-0.03em]">Lumen</span>
    </a>
  );
}
