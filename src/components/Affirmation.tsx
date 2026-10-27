// A claim heard in public debate → official indicators → verdict.
// Level 1: the claim and its verdict. Level 2: each indicator, folded. Sources go to PiedFiche.
import type { Affirmation, Indicateur } from "@/lib/data";
import { Deplier } from "./Deplier";

const STYLE_VERDICT: Record<Affirmation["verdict"], { label: string; className: string }> = {
  vrai: { label: "Vrai", className: "bg-ok-bg text-ok-ink" },
  faux: { label: "Faux", className: "bg-warn-bg text-warn-ink" },
  nuancé: { label: "Nuancé", className: "bg-accent-soft text-accent" },
  "à établir": { label: "Verdict à établir", className: "border border-dashed border-ink-3 text-ink-2" },
};

const nombre = (v: number) => v.toLocaleString("fr-FR", { maximumFractionDigits: 2 });

function BlocIndicateur({ i }: { i: Indicateur }) {
  return (
    <div>
      <p className="text-sm leading-relaxed text-ink-2">{i.ceQuIlMesure}</p>
      {i.valeurs.length === 0 ? (
        <p className="mt-2 rounded-xl bg-bg-alt p-3 text-sm text-ink-2">
          Données non encore téléchargées. Source prévue :{" "}
          {i.sources.map((s) => `${s.publication} (${s.organisme}, ${s.site})`).join(" ; ")}.
        </p>
      ) : (
        <table className="mt-2 w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-ink-3">
              <th className="py-1 font-normal">Année</th>
              <th className="py-1 text-right font-normal">{i.unite}</th>
            </tr>
          </thead>
          <tbody>
            {i.valeurs.map((v) => (
              <tr key={v.annee} className="border-t border-line">
                <td className="py-1.5">{v.annee}</td>
                <td className="py-1.5 text-right tabular-nums">
                  <a href={v.source} target="_blank" rel="noreferrer" title={v.reference}>
                    {nombre(v.valeur)}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export function BlocAffirmation({ a }: { a: Affirmation }) {
  const v = STYLE_VERDICT[a.verdict];
  return (
    <section className="mt-2">
      <p className="text-xs font-bold uppercase tracking-widest text-ink-3">L&apos;affirmation</p>
      <blockquote className="mt-2 text-2xl font-bold leading-snug">« {a.texte} »</blockquote>
      <p className="mt-1 text-sm text-ink-3">{a.contexte}</p>
      <p className="mt-4 flex flex-wrap items-center gap-3">
        <span className={`rounded-full px-3 py-1 text-sm font-bold ${v.className}`}>{v.label}</span>
        {a.verdict === "à établir" && (
          <span className="text-sm text-ink-2">Les séries officielles ne sont pas encore téléchargées.</span>
        )}
      </p>
      {a.explication && <p className="mt-3 leading-relaxed">{a.explication}</p>}

      <h2 className="mt-8 text-xl font-bold">Ça dépend de ce qu&apos;on mesure</h2>
      <div className="mt-2 border-t border-line">
        {a.indicateurs.map((i) => (
          <Deplier
            key={i.id}
            titre={
              <>
                {i.label}{" "}
                <span className="font-normal text-ink-3">
                  · {i.valeurs.length ? `${i.valeurs.length} années` : "à télécharger"}
                </span>
              </>
            }
          >
            <BlocIndicateur i={i} />
          </Deplier>
        ))}
        <Deplier
          titre={
            <>
              D&apos;où vient ce chiffre ?{" "}
              <span className="font-normal text-ink-3">
                · {a.origine.etat === "trouvée" ? a.origine.qui : "à retrouver"}
              </span>
            </>
          }
        >
          {a.origine.etat === "trouvée" ? (
            <p className="text-sm">
              {a.origine.qui}, {a.origine.quand}.{" "}
              {a.origine.source && (
                <a href={a.origine.source} target="_blank" rel="noreferrer">
                  Source ↗
                </a>
              )}
            </p>
          ) : (
            <p className="text-sm text-ink-2">
              Origine à retrouver : qui a avancé ce chiffre, quand, et ce qu&apos;il recouvre (une année, plusieurs
              années, quel périmètre). Pas de verdict avant.
            </p>
          )}
        </Deplier>
      </div>
    </section>
  );
}

// Official links of the claim, for the footer line (sources without a verified URL are left out).
export function sourcesAffirmation(a: Affirmation) {
  const liens = [
    ...(a.origine.source ? [{ label: `Origine : ${a.origine.qui}`, href: a.origine.source }] : []),
    ...a.indicateurs.flatMap((i) =>
      i.sources.flatMap((s) => (s.url ? [{ label: `${s.publication} — ${s.organisme}`, href: s.url }] : [])),
    ),
  ];
  return liens.filter((l, k) => liens.findIndex((m) => m.href === l.href && m.label === l.label) === k);
}
