import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  dossiers,
  formatDate,
  getCritere,
  getDossier,
  getGroupe,
  groupesSansParti,
  lienCritere,
  lienDossier,
  partis,
  scrutinDe,
  textesDuCritere,
} from "@/lib/data";
import { part, pct, periode, repartition } from "@/lib/stats";
import { Confrontation } from "@/components/Confrontation";
import { couleurDossier } from "@/components/Dossier";
import { Deplier } from "@/components/Deplier";
import { GroupeTag } from "@/components/GroupeTag";
import { PiedFiche } from "@/components/PiedFiche";
import { Rangee, partPour, resumePropose } from "@/components/Rangee";

export const dynamicParams = false;
export const generateStaticParams = () => dossiers.flatMap((d) => d.criteres.map((c) => ({ id: d.id, critere: c.id })));

export async function generateMetadata({ params }: { params: Promise<{ id: string; critere: string }> }): Promise<Metadata> {
  const { critere } = await params;
  return { title: getCritere(critere)?.question };
}

export default async function QuestionDossierPage({ params }: { params: Promise<{ id: string; critere: string }> }) {
  const { id, critere } = await params;
  const d = getDossier(id);
  const c = getCritere(critere);
  if (!d || !c || !d.criteres.includes(c)) notFound();
  const textes = textesDuCritere(c.id);
  const lignes = partis.map((p) => ({ p, pour: partPour(p, c.id) })).toSorted((a, b) => (b.pour ?? -1) - (a.pour ?? -1));
  const autres = groupesSansParti().filter((g) => textes.some((t) => scrutinDe(t).groupes.some((v) => v.organeRef === g.organeRef)));
  const p = couleurDossier(d.couleur);

  return (
    <article>
      <Link
        href={lienDossier(d.id)}
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider no-underline"
        style={{ background: p.bg, color: p.ink }}
      >
        ← Dossier {d.titre}
      </Link>
      <h1 className="mt-3 text-[1.75rem] leading-tight">{c.question}</h1>
      <p className="mt-2 text-lg leading-snug text-ink-2">
        Sur {textes.length} texte{textes.length > 1 ? "s" : ""} voté{textes.length > 1 ? "s" : ""} en {periode(textes)} {c.chapeau} :
      </p>
      {textes.length < 2 && <p className="mt-2 text-sm text-warn-ink">Un seul texte : trop peu pour conclure.</p>}

      <div className="mt-4 border-t border-line">
        {lignes.map(({ p: parti, pour }) => (
          <Rangee
            key={parti.id}
            titre={
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: getGroupe(parti.groupes[0])!.couleur }} />
                {parti.nom}
              </span>
            }
            propose={resumePropose(parti.id, c.id)} pour={pour}>
            <Confrontation parti={parti} critere={c.id} />
            <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-3">
              Faisabilité juridique :
              <span className="rounded bg-warn-bg px-1.5 py-0.5 font-medium text-warn-ink">À analyser par un juriste</span>
            </p>
            <Link href={`/parti/${parti.id}`} className="mt-2 inline-block text-sm">Tout sur {parti.nom} →</Link>
          </Rangee>
        ))}
      </div>

      <div className="mt-6 border-t border-line">
        <Deplier titre={`Les ${textes.length} texte${textes.length > 1 ? "s" : ""} retenu${textes.length > 1 ? "s" : ""}`}>
          <ul className="space-y-3">
            {textes.map((t) => {
              const s = scrutinDe(t);
              return (
                <li key={t.id}>
                  <Link href={`/texte/${t.id}`} className="font-medium">{t.titreCourt}</Link>
                  <p className="text-xs text-ink-3">{formatDate(s.date)} · {s.sort} {s.decompte.pour}–{s.decompte.contre}</p>
                </li>
              );
            })}
          </ul>
        </Deplier>
        <Deplier titre={`Critère : ${c.label}`}>
          <p className="text-sm leading-relaxed text-ink-2">{c.definition}</p>
          <p className="mt-2 text-sm"><Link href="/methode">Toute la méthode →</Link></p>
        </Deplier>
        {autres.length > 0 && (
          <Deplier titre="Groupes sans parti associé">
            <ul className="space-y-2 text-sm">
              {autres.map((g) => {
                let pour = 0;
                let membres = 0;
                for (const t of textes) {
                  const v = scrutinDe(t).groupes.find((x) => x.organeRef === g.organeRef);
                  if (v) {
                    const r = repartition(v);
                    pour += r.pour;
                    membres += r.membres;
                  }
                }
                return (
                  <li key={g.organeRef} className="flex justify-between gap-2">
                    <GroupeTag g={g} long />
                    <span className="shrink-0 tabular-nums">{pct(part(pour, membres))} pour</span>
                  </li>
                );
              })}
            </ul>
          </Deplier>
        )}
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-ink-3">Les autres questions du dossier</h2>
        <ul className="mt-2 space-y-1.5">
          {d.criteres
            .filter((x) => x.id !== c.id)
            .map((x) => (
              <li key={x.id}>
                <Link href={lienCritere(x.id)}>{x.question}</Link>
              </li>
            ))}
        </ul>
      </section>

      <PiedFiche sources={textes.map((t) => ({ label: `Scrutin n° ${scrutinDe(t).numero} — ${t.titreCourt}`, href: scrutinDe(t).url }))} />
    </article>
  );
}
