import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { documentsDuParti, getGroupe, getParti, grille, lienCritere, partis, positions, scrutinDe } from "@/lib/data";
import { Confrontation, SourceBadge } from "@/components/Confrontation";
import { Deplier } from "@/components/Deplier";
import { PiedFiche } from "@/components/PiedFiche";
import { Rangee, partPour, resumePropose } from "@/components/Rangee";

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
  const siens = positions.filter((x) => x.parti === p.id);
  const verifie = siens.length > 0 && siens.every((x) => x.statut === "vérifié");
  const groupes = p.groupes.map((g) => getGroupe(g)!);

  return (
    <article>
      <nav aria-label="Fil d'Ariane" className="text-xs text-ink-3">
        <Link href="/#partis" className="text-ink-3">Partis</Link>
      </nav>
      <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold leading-tight">
        <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: groupes[0].couleur }} />
        {p.nom}
      </h1>
      <p className="mt-2 text-lg leading-snug">Ce qu&apos;il propose, et ce que ses députés ont voté, critère par critère :</p>

      <div className="mt-4 border-t border-line">
        {grille.criteres.map((c) => (
          <Rangee key={c.id} titre={c.label} propose={resumePropose(p.id, c.id)} pour={partPour(p, c.id)}>
            <Confrontation parti={p} critere={c.id} />
            <Link href={lienCritere(c.id)} className="mt-3 inline-block text-sm">
              Comparer avec les autres partis →
            </Link>
          </Rangee>
        ))}
      </div>

      <div className="mt-6 border-t border-line">
        <Deplier
          titre={
            <>
              Source du programme{" "}
              <span className="font-normal text-ink-3">· {docs.length ? docs[0].titre : "à venir"}</span>
            </>
          }
        >
          {docs.length ? (
            <ul className="space-y-2 text-sm">
              {docs.map((d) => (
                <li key={d.id}>
                  <span className="flex flex-wrap items-center gap-2">
                    <SourceBadge doc={d} />
                    <a href={d.url} target="_blank" rel="noreferrer">{d.titre} ↗</a>
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
            <p className="text-sm text-ink-2">
              Aucun programme analysé pour l&apos;instant. Ordre de recherche : programme 2027, sinon programme
              présidentiel 2022, sinon texte officiel du parti.
            </p>
          )}
        </Deplier>
        <Deplier titre="Ses députés à l'Assemblée">
          <p className="text-sm text-ink-2">
            Votes du groupe {groupes.map((g) => `${g.libelle} (${g.sigle})`).join(", puis ")}.
          </p>
          {p.remarque && <p className="mt-1 text-xs text-ink-3">{p.remarque}</p>}
          <p className="mt-2 text-sm"><Link href="/methode#partis">Correspondance partis ↔ groupes →</Link></p>
        </Deplier>
      </div>

      <PiedFiche
        verifie={verifie}
        sources={[
          ...docs.map((d) => ({ label: `${d.titre}${d.annee ? ` (${d.annee})` : ""}`, href: d.url })),
          ...grille.textes.map((t) => ({ label: `Scrutin n° ${scrutinDe(t).numero} — ${t.titreCourt}`, href: scrutinDe(t).url })),
        ]}
      />
    </article>
  );
}
