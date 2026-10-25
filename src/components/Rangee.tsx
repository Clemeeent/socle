// A closed row "Propose · A voté", opened on tap to show the full comparison.
import { propositions, scrutinDe, textesDuCritere, voteDuParti, type Parti } from "@/lib/data";
import { part, pct } from "@/lib/format";

// Share of the party's group voting "pour" on the texts of a criterion (null if never present).
export function partPour(parti: Parti, critere: string) {
  let pour = 0;
  let membres = 0;
  for (const t of textesDuCritere(critere)) {
    const v = voteDuParti(parti, scrutinDe(t));
    if (v) {
      pour += v.pour.length;
      membres += v.membres;
    }
  }
  return membres ? part(pour, membres) : null;
}

export function resumePropose(partiId: string, critere: string) {
  const p = propositions(partiId, critere);
  if (p.etat === "positions") return `${p.positions.length} proposition${p.positions.length > 1 ? "s" : ""}`;
  return p.etat === "aucune" ? "rien dans le programme" : "programme à venir";
}

export function Rangee({
  titre,
  propose,
  pour,
  children,
}: {
  titre: React.ReactNode;
  propose: string;
  pour: number | null;
  children: React.ReactNode;
}) {
  return (
    <details className="group border-b border-line">
      <summary className="cursor-pointer list-none py-3 [&::-webkit-details-marker]:hidden">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold leading-tight">{titre}</span>
          <span aria-hidden className="text-ink-3 transition-transform group-open:rotate-90 motion-reduce:transition-none">
            ›
          </span>
        </div>
        <div className="mt-1.5 grid grid-cols-2 gap-3 text-xs">
          <span>
            <span className="block text-ink-3">Propose</span>
            <span className="italic text-ink-2">{propose}</span>
          </span>
          <span>
            <span className="block text-ink-3">A voté</span>
            {pour === null ? (
              <span className="italic text-ink-2">pas de vote</span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="h-2 flex-1 overflow-hidden rounded-[3px] bg-bg-alt">
                  <span className="block h-full bg-pour" style={{ width: `${Math.round(pour * 100)}%` }} />
                </span>
                <span className="font-semibold tabular-nums text-ink">{pct(pour)} pour</span>
              </span>
            )}
          </span>
        </div>
      </summary>
      <div className="pb-4 pt-1">{children}</div>
    </details>
  );
}
