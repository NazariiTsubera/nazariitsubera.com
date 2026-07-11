function Crosshair({ tone }: { tone: "light" | "dark" }) {
  const color = tone === "dark" ? "bg-on-dark-soft" : "bg-muted-soft";
  return (
    <span className="relative h-5 w-5 flex-none" aria-hidden="true">
      <span
        className={`absolute left-1/2 top-1/2 h-[10px] w-px -translate-x-1/2 -translate-y-1/2 ${color}`}
      />
      <span
        className={`absolute left-1/2 top-1/2 h-px w-[10px] -translate-x-1/2 -translate-y-1/2 ${color}`}
      />
    </span>
  );
}

export default function Divider({ tone = "light" }: { tone?: "light" | "dark" }) {
  const bg = tone === "dark" ? "bg-ink-deep" : "bg-paper";
  const rule = tone === "dark" ? "bg-ink-line" : "bg-line";
  return (
    <div className={`w-full ${bg}`} aria-hidden="true">
      <div
        className={`mx-auto flex w-[min(theme(maxWidth.frame),100%)] items-center border-x px-[clamp(16px,4vw,24px)] ${
          tone === "dark" ? "border-ink-line" : "border-line"
        } min-h-[40px]`}
      >
        <Crosshair tone={tone} />
        <span className={`h-px flex-1 ${rule}`} />
        <Crosshair tone={tone} />
        <span className={`h-px flex-1 ${rule}`} />
        <Crosshair tone={tone} />
      </div>
    </div>
  );
}

export { Crosshair };
