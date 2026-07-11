// Vivid indigo -> violet -> magenta gradient art, recreated fully in-code.
// Layered blurred color blobs + a subtle SVG grain overlay for painterly texture.
// Reusable for the hero and for soft section glows.

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function GradientField({
  className = "",
  animate = true,
  grain = true,
}: {
  className?: string;
  animate?: boolean;
  grain?: boolean;
}) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div
        className={`absolute inset-[-25%] bg-vivid-blend blur-[90px] saturate-150 ${
          animate ? "motion-safe:animate-drift" : ""
        }`}
      />
      {grain ? (
        <div
          className="absolute inset-0 opacity-[0.10] mix-blend-overlay"
          style={{ backgroundImage: GRAIN, backgroundSize: "140px 140px" }}
        />
      ) : null}
    </div>
  );
}
