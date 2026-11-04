// A fact-check card: the claim heard in a debate, a verdict and the common ground, in one block.
import Link from "next/link";
import { lienCarte, VERDICTS, type Carte, type Verdict } from "@/lib/data";
import { Motif, PALETTES } from "./Motif";

// Colour family of a verdict (the verdict is always also written in words).
export const paletteVerdict = (v: Verdict) =>
  PALETTES[{ jugement: "lavande", depend: "beurre", nuance: "beurre", dementi: "rose", vrai: "menthe", faux: "rose" }[v]];

export function PastilleVerdict({ v, long = false }: { v: Verdict; long?: boolean }) {
  return (
    <span
      className="inline-block rounded-full px-3 py-1 text-xs font-bold"
      style={{ background: `var(--verdict-${v}-bg)`, color: `var(--verdict-${v}-ink)` }}
    >
      {long ? VERDICTS[v].label : VERDICTS[v].court}
    </span>
  );
}

// Colourful tile for carousels and grids: generative pattern on top, the claim below.
export function TuileCarte({ c }: { c: Carte }) {
  const p = paletteVerdict(c.verdict);
  return (
    <Link
      href={lienCarte(c.id)}
      className="group flex h-full flex-col overflow-hidden rounded-3xl no-underline transition-transform hover:-translate-y-0.5 motion-reduce:transition-none"
      style={{ background: p.fond }}
    >
      <Motif graine={c.id} palette={p} className="h-28 w-full" />
      <div className="flex flex-1 flex-col p-4">
        <span className="self-start rounded-full bg-white px-3 py-1 text-xs font-bold" style={{ color: p.formes[2] }}>
          {VERDICTS[c.verdict].court}
        </span>
        <p className="mt-2 text-lg font-extrabold leading-snug text-ink">« {c.affirmation} »</p>
        <p className="mt-auto pt-3 text-sm font-semibold" style={{ color: p.formes[2] }}>
          Voir la carte →
        </p>
      </div>
    </Link>
  );
}
