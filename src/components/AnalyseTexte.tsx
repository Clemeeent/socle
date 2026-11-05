"use client";

// A long text (post, comment) checked claim by claim. Level 1: the verdict bar and a short answer.
// Level 2: the original text with its claims highlighted; tapping one opens its detail right under
// its paragraph, with previous / next to walk through the text like a slideshow.
import { useRef, useState } from "react";
import { VERDICTS, type Analyse, type Verdict } from "@/lib/data";
import { paletteVerdict } from "./Carte";

const FAMILLES: { verdicts: Verdict[]; un: string; plusieurs: string }[] = [
  { verdicts: ["vrai"], un: "juste", plusieurs: "justes" },
  { verdicts: ["nuance", "depend"], un: "nuancé", plusieurs: "nuancés" },
  { verdicts: ["faux", "dementi"], un: "inexact", plusieurs: "inexacts" },
  { verdicts: ["jugement"], un: "jugement", plusieurs: "jugements" },
];

const mouvementReduit = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Cuts a paragraph around the claims it contains (index = position in a.points).
function morceaux(paragraphe: string, a: Analyse) {
  const trouves = a.points
    .map((p, i) => ({ i, debut: paragraphe.indexOf(p.extrait), fin: 0 }))
    .filter((x) => x.debut >= 0)
    .map((x) => ({ ...x, fin: x.debut + a.points[x.i].extrait.length }))
    .sort((x, y) => x.debut - y.debut);
  const out: { texte: string; point?: number }[] = [];
  let curseur = 0;
  for (const x of trouves) {
    if (x.debut < curseur) continue;
    if (x.debut > curseur) out.push({ texte: paragraphe.slice(curseur, x.debut) });
    out.push({ texte: paragraphe.slice(x.debut, x.fin), point: x.i });
    curseur = x.fin;
  }
  if (curseur < paragraphe.length) out.push({ texte: paragraphe.slice(curseur) });
  return out;
}

