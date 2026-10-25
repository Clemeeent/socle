import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dossiers, formatDate, getCritere, getTexte, grille, lienCritere, scrutinDe } from "@/lib/data";
import { classementPartis } from "@/lib/stats";
import { Classement } from "@/components/Classement";
import { Deplier } from "@/components/Deplier";
import { Hemicycle } from "@/components/Hemicycle";
import { PiedFiche } from "@/components/PiedFiche";

export const dynamicParams = false;
export const generateStaticParams = () => grille.textes.map((t) => ({ id: t.id }));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: getTexte(id)?.titreCourt };
}

export default async function TextePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const texte = getTexte(id);
  if (!texte) notFound();
  const s = scrutinDe(texte);
  const d = dossiers[texte.dossierRef];
  const prom = d.promulgation;
  const adopte = s.sort === "adopté";

  return (
    <article>
      <nav aria-label="Fil d'Ariane" className="text-xs text-ink-3">
        {texte.criteres.map((c, i) => (
          <span key={c}>
            {i > 0 && " · "}
            <Link href={lienCritere(c)} className="text-ink-3">{getCritere(c)?.label}</Link>
          </span>
        ))}
      </nav>
      <h1 className="mt-1 text-2xl font-bold leading-tight">{texte.titreCourt}</h1>

      <p className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className={`rounded px-2 py-0.5 text-sm font-semibold ${adopte ? "bg-accent-soft text-accent" : "bg-bg-alt text-ink-2"}`}>
          {adopte ? "Adopté" : "Rejeté"}
        </span>
        <span className="text-lg font-semibold tabular-nums">
          {s.decompte.pour} pour · {s.decompte.contre} contre
        </span>
        <span className="text-sm text-ink-3">le {formatDate(s.date)}</span>
      </p>

      <div className="mt-5">
        <Classement
          intro="Part des députés de chaque parti ayant voté pour :"
          periode=""
          vues={[{ id: texte.id, label: "", chapeau: "", nTextes: 1, lignes: classementPartis([texte]) }]}
        />
      </div>

      <div className="mt-8 border-t border-line">
        <Deplier titre="L'hémicycle, député par député">
          <Hemicycle scrutin={s} />
          <p className="mt-2 text-xs text-ink-3">Couleur = groupe, remplissage = vote. Survolez un point pour le nom.</p>
        </Deplier>
        <Deplier titre="Le texte">
          <p className="text-sm leading-relaxed text-ink-2">
            Vote sur {s.titre.replace(/\.$/, "")} ({s.typeVote}), {s.decompte.abstention} abstentions.
            {prom && <> Loi publiée au Journal officiel le {formatDate(prom.dateJO)}.</>}
          </p>
          <p className="mt-2 text-sm italic text-ink-3">Résumé neutre du contenu : à rédiger et à faire valider par un juriste.</p>
          <p className="mt-3 flex flex-wrap gap-3 text-sm">
            {prom?.urlLegifrance ? (
              <a href={prom.urlLegifrance} target="_blank" rel="noreferrer">Légifrance ↗</a>
            ) : (
              <span className="text-ink-3">Pas de publication au Journal officiel enregistrée</span>
            )}
            <a href={d.urlAN} target="_blank" rel="noreferrer">Dossier à l&apos;Assemblée ↗</a>
            <a href={s.url} target="_blank" rel="noreferrer">Scrutin n° {s.numero} ↗</a>
          </p>
        </Deplier>
        <Deplier titre="Pourquoi ce texte a été retenu">
          <p className="text-sm leading-relaxed">{texte.justification}</p>
          <p className="mt-2 text-xs text-ink-3">
            Rattachement proposé à partir de : {texte.base}. Statut : {texte.statut}.
          </p>
        </Deplier>
      </div>

      <PiedFiche
        sources={[
          { label: `Scrutin public n° ${s.numero} — Assemblée nationale`, href: s.url },
          { label: `Dossier législatif — ${d.titre}`, href: d.urlAN },
          ...(prom?.urlLegifrance ? [{ label: `Journal officiel du ${formatDate(prom.dateJO)} — Légifrance`, href: prom.urlLegifrance }] : []),
        ]}
      />
    </article>
  );
}
