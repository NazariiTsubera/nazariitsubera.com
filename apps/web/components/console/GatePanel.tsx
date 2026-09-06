export type GateSummary = {
  passed: boolean;
  browserRan: boolean;
  eagerBytes: number;
  violations: { field: string; rule: string; detail: string }[];
} | null;

/** What the gate concluded about the page that is actually live. */
export function GatePanel({ report, authoredBy }: { report: GateSummary; authoredBy: string | null }) {
  if (!report) return null;

  const written = authoredBy === "model" ? "Designed by the model" : "Rendered from the template";
  const state = report.passed ? "passed" : "fell back";

  return (
    <section className="flex flex-col gap-2">
      <h2 className="ui-h2">Checks</h2>
      <p className="ui-note">
        {written} · gate {state}
        {report.browserRan ? "" : " (browser checks unavailable)"} · about {Math.round(report.eagerBytes / 1024)}KB first load
      </p>
      {report.violations.length > 0 ? (
        <ul className="flex flex-col gap-1 text-sm text-magenta-ink">
          {report.violations.slice(0, 6).map((violation, index) => (
            <li key={`${violation.rule}-${index}`}>
              <span className="font-medium">{violation.rule}</span>: {violation.detail}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
