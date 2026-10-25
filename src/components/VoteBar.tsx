// Horizontal stacked bar: pour / contre / abstention / absent, as shares of the group's seats.
import { CATEGORIES, part, pct, type Repartition } from "@/lib/format";

const FILL: Record<(typeof CATEGORIES)[number]["key"], string> = {
  pour: "var(--vote-pour)",
  contre: "var(--vote-contre)",
  abstention: "var(--vote-abstention)",
  absent: "var(--vote-absent)",
};

export function VoteBar({ r, label }: { r: Repartition; label: string }) {
  const segments = CATEGORIES.map((c) => ({ ...c, n: r[c.key] })).filter((s) => s.n > 0);
  const resume = CATEGORIES.map((c) => `${c.label} : ${r[c.key]} (${pct(part(r[c.key], r.membres))})`).join(", ");
  return (
    <div
      className="flex h-3.5 w-full gap-[2px] overflow-hidden rounded-[4px]"
      role="img"
      aria-label={`${label} — ${resume}`}
      title={`${label}\n${resume.replaceAll(", ", "\n")}`}
    >
      {segments.map((s) => (
        <div key={s.key} style={{ flexGrow: s.n, flexBasis: 0, background: FILL[s.key] }} />
      ))}
    </div>
  );
}

export function VoteLegende() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2">
      {CATEGORIES.map((c) => (
        <li key={c.key} className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ background: FILL[c.key], outline: c.key === "absent" ? "1px solid #c5c7cc" : undefined }}
          />
          {c.label}
        </li>
      ))}
    </ul>
  );
}
