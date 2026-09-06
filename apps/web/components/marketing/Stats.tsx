import { Band } from "./Section";

const STATS = [
  { figure: "1", body: "Point of contact. Me, from the first call to finished software." },
  { figure: "Weeks", body: "Not months. You see working software early, and often." },
  { figure: "0", body: "Jargon. Every conversation stays in plain language." },
];

export function Stats() {
  return (
    <Band tone="dark">
      <div className="l rv mb-[30px] text-dark-label">Built for owners, not IT departments</div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-[clamp(24px,4vw,44px)]">
        {STATS.map((stat) => (
          <div key={stat.figure} className="rv">
            <div className="n mb-3 text-[clamp(38px,5vw,52px)] leading-none tracking-[-0.03em] text-on-dark">{stat.figure}</div>
            <p className="max-w-[26ch] text-dark-muted">{stat.body}</p>
          </div>
        ))}
      </div>
    </Band>
  );
}
