const size = { width: 15, height: 15, className: "flex-none" };

export function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...size}>
      <path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" />
    </svg>
  );
}

export function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...size}>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3V9zm7 0h3.8v1.64h.05c.53-.95 1.83-1.95 3.76-1.95C21.6 8.69 23 10.9 23 14.24V21h-4v-6.02c0-1.44-.03-3.29-2.06-3.29-2.06 0-2.38 1.56-2.38 3.18V21h-4V9z" />
    </svg>
  );
}

/**
 * The section glyphs. Stroked at 1.5 on a 24 grid to sit with the hairline rules the rest of
 * the design is drawn with, and keyed by the content's own ids so the copy files stay pure text.
 */
function Glyph({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      width={20}
      height={20}
      className="flex-none"
    >
      {children}
    </svg>
  );
}

/** Work that comes back round on its own. */
const Repeat = (
  <Glyph>
    <path d="M4 9a8 8 0 0 1 13.5-4.2L20 7" />
    <path d="M20 15a8 8 0 0 1-13.5 4.2L4 17" />
    <path d="M20 3.5V7h-3.5M4 20.5V17h3.5" />
  </Glyph>
);

/** One clear place to see the work. */
const Panel = (
  <Glyph>
    <rect x="3" y="4.5" width="18" height="15" rx="1" />
    <path d="M3 9h18M8.5 9v10.5" />
    <path d="M12 12.5h5.5M12 15.5h3.5" />
  </Glyph>
);

/** Applied AI: a spark, not a robot. */
const Spark = (
  <Glyph>
    <path d="M12 3.5 13.6 9 19 10.6 13.6 12.2 12 17.7 10.4 12.2 5 10.6 10.4 9 12 3.5Z" />
    <path d="M18.5 16.5v3.5M16.75 18.25h3.5" />
  </Glyph>
);

/** For your business. */
const Storefront = (
  <Glyph>
    <path d="M4 9.5V20h16V9.5" />
    <path d="M3 9.5 5 4h14l2 5.5a3 3 0 0 1-5.6 1 3 3 0 0 1-5.6 0 3 3 0 0 1-5.6-1Z" />
    <path d="M10 20v-5.5h4V20" />
  </Glyph>
);

/** Engineering and infrastructure. */
const Stack = (
  <Glyph>
    <rect x="3" y="4" width="18" height="5" rx="1" />
    <rect x="3" y="15" width="18" height="5" rx="1" />
    <path d="M6.5 6.5h.01M6.5 17.5h.01" />
    <path d="M12 9v6" />
  </Glyph>
);

/** We talk. */
const Talk = (
  <Glyph>
    <path d="M20 13.5a2.5 2.5 0 0 1-2.5 2.5H9l-4 3.5V6.5A2.5 2.5 0 0 1 7.5 4h10A2.5 2.5 0 0 1 20 6.5Z" />
    <path d="M9 8.5h7M9 11.5h4.5" />
  </Glyph>
);

/** I build. */
const Build = (
  <Glyph>
    <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9Z" />
    <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
  </Glyph>
);

/** You run lighter. */
const Lighter = (
  <Glyph>
    <path d="M12 4v11" />
    <path d="m7.5 10.5 4.5 4.5 4.5-4.5" />
    <path d="M5 19.5h14" />
  </Glyph>
);

/** Keyed by `Service.id` in content/services.ts. */
export const SERVICE_ICONS: Record<string, React.ReactNode> = {
  automation: Repeat,
  tools: Panel,
  ai: Spark,
};

/** Keyed by the step number in content/services.ts, and by the storefront's own steps. */
export const STEP_ICONS: Record<string, React.ReactNode> = {
  "01": Talk,
  "02": Build,
  "03": Lighter,
};

export const PATH_ICONS = { business: Storefront, engineering: Stack };
