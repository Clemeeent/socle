// A fact-check card: the claim heard in a debate, a verdict and the common ground, in one block.
import Link from "next/link";
import { formatDate, lienCarte, VERDICTS, type Carte, type Verdict } from "@/lib/data";
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

export function CarteVerif({ c }: { c: Carte }) {
  return (
    <div className="rounded-3xl border border-line bg-white p-5 shadow-[0_1px_0_var(--line),0_8px_24px_-12px_rgba(20,22,31,0.18)]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-extrabold">
          Socle<span className="text-accent">.</span>
        </span>
        <PastilleVerdict v={c.verdict} />
      </div>
      <p className="mt-4 text-[1.6rem] font-extrabold leading-tight tracking-tight">« {c.affirmation} »</p>
      <p className="mt-1 text-xs text-ink-3">{c.contexte}</p>
      <p className="mt-4 rounded-2xl bg-bg-alt p-4 font-semibold leading-snug text-ink-2">{c.enBref}</p>
      <p className="mt-3 text-xs text-ink-3">Vérifié le {formatDate(c.verifieLe)}</p>
    </div>
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
