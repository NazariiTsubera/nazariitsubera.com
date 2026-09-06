export default function Brand({
  tone = "light",
  size = "md",
  className = "",
}: {
  tone?: "light" | "dark";
  size?: "md" | "sm";
  className?: string;
}) {
  const dark = tone === "dark";
  const sm = size === "sm";
  const gap = sm ? "gap-[11px]" : "gap-3";
  const markSize = sm ? "text-[25px]" : "text-[30px]";
  const dividerH = sm ? "h-[17px]" : "h-[20px]";
  const nameSize = sm ? "text-[18px]" : "text-[20px]";
  const dot = dark ? "text-flame" : "text-magenta-ink";
  const divider = dark ? "bg-on-dark/[0.22]" : "bg-ink/[0.18]";
  return (
    <a
      href="#top"
      aria-label="Nazarii Tsubera home"
      className={`inline-flex items-baseline ${gap} ${
        dark ? "text-on-dark" : "text-ink"
      } ${className}`}
    >
      <span
        className={`font-serif font-normal leading-none tracking-[-0.03em] ${markSize}`}
      >
        nt<span className={dot}>.</span>
      </span>
      <span
        aria-hidden="true"
        className={`w-px self-center ${dividerH} ${divider}`}
      />
      <span
        className={`whitespace-nowrap font-serif font-medium tracking-[-0.02em] ${nameSize}`}
      >
        Nazarii Tsubera
      </span>
    </a>
  );
}
