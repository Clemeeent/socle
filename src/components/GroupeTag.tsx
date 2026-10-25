import type { Groupe } from "@/lib/data";

// Group colour comes from the Assemblée open data: it identifies, it doesn't judge.
export function GroupeTag({ g, long = false }: { g: Groupe; long?: boolean }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="inline-block h-2.5 w-2.5 shrink-0 self-center rounded-full" style={{ background: g.couleur }} />
      <span className="whitespace-nowrap font-semibold">{g.sigle}</span>
      {long && <span className="text-sm font-normal text-ink-3">{g.libelle}</span>}
    </span>
  );
}
