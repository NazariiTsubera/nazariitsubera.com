const LABELS: Record<string, string> = {
  vendor_created: "Captured",
  capture_uploaded: "Recording uploaded",
  asset_uploaded: "Photo uploaded",
  generation_started: "Generation started",
  generation_succeeded: "Generation finished",
  generation_failed: "Generation failed",
  preview_published: "Preview published",
  preview_opened: "Vendor opened the link",
  preview_extended: "Preview extended",
  preview_expired: "Preview expired",
  sms_link_tapped: "Texted the vendor",
  unpublished: "Unpublished",
  marked_won: "Marked won",
  marked_lost: "Marked lost",
};

export type TimelineEvent = { id: string; type: string; createdAt: Date; meta: unknown };

export function Timeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="ui-h2">History</h2>
      <ol className="flex flex-col gap-2 text-sm">
        {events.map((event) => {
          const meta = event.meta as Record<string, unknown> | null;
          const error = typeof meta?.error === "string" ? meta.error : null;
          return (
            <li key={event.id} className="flex justify-between gap-3 border-b border-ink/10 pb-2">
              <span>
                {LABELS[event.type] ?? event.type}
                {error ? <span className="block text-xs text-magenta-ink">{error}</span> : null}
              </span>
              <time className="shrink-0 text-xs text-faint">
                {event.createdAt.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              </time>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
