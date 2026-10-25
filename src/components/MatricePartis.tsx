// Parties × criteria: is there a proposal in the programme, and how did the group vote?
import Link from "next/link";
import { getCritere, getGroupe, partis, propositions, scrutinDe, textesDuCritere, voteDuParti } from "@/lib/data";
import { part, pct } from "@/lib/stats";

function Cellule({ partiId, critere }: { partiId: string; critere: string }) {
  const parti = partis.find((p) => p.id === partiId)!;
  const prop = propositions(partiId, critere);
  let pour = 0;
  let sieges = 0;
  for (const t of textesDuCritere(critere)) {
    const v = voteDuParti(parti, scrutinDe(t));
    if (v) {
      pour += v.pour.length;
      sieges += v.membres;
    }
  }
  return (
    <td className="border-b border-line px-1.5 py-2 align-top">
      <span className="block text-sm font-medium tabular-nums">{sieges ? pct(part(pour, sieges)) : "—"}</span>
      <span className="block text-[10px] leading-tight text-ink-3">
        {prop.etat === "positions"
          ? `${prop.positions.length} prop.`
          : prop.etat === "aucune"
            ? "prog. : rien"
            : "prog. à venir"}
      </span>
    </td>
  );
}

export function MatricePartis({ criteres }: { criteres: string[] }) {
  return (
    <figure>
      <div className="-mx-4 overflow-x-auto px-4">
        <table className="w-full min-w-[20rem] text-left text-xs">
          <thead>
            <tr className="text-[11px] text-ink-3">
              <th className="border-b border-line py-1.5 pr-2 font-medium">Parti</th>
              {criteres.map((c) => (
                <th key={c} className="border-b border-line px-1.5 py-1.5 font-medium leading-tight">
                  {getCritere(c)?.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {partis.map((p) => (
              <tr key={p.id}>
                <th scope="row" className="border-b border-line py-2 pr-2 align-top font-normal">
                  <Link href={`/parti/${p.id}`} className="inline-flex items-center gap-1.5 text-ink no-underline hover:underline">
                    <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: getGroupe(p.groupes[0])!.couleur }} />
                    <span className="font-semibold">{p.sigle}</span>
                  </Link>
                </th>
                {criteres.map((c) => (
                  <Cellule key={c} partiId={p.id} critere={c} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption className="mt-2 text-xs text-ink-3">
        En gros : part des sièges du groupe ayant voté pour les textes du critère. En petit : nombre
        de propositions du programme sur ce critère (« rien » = programme lu, aucune proposition ;
        « à venir » = programme pas encore analysé).
      </figcaption>
    </figure>
  );
}
