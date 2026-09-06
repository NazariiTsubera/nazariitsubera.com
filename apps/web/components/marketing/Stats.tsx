import { Band, GRID } from "./Section";

const STATS = [
  { figure: "1", body: "Point of contact. Me, from the first call to finished software." },
  { figure: "Weeks", body: "Not months. You see working software early, and often." },
  { figure: "0", body: "Jargon. Every conversation stays in plain language." },
];

export function Stats() {
  return (
    <Band tone="dark">
      <h2 className="n rv mb-8 max-w-[22ch] text-[clamp(24px,2.8vw,32px)] leading-[1.15] tracking-[-0.02em] text-on-dark">
        Built for owners, not IT departments.
      </h2>
      <div className={GRID.cards3}>
        {STATS.map((stat) => (
          <div key={stat.figure} className="rv border-t border-white/25 pt-5">
            <div className="n mb-2 text-[clamp(38px,5vw,52px)] leading-none tracking-[-0.03em] text-on-dark">{stat.figure}</div>
            <p className="max-w-[30ch] text-dark-muted">{stat.body}</p>
          </div>
        ))}
      </div>
    </Band>
  );
}
