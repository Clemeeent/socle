import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatDate,
  getCritere,
  grille,
  groupesSansParti,
  lienCritere,
  lienTheme,
  partis,
  scrutinDe,
  textesDuCritere,
  theme,
} from "@/lib/data";
import { part, pct, repartition } from "@/lib/stats";
import { Confrontation } from "@/components/Confrontation";
import { Deplier } from "@/components/Deplier";
import { GroupeTag } from "@/components/GroupeTag";
import { PiedFiche } from "@/components/PiedFiche";
import { Rangee, partPour, resumePropose } from "@/components/Rangee";
import { periode } from "@/lib/stats";

export const dynamicParams = false;
export const generateStaticParams = () => grille.criteres.map((c) => ({ theme: theme.id, critere: c.id }));

export async function generateMetadata({ params }: { params: Promise<{ theme: string; critere: string }> }): Promise<Metadata> {
  const { critere } = await params;
  return { title: getCritere(critere)?.label };
}

export default async function CriterePage({ params }: { params: Promise<{ theme: string; critere: string }> }) {
  const { theme: themeId, critere } = await params;
  const c = getCritere(critere);
  if (!c || themeId !== theme.id) notFound();
  const textes = textesDuCritere(c.id);
  const lignes = partis
    .map((p) => ({ p, pour: partPour(p, c.id) }))
    .toSorted((a, b) => (b.pour ?? -1) - (a.pour ?? -1));
  const autres = groupesSansParti().filter((g) => textes.some((t) => scrutinDe(t).groupes.some((v) => v.organeRef === g.organeRef)));

  return (
    <article>
      <nav aria-label="Fil d'Ariane" className="text-xs text-ink-3">
        <Link href="/#themes" className="text-ink-3">Thèmes</Link> ›{" "}
        <Link href={lienTheme()} className="text-ink-3">{theme.label}</Link>
      </nav>
      <div role="tablist" aria-label="Critères" className="-mx-4 mt-2 flex gap-1.5 overflow-x-auto px-4 pb-1">
        {grille.criteres.map((x) => (
          <Link
            key={x.id}
            href={lienCritere(x.id)}
            role="tab"
            aria-selected={x.id === c.id}
            className={`shrink-0 rounded-full border px-3 py-1 text-sm no-underline ${
              x.id === c.id ? "border-ink bg-ink text-white" : "border-line text-ink-2"
            }`}
          >
            {x.label}
          </Link>
        ))}
      </div>

      <h1 className="mt-4 text-2xl font-bold leading-tight">{c.label}</h1>
      <p className="mt-2 text-lg leading-snug">
        Sur {textes.length} texte{textes.length > 1 ? "s" : ""} voté{textes.length > 1 ? "s" : ""} en {periode(textes)}{" "}
        {c.chapeau}, ce que chaque parti propose et ce que ses députés ont voté :
      </p>
      {textes.length < 2 && (
        <p className="mt-2 text-sm text-warn-ink">Un seul texte : trop peu pour conclure.</p>
      )}

      <div className="mt-4 border-t border-line">
        {lignes.map(({ p, pour }) => (
          <Rangee key={p.id} titre={p.nom} propose={resumePropose(p.id, c.id)} pour={pour}>
            <Confrontation parti={p} critere={c.id} />
            <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-3">
              Faisabilité juridique :
              <span className="rounded bg-warn-bg px-1.5 py-0.5 font-medium text-warn-ink">À analyser par un juriste</span>
            </p>
            <Link href={`/parti/${p.id}`} className="mt-2 inline-block text-sm">
              Tout sur {p.nom} →
            </Link>
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
        <Deplier titre="Définition du critère">
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

      <PiedFiche sources={textes.map((t) => ({ label: `Scrutin n° ${scrutinDe(t).numero} — ${t.titreCourt}`, href: scrutinDe(t).url }))} />
    </article>
  );
}
