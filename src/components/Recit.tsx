// The answer told as a short narrative, AI-style: a title, paragraphs with numbered citations,
// then open questions for the debate and ways to go further. No boxes, no pull quotes.
import Link from "next/link";
import { cartesVoisines, dossierDeLaCarte, getDossier, lienCarte, lienDossier, type Carte } from "@/lib/data";
import type { Passage } from "@/lib/decoupage";
import { Positionnement } from "./Positionnement";

export const COULEURS_PASSAGE: Record<Passage["type"], { fond: string; trait: string }> = {
  donnee: { fond: "#e6ebff", trait: "#2a3eb1" },
  definition: { fond: "#fff1d6", trait: "#d9692e" },
  source: { fond: "#fde8e7", trait: "#c43d32" },
};

type Source = { label: string; url: string; statut: string; texte: string };

// "[3]" → a superscript link to the 3rd source.
function avecCitations(texte: string) {
  // The number sticks to the preceding word (no space, no line break before it).
  return texte.replace(/\s+(\[\d+\])/g, "$1").split(/(\[\d+\])/).map((morceau, i) => {
    const n = morceau.match(/^\[(\d+)\]$/)?.[1];
    if (!n) return <span key={i}>{morceau}</span>;
    return (
      <sup key={i} className="ml-0.5">
        <a href={`#source-${n}`} className="rounded px-0.5 text-[0.7em] font-bold no-underline hover:bg-accent-soft">
          {n}
        </a>
      </sup>
    );
  });
}

export function Recit({ c, sources, extraits = {} }: { c: Carte; sources: Source[]; extraits?: Record<number, string> }) {
  const { redaction } = c.recit;
  return (
    <section>
      <p className="flex items-center gap-1.5 text-xs text-ink-3">
        <span aria-hidden className="text-accent">✦</span>
        {redaction.par === "ia" ? "Réponse générée par IA" : "Réponse rédigée"} à partir de {sources.length} sources ·{" "}
        <span className={redaction.relu ? "text-ok-ink" : "text-warn-ink"}>{redaction.relu ? "relue par un humain" : "non relue"}</span>
      </p>
      <h2 className="mt-2 text-[1.6rem] font-extrabold leading-tight tracking-tight">{c.recit.titre}</h2>
      <div className="mt-4 space-y-4 text-[1.05rem] leading-relaxed text-ink">
        {c.recit.paragraphes.map((p, i) => {
          const passage = p.passage !== undefined ? c.decoupage[p.passage] : undefined;
          const extrait = p.passage !== undefined ? (extraits[p.passage] ?? passage?.extrait) : undefined;
          const couleur = passage ? COULEURS_PASSAGE[passage.type] : undefined;
          return (
            <p key={i}>
              {extrait && couleur && (
                <>
                  <mark
                    className="rounded px-1 font-semibold text-ink"
                    style={{ background: couleur.fond, boxShadow: `inset 0 -2px 0 ${couleur.trait}` }}
                  >
                    {extrait}
                  </mark>{" "}
                  —{" "}
                </>
              )}
              {avecCitations(p.texte)}
            </p>
          );
        })}
      </div>
    </section>
  );
}

export function SuiteRecit({ c, sources }: { c: Carte; sources: Source[] }) {
  const dossier = c.dossier ? getDossier(c.dossier) : dossierDeLaCarte(c.id);
  const voisines = cartesVoisines(c);
  return (
    <>
      {c.debat.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold">Pour lancer le débat</h2>
          <p className="mt-1 text-sm text-ink-3">Ici, les faits ne tranchent pas : ce sont des choix. Et toi, tu te situes où ?</p>
          <ul className="mt-4 space-y-6">
            {c.debat.map((q) =>
              q.positions ? (
                <li key={q.question}>
                  <Positionnement question={q.question} positions={q.positions} sources={sources} />
                </li>
              ) : (
                <li key={q.question} className="flex gap-3 text-[1.05rem] leading-snug">
                  <span aria-hidden className="text-accent">→</span>
                  <span>{q.question}</span>
                </li>
              ),
            )}
          </ul>
        </section>
      )}

      {(dossier || voisines.length > 0) && (
        <section className="mt-10">
          <h2 className="text-lg font-bold">Pour aller plus loin</h2>
          <ul className="mt-3 space-y-2">
            {dossier && (
              <li>
                <Link href={lienDossier(dossier.id)} className="font-semibold">
                  Le dossier « {dossier.titre} » →
                </Link>
              </li>
            )}
            {voisines.map((v) => (
              <li key={v.id}>
                <Link href={lienCarte(v.id)}>« {v.affirmation} » →</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-ink-3">Sources</h2>
        <ol className="mt-2 space-y-1.5 text-sm">
          {sources.map((s, i) => (
            <li key={i} id={`source-${i + 1}`} className="flex scroll-mt-20 gap-2">
              <span className="w-5 shrink-0 text-right font-bold text-ink-3">{i + 1}</span>
              <span>
                <a href={s.url} target="_blank" rel="noreferrer">
                  {s.label} ↗
                </a>
                <span className={`ml-1 text-xs ${s.statut === "vérifié" ? "text-ok-ink" : "text-warn-ink"}`}>
                  · {s.statut === "vérifié" ? "vérifié" : "à vérifier"}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
