import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { documentsDuParti, getGroupe, grille, meta, partis, getParti, positions, scrutinDe, lienCritere } from "@/lib/data";
import { EtatVide, FicheMeta, Sources } from "@/components/Fiche";
import { GroupeTag } from "@/components/GroupeTag";
import { Confrontation, SourceBadge } from "@/components/Confrontation";
import { VoteLegende } from "@/components/VoteBar";

export const dynamicParams = false;
export const generateStaticParams = () => partis.map((p) => ({ id: p.id }));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: getParti(id)?.nom };
}

export default async function PartiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = getParti(id);
  if (!p) notFound();
  const docs = documentsDuParti(p.id);
  const verifie = positions.some((x) => x.parti === p.id) && positions.filter((x) => x.parti === p.id).every((x) => x.statut === "vérifié");

  return (
    <article>
      <p className="text-xs uppercase tracking-wide text-ink-3">Parti</p>
      <h1 className="mt-1 text-2xl font-bold leading-tight">{p.nom}</h1>
      <div className="mt-2">
        <FicheMeta miseAJour={meta.importeLe} verifie={verifie} />
      </div>
      <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span className="text-ink-3">Groupe à l&apos;Assemblée :</span>
        {p.groupes.map((g) => (
          <GroupeTag key={g} g={getGroupe(g)!} long />
        ))}
      </p>
      {p.remarque && <p className="mt-1 text-xs text-ink-3">{p.remarque}</p>}

      <section className="mt-5 rounded bg-bg-alt p-3">
        <h2 className="text-sm font-semibold">Source du programme</h2>
        {docs.length ? (
          <ul className="mt-2 space-y-1 text-sm">
            {docs.map((d) => (
              <li key={d.id}>
                <span className="flex flex-wrap items-center gap-2">
                  <SourceBadge doc={d} />
                  <a href={d.url} target="_blank" rel="noreferrer">
                    {d.titre} ↗
                  </a>
                </span>
                <span className="mt-0.5 block text-xs text-ink-3">
                  {d.criteresAnalyses.length
                    ? `Analysé pour ${d.criteresAnalyses.length} critère${d.criteresAnalyses.length > 1 ? "s" : ""} sur ${grille.criteres.length}.`
                    : "Document identifié, pas encore analysé."}
                  {d.remarque && ` ${d.remarque}`}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-2">
            <EtatVide>
              Programme pas encore analysé. Ordre de recherche : programme 2027, sinon programme
              présidentiel 2022, sinon texte officiel du parti.
            </EtatVide>
          </div>
        )}
      </section>

      <div className="mt-6 flex justify-end">
        <VoteLegende />
      </div>
      {grille.criteres.map((c) => (
        <section key={c.id} className="mt-4 rounded border border-line p-3">
          <h2 className="mb-3 font-semibold">
            <Link href={lienCritere(c.id)} className="text-ink no-underline hover:underline">
              {c.label}
            </Link>
          </h2>
          <Confrontation parti={p} critere={c.id} />
        </section>
      ))}

      <Sources
        items={[
          ...docs.map((d) => ({ label: `${d.titre}${d.annee ? ` (${d.annee})` : ""}`, href: d.url })),
          ...grille.textes.map((t) => ({ label: `Scrutin n° ${scrutinDe(t).numero} — ${t.titreCourt}`, href: scrutinDe(t).url })),
        ]}
      />
    </article>
  );
}
