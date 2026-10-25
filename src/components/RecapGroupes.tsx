// One row per parliamentary group, in hemicycle order (left to right).
import { CATEGORIES, part, pct, type LigneGroupe } from "@/lib/stats";
import { GroupeTag } from "./GroupeTag";
import { VoteBar, VoteLegende } from "./VoteBar";

export function RecapGroupes({ lignes, totalTextes }: { lignes: LigneGroupe[]; totalTextes: number }) {
  return (
    <figure>
      <VoteLegende />
      <ul className="mt-3 space-y-2.5">
        {lignes.map((l) => (
          <li key={l.groupe.organeRef} className="grid grid-cols-[5.5rem_1fr_3rem] items-center gap-2 text-sm">
            <span className="truncate" title={l.groupe.libelle}>
              <GroupeTag g={l.groupe} />
            </span>
            <VoteBar r={l.total} label={l.groupe.libelle} />
            <span className="text-right tabular-nums font-medium">{pct(part(l.total.pour, l.total.membres))}</span>
            {l.textes < totalTextes && (
              <span className="col-start-2 col-span-2 -mt-1.5 text-xs text-ink-3">
                Groupe présent pour {l.textes} texte{l.textes > 1 ? "s" : ""} sur {totalTextes}
              </span>
            )}
          </li>
        ))}
      </ul>
      <figcaption className="mt-3 text-xs text-ink-3">
        Chiffre à droite : part des sièges du groupe ayant voté « pour »
        {totalTextes > 1 ? ", tous textes retenus confondus" : ""}. Les absents comptent dans le total.
      </figcaption>
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-accent">Voir le tableau des chiffres</summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-xs tabular-nums">
            <thead>
              <tr className="border-b border-line text-left text-ink-3">
                <th className="py-1 pr-2 font-medium">Groupe</th>
                {CATEGORIES.map((c) => (
                  <th key={c.key} className="py-1 px-1 text-right font-medium">{c.label}</th>
                ))}
                <th className="py-1 pl-1 text-right font-medium">Sièges</th>
              </tr>
            </thead>
            <tbody>
              {lignes.map((l) => (
                <tr key={l.groupe.organeRef} className="border-b border-line">
                  <td className="py-1 pr-2">{l.groupe.sigle}</td>
                  {CATEGORIES.map((c) => (
                    <td key={c.key} className="py-1 px-1 text-right">{l.total[c.key]}</td>
                  ))}
                  <td className="py-1 pl-1 text-right">{l.total.membres}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-1 text-xs text-ink-3">
            « Sièges » = somme, sur les textes retenus, de l&apos;effectif du groupe le jour du vote.
          </p>
        </div>
      </details>
    </figure>
  );
}
