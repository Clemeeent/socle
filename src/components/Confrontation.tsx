// The heart of Socle: what a party proposes next to what its group voted, on one criterion.
import Link from "next/link";
import {
  getDocument,
  propositions,
  scrutinDe,
  textesDuCritere,
  voteDuParti,
  type DocumentProgramme,
  type Parti,
} from "@/lib/data";
import { part, pct, repartition } from "@/lib/stats";
import { VoteBar } from "./VoteBar";

const TYPE_LABEL: Record<DocumentProgramme["type"], string> = {
  "programme-2027": "Programme 2027",
  "programme-presidentiel-2022": "Programme présidentiel 2022",
  "texte-officiel": "Texte officiel du parti",
};

export function SourceBadge({ doc }: { doc: DocumentProgramme }) {
  const label = doc.type === "texte-officiel" ? `${TYPE_LABEL[doc.type]} · ${doc.annee}` : TYPE_LABEL[doc.type];
  return (
    <span title={doc.titre} className="inline-block rounded bg-bg-alt px-1.5 py-0.5 text-[11px] font-medium text-ink-2 ring-1 ring-line">
      {label}
    </span>
  );
}

const MAJORITE: Record<string, string> = { pour: "majorité pour", contre: "majorité contre", abstention: "majorité abstention" };

function Propositions({ parti, critere }: { parti: Parti; critere: string }) {
  const p = propositions(parti.id, critere);
  if (p.etat === "non-analyse")
    return <p className="text-xs italic text-ink-3">Programme pas encore analysé</p>;
  if (p.etat === "aucune")
    return <p className="text-xs italic text-ink-3">Pas de proposition trouvée dans le programme</p>;
  return (
    <ul className="space-y-3">
      {p.positions.map((pos) => {
        const doc = getDocument(pos.document)!;
        return (
          <li key={pos.id} className="text-sm">
            <p className="font-medium leading-snug">{pos.resume}</p>
            <blockquote className="mt-1 border-l-2 border-line pl-2 text-xs italic leading-snug text-ink-2">
              « {pos.citation} »
            </blockquote>
            <p className="mt-1 flex flex-wrap items-center gap-1 text-[11px] text-ink-3">
              <SourceBadge doc={doc} />
              <a href={`${pos.lien}#page=${pos.page}`} target="_blank" rel="noreferrer">
                p. {pos.page} ↗
              </a>
              <span>· {pos.statut}</span>
            </p>
          </li>
        );
      })}
    </ul>
  );
}

function Votes({ parti, critere }: { parti: Parti; critere: string }) {
  const textes = textesDuCritere(critere);
  if (textes.length === 0) return <p className="text-xs italic text-ink-3">Aucun texte retenu</p>;
  return (
    <ul className="space-y-2.5">
      {textes.map((t) => {
        const s = scrutinDe(t);
        const v = voteDuParti(parti, s);
        return (
          <li key={t.id} className="text-xs">
            <Link href={`/texte/${t.id}`} className="block leading-snug text-ink no-underline hover:underline">
              {t.titreCourt}
            </Link>
            {v ? (
              <>
                <div className="mt-1">
                  <VoteBar r={repartition(v)} label={`${parti.sigle} — ${t.titreCourt}`} />
                </div>
                <p className="mt-0.5 text-ink-3">
                  <span className="font-medium text-ink-2">{pct(part(v.pour.length, v.membres))} pour</span> ·{" "}
                  {MAJORITE[v.positionMajoritaire] ?? v.positionMajoritaire}
                </p>
              </>
            ) : (
              <p className="mt-0.5 italic text-ink-3">Groupe pas encore constitué lors de ce vote</p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function Confrontation({ parti, critere }: { parti: Parti; critere: string }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="min-w-0">
        <h4 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-3">Ce qu&apos;ils proposent</h4>
        <Propositions parti={parti} critere={critere} />
      </div>
      <div className="min-w-0 border-l border-line pl-3">
        <h4 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-3">Ce qu&apos;ils ont voté</h4>
        <Votes parti={parti} critere={critere} />
      </div>
    </div>
  );
}