export function AnalyseTexte({ a }: { a: Analyse }) {
  const [actif, setActif] = useState<number | null>(null);
  const detail = useRef<HTMLDivElement>(null);
  const n = a.points.length;

  function ouvrir(i: number | null) {
    setActif(i);
    if (i === null) return;
    // Bring the detail into view and give it focus, after it has rendered.
    requestAnimationFrame(() => {
      detail.current?.scrollIntoView({ behavior: mouvementReduit() ? "auto" : "smooth", block: "nearest" });
      detail.current?.focus({ preventScroll: true });
    });
  }

  const sources = a.points.flatMap((p) => p.sources);
  const uniques = sources.filter((s, k) => sources.findIndex((x) => x.url === s.url) === k);

  return (
    <section>
      <p className="text-xs text-ink-3">
        <span aria-hidden className="mr-1.5 text-accent">✦</span>
        Analyse {a.redaction.par === "ia" ? "générée par IA" : "rédigée"} · {n} passages vérifiés · {a.source} ·{" "}
        <span className={a.redaction.relu ? "text-ok-ink" : "text-warn-ink"}>{a.redaction.relu ? "relue" : "non relue"}</span>
      </p>
      <h2 className="mt-2 text-[1.6rem] font-extrabold leading-tight tracking-tight">{a.titre}</h2>

      {/* Overview: one segment per claim, in reading order. */}
      <div className="mt-5">
        <div className="flex gap-1" role="group" aria-label="Les passages vérifiés, dans l'ordre du texte">
          {a.points.map((p, i) => {
            const c = paletteVerdict(p.verdict);
            return (
              <button
                key={i}
                type="button"
                onClick={() => ouvrir(i)}
                aria-label={`Passage ${i + 1} : ${p.label}, ${VERDICTS[p.verdict].court}`}
                className={`h-3 flex-1 rounded-full transition-transform hover:scale-y-150 motion-reduce:transition-none ${actif === i ? "ring-2 ring-ink ring-offset-2" : ""}`}
                style={{ background: c.formes[1] }}
              />
            );
          })}
        </div>
        <p className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-2">
          {FAMILLES.map((f) => {
            const k = a.points.filter((p) => f.verdicts.includes(p.verdict)).length;
            if (!k) return null;
            return (
              <span key={f.un} className="flex items-center gap-1.5">
                <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ background: paletteVerdict(f.verdicts[0]).formes[1] }} />
                {k} {k > 1 ? f.plusieurs : f.un}
              </span>
            );
          })}
        </p>
      </div>
      <p className="mt-5 text-[1.05rem] leading-relaxed">{a.enBref}</p>

      <h3 className="mt-10 text-lg font-bold">Le texte, passage par passage</h3>
      <p className="mt-1 text-sm text-ink-3">Texte original, tel qu&apos;écrit. Touche un passage surligné pour voir ce qu&apos;en disent les sources.</p>

      <div lang={a.langue} className="mt-4 space-y-4 text-[1.02rem] leading-[1.8] text-ink-2">
        {a.texte.map((paragraphe, pi) => {
          const parts = morceaux(paragraphe, a);
          const ouvertIci = actif !== null && parts.some((m) => m.point === actif);
          return (
            <div key={pi}>
              <p>
                {parts.map((m, k) => {
                  if (m.point === undefined) return <span key={k}>{m.texte}</span>;
                  const i = m.point;
                  const c = paletteVerdict(a.points[i].verdict);
                  return (
                    // A span, not a <button>: buttons can't wrap across lines like the words around them.
                    <span
                      key={k}
                      role="button"
                      tabIndex={0}
                      onClick={() => ouvrir(actif === i ? null : i)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          ouvrir(actif === i ? null : i);
                        }
                      }}
                      aria-expanded={actif === i}
                      aria-controls="detail-passage"
                      className="cursor-pointer rounded px-0.5 text-ink outline-offset-2 [-webkit-box-decoration-break:clone] [box-decoration-break:clone]"
                      style={{
                        background: c.fond,
                        boxShadow: actif === i ? `inset 0 -3px 0 ${c.formes[2]}` : `inset 0 -2px 0 ${c.formes[2]}`,
                        fontWeight: actif === i ? 600 : undefined,
                      }}
                    >
                      {m.texte}
                      <sup className="ml-0.5 font-sans text-[0.7em] font-bold" style={{ color: c.formes[2] }}>
                        {i + 1}
                      </sup>
                    </span>
                  );
                })}
              </p>

              {ouvertIci && actif !== null && (
                <Detail
                  a={a}
                  i={actif}
                  refDetail={detail}
                  onNaviguer={(j) => ouvrir(j)}
                  onFermer={() => setActif(null)}
                />
              )}
            </div>
          );
        })}
      </div>

      {a.debat.length > 0 && (
        <section className="mt-10">
          <h3 className="text-lg font-bold">Pour lancer le débat</h3>
          <p className="mt-1 text-sm text-ink-3">Là, les chiffres ne tranchent plus : ce sont des choix.</p>
          <ul className="mt-3 space-y-2">
            {a.debat.map((q) => (
              <li key={q.question} className="flex gap-3 text-[1.05rem] leading-snug">
                <span aria-hidden className="text-accent">→</span>
                <span>{q.question}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10">
        <h3 className="text-sm font-semibold text-ink-3">Sources</h3>
        <ul className="mt-2 space-y-1.5 text-sm">
          {uniques.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.label} ↗
              </a>
              <span className="ml-1 text-xs text-warn-ink">· {s.statut}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-ink-3">Chiffres relevés par recherche, à vérifier sur les sources.</p>
      </section>
    </section>
  );
}

function Detail({
  a,
  i,
  refDetail,
  onNaviguer,
  onFermer,
}: {
  a: Analyse;
  i: number;
  refDetail: React.RefObject<HTMLDivElement | null>;
  onNaviguer: (j: number) => void;
  onFermer: () => void;
}) {
  const p = a.points[i];
  const c = paletteVerdict(p.verdict);
  const n = a.points.length;
  return (
    <div
      id="detail-passage"
      ref={refDetail}
      tabIndex={-1}
      role="region"
      aria-label={`Passage ${i + 1} sur ${n} : ${p.label}`}
      className="apparait mt-3 scroll-mt-20 rounded-2xl p-4 font-sans text-ink outline-none"
      style={{ background: c.fond }}
      lang="fr"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold" style={{ color: c.formes[2] }}>
          {VERDICTS[p.verdict].court}
        </span>
        <button type="button" onClick={onFermer} aria-label="Fermer le détail" className="px-2 text-lg text-ink-3">
          ×
        </button>
      </div>
      <h4 className="mt-2 text-lg font-bold leading-snug">{p.label}</h4>
      <p className="mt-1.5 leading-relaxed">{p.explication}</p>
      {p.sources.length > 0 && (
        <ul className="mt-2 space-y-0.5 text-xs">
          {p.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.label} ↗
              </a>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 flex items-center justify-between text-sm font-semibold">
        <button type="button" disabled={i === 0} onClick={() => onNaviguer(i - 1)} className="py-1 disabled:opacity-30">
          ← Précédent
        </button>
        <span className="text-xs font-normal text-ink-3">
          {i + 1} / {n}
        </span>
        <button type="button" disabled={i === n - 1} onClick={() => onNaviguer(i + 1)} className="py-1 disabled:opacity-30">
          Suivant →
        </button>
      </div>
    </div>
  );
}
