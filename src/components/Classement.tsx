"use client";

// Level 1 answer: parties ranked by share of their deputies who voted "pour".
// Tapping a criterion filters; tapping a party opens the detail per text.
import Link from "next/link";
import { useState } from "react";
import type { LignePartiData } from "@/lib/stats";
import { VoteBar, VoteLegende } from "./VoteBar";

export type Vue = { id: string; label: string; chapeau: string; nTextes: number; lignes: LignePartiData[] };

const pctOf = (n: number, d: number) => (d === 0 ? 0 : Math.round((n * 100) / d));

// Every party with the same rounded share as the reference one (ties are named together).
function exAequo(lignes: LignePartiData[], ref: LignePartiData) {
  const p = pctOf(ref.total.pour, ref.total.membres);
  return lignes
    .filter((l) => pctOf(l.total.pour, l.total.membres) === p)
    .map((l) => l.sigle)
    .join(", ");
}

export function Classement({ vues, periode, intro }: { vues: Vue[]; periode: string; intro?: string }) {
  const [vueId, setVueId] = useState(vues[0].id);
  const vue = vues.find((v) => v.id === vueId)!;
  const lignes = vue.lignes.filter((l) => l.total.membres > 0);
  const haut = lignes[0];
  const bas = lignes[lignes.length - 1];

  return (
    <section>
      <p className="text-lg leading-snug">
        {intro ?? (
          <>
            Sur {vue.nTextes} texte{vue.nTextes > 1 ? "s" : ""} voté{vue.nTextes > 1 ? "s" : ""} en {periode}{" "}
            {vue.chapeau} :
          </>
        )}
      </p>

      {vues.length > 1 && (
        <div role="tablist" aria-label="Filtrer par critère" className="-mx-4 mt-3 flex gap-1.5 overflow-x-auto px-4 pb-1">
          {vues.map((v) => (
            <button
              key={v.id}
              role="tab"
              aria-selected={v.id === vueId}
              onClick={() => setVueId(v.id)}
              className={`shrink-0 rounded-full border px-3 py-1 text-sm ${
                v.id === vueId ? "border-ink bg-ink text-white" : "border-line text-ink-2"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      )}

      <ol className="mt-4">
        {lignes.map((l) => {
          const p = pctOf(l.total.pour, l.total.membres);
          return (
            <li key={l.id}>
              <details className="group">
                <summary className="grid cursor-pointer list-none grid-cols-[6.25rem_1fr_2.75rem] items-center gap-2 py-1.5 [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center gap-1.5 text-sm font-semibold">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: l.couleur }} />
                    {l.sigle}
                  </span>
                  <span className="h-4 overflow-hidden rounded-[4px] bg-bg-alt">
                    <span className="block h-full rounded-[4px] bg-pour" style={{ width: `${p}%` }} />
                  </span>
                  <span className="text-right text-sm font-semibold tabular-nums">{p} %</span>
                </summary>
                <div className="mb-3 ml-0 mt-1 rounded bg-bg-alt p-3 text-xs">
                  <p className="font-medium">{l.nom}</p>
                  <ul className="mt-2 space-y-2">
                    {l.textes.map((t) => (
                      <li key={t.id}>
                        <Link href={`/texte/${t.id}`} className="text-ink no-underline hover:underline">
                          {t.titre}
                        </Link>
                        {t.r ? (
                          <>
                            <div className="mt-1">
                              <VoteBar r={t.r} label={`${l.sigle} — ${t.titre}`} />
                            </div>
                            <p className="mt-0.5 text-ink-3">
                              {t.r.pour} pour · {t.r.contre} contre · {t.r.abstention} abst. · {t.r.absent} absents
                            </p>
                          </>
                        ) : (
                          <p className="text-ink-3 italic">Groupe pas encore constitué lors de ce vote</p>
                        )}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3">
                    <VoteLegende />
                  </div>
                  <Link href={`/parti/${l.id}`} className="mt-3 inline-block">
                    Propositions et votes de {l.sigle} →
                  </Link>
                </div>
              </details>
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-xs text-ink-3">
        % de leurs députés ayant voté pour (absents compris). Touchez un parti pour le détail.
      </p>
      {haut && bas && haut.id !== bas.id && (
        <p className="mt-4 leading-relaxed">
          Le plus pour : <strong>{exAequo(lignes, haut)}</strong> ({pctOf(haut.total.pour, haut.total.membres)} %).
          <br />
          Le moins : <strong>{exAequo(lignes, bas)}</strong> ({pctOf(bas.total.pour, bas.total.membres)} %).
        </p>
      )}
    </section>
  );
}
