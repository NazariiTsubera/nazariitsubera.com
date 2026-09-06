const ITEMS: Array<[string, string]> = [
  ["Automate the busywork", "#c81d68"],
  ["Build the missing tool", "#6d28d9"],
  ["Apply AI where it pays", "#ef6a2a"],
  ["Integrate what you already use", "#2f3bd6"],
];

function Track() {
  return (
    <div className="flex items-center gap-[34px] pr-[34px] font-mono text-xs uppercase tracking-[0.14em] text-mono">
      {ITEMS.map(([label, color], i) => (
        <span key={i} className="contents">
          <span>{label}</span>
          <span style={{ color }}>◆</span>
        </span>
      ))}
    </div>
  );
}

export default function Marquee() {
  return (
    <div className="mt-[26px] overflow-hidden border-y border-ink/[0.09]">
      <div className="flex w-max animate-marquee py-[15px] motion-reduce:animate-none">
        <Track />
        <Track />
      </div>
    </div>
  );
}
