// The visual identity of a dossier: a coloured block with an abstract hemicycle illustration.
import Link from "next/link";
import { lienDossier, textesDuDossier, type Dossier } from "@/lib/data";

const palette = (couleur: string) => ({
  bg: `var(--dossier-${couleur}-bg)`,
  ink: `var(--dossier-${couleur}-ink)`,
  a: `var(--dossier-${couleur}-a)`,
  b: `var(--dossier-${couleur}-b)`,
});

// Rows of dots on half-circles, a few of them highlighted: evokes a vote, carries no data.
export function IllustrationDossier({ couleur, className = "" }: { couleur: string; className?: string }) {
  const p = palette(couleur);
  const points: { x: number; y: number; c: string }[] = [];
  [40, 52, 64, 76, 88].forEach((r, ligne) => {
    const n = 8 + ligne * 3;
    for (let i = 0; i < n; i++) {
      const a = Math.PI - (Math.PI * i) / (n - 1);
      const k = (i * 7 + ligne * 3) % 11;
      points.push({
        x: 100 + r * Math.cos(a),
        y: 104 - r * Math.sin(a),
        c: k === 0 ? p.b : k < 4 ? p.a : p.ink,
      });
    }
  });
  return (
    <svg viewBox="0 0 200 112" className={className} aria-hidden>
      {points.map((pt, i) => (
        <circle key={i} cx={pt.x} cy={pt.y} r="4.2" fill={pt.c} opacity={pt.c === p.ink ? 0.85 : 1} />
      ))}
      <rect x="86" y="92" width="28" height="12" rx="6" fill={p.ink} />
    </svg>
  );
}

function resumeDossier(d: Dossier, nTextes: number) {
  const parts = [];
  const affirmations = d.affirmations ?? [];
  const enAttente = affirmations.filter((a) => a.verdict === "à établir").length;
  if (affirmations.length) parts.push(`${affirmations.length} affirmation${affirmations.length > 1 ? "s" : ""}`);
  if (enAttente) parts.push(enAttente > 1 ? `${enAttente} verdicts à établir` : "verdict à établir");
  if (d.criteres.length) parts.push(`${d.criteres.length} questions`);
  if (nTextes) parts.push(`${nTextes} textes votés`);
  return parts.join(" · ");
}

export function CarteDossier({ d }: { d: Dossier }) {
  const p = palette(d.couleur);
  const n = textesDuDossier(d).length;
  return (
    <Link
      href={lienDossier(d.id)}
      className="group block overflow-hidden rounded-3xl p-5 no-underline transition-transform hover:-translate-y-0.5 motion-reduce:transition-none"
      style={{ background: p.bg, color: p.ink }}
    >
      <p className="text-xs font-bold uppercase tracking-widest opacity-80">Dossier</p>
      <h3 className="mt-1 text-2xl font-extrabold leading-tight">{d.titre}</h3>
      <p className="mt-1 text-base leading-snug">{d.question}</p>
      <IllustrationDossier couleur={d.couleur} className="mx-auto mt-4 h-auto w-full max-w-[16rem]" />
      <p className="mt-3 flex items-center justify-between text-sm font-semibold">
        <span>{resumeDossier(d, n)}</span>
        <span
          aria-hidden
          className="text-lg transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
        >
          →
        </span>
      </p>
    </Link>
  );
}

// Full-width coloured header of a dossier page.
export function BandeauDossier({ d, children }: { d: Dossier; children: React.ReactNode }) {
  const p = palette(d.couleur);
  return (
    <div className="-mx-4 -mt-6 mb-6 px-4 pb-6 pt-6" style={{ background: p.bg, color: p.ink }}>
      {children}
      <IllustrationDossier couleur={d.couleur} className="mx-auto mt-5 h-auto w-full max-w-[18rem]" />
    </div>
  );
}

export const couleurDossier = palette;
