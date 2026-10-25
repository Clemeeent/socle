import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dossiers, formatDate, getCritere, grille, meta, scrutinDe, getTexte } from "@/lib/data";
import { parGroupe } from "@/lib/stats";
import { EtatVide, FicheMeta, Sources } from "@/components/Fiche";
import { Hemicycle } from "@/components/Hemicycle";
import { RecapGroupes } from "@/components/RecapGroupes";

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

  return (
    <article>
      <p className="text-xs uppercase tracking-wide text-ink-3">Fiche texte</p>
      <h1 className="mt-1 text-2xl font-bold leading-tight">{texte.titreCourt}</h1>
      <div className="mt-2">
        <FicheMeta miseAJour={meta.importeLe} />
      </div>

      <section className="mt-6">
        <h2 className="text-lg font-semibold">Résumé</h2>
        <p className="mt-2 leading-relaxed">
          Vote de l&apos;Assemblée nationale sur {s.titre.replace(/\.$/, "")}, le {formatDate(s.date)}.
          Résultat : <strong>{s.sort}</strong> par {s.decompte.pour} voix pour, {s.decompte.contre} contre
          et {s.decompte.abstention} abstentions ({s.typeVote}).{" "}
          {prom ? <>Loi publiée au Journal officiel le {formatDate(prom.dateJO)}.</> : null}
        </p>
        <div className="mt-3">
          <EtatVide>Résumé neutre du contenu du texte : à rédiger et à faire valider par un juriste.</EtatVide>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          {prom?.urlLegifrance ? (
            <a className="rounded border border-line px-3 py-1.5 no-underline hover:bg-bg-alt" href={prom.urlLegifrance} target="_blank" rel="noreferrer">
              Texte sur Légifrance ↗
            </a>
          ) : (
            <span className="rounded border border-dashed border-line px-3 py-1.5 text-ink-3">
              Pas de publication au Journal officiel enregistrée
            </span>
          )}
          <a className="rounded border border-line px-3 py-1.5 no-underline hover:bg-bg-alt" href={d.urlAN} target="_blank" rel="noreferrer">
            Dossier à l&apos;Assemblée ↗
          </a>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Le vote, député par député</h2>
        <p className="mt-1 text-sm text-ink-3">
          Scrutin public n° {s.numero} · {formatDate(s.date)} · couleur = groupe, remplissage = vote.
          Survolez un point pour voir le nom.
        </p>
        <div className="mt-3">
          <Hemicycle scrutin={s} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Par groupe</h2>
        <div className="mt-3">
          <RecapGroupes lignes={parGroupe([texte])} totalTextes={1} />
        </div>
      </section>

      <section className="mt-8 rounded bg-bg-alt p-4">
        <h2 className="text-base font-semibold">Pourquoi ce texte est dans la grille</h2>
        <ul className="mt-2 flex flex-wrap gap-2">
          {texte.criteres.map((c) => (
            <li key={c}>
              <Link href={`/grille/${c}`} className="rounded-full bg-white px-2.5 py-0.5 text-xs no-underline border border-line">
                {getCritere(c)?.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm leading-relaxed">{texte.justification}</p>
        <p className="mt-2 text-xs text-ink-3">
          Rattachement proposé à partir de : {texte.base}. Statut : <strong>{texte.statut}</strong>.
        </p>
      </section>

      <Sources
        items={[
          { label: `Scrutin public n° ${s.numero} — Assemblée nationale`, href: s.url },
          { label: `Dossier législatif — ${d.titre}`, href: d.urlAN },
          ...(prom?.urlLegifrance ? [{ label: `Journal officiel du ${formatDate(prom.dateJO)} — Légifrance`, href: prom.urlLegifrance }] : []),
        ]}
      />
    </article>
  );
}
