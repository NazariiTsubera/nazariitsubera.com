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
  const mark =
    size === "sm" ? "h-6 w-6 rounded-[7px]" : "h-7 w-7 rounded-[8px]";
  const markText = size === "sm" ? "text-[9.5px]" : "text-[11px]";
  const name = size === "sm" ? "text-[19px]" : "text-[23px]";
  return (
    <a
      href="#top"
      aria-label="Nazarii Tsubera home"
      className={`inline-flex items-center gap-[11px] ${
        dark ? "text-on-dark" : "text-ink"
      } ${className}`}
    >
      <span
        aria-hidden="true"
        className={`inline-flex items-center justify-center bg-grad-mark shadow-mark ${mark}`}
      >
        <span
          className={`font-mono font-semibold tracking-[-0.02em] text-cream ${markText}`}
        >
          NT
        </span>
      </span>
      <span className={`font-serif font-medium tracking-[-0.02em] ${name}`}>
        Nazarii Tsubera
      </span>
    </a>
  );
}
