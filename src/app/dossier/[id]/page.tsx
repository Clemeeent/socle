import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  dossiers,
  formatDate,
  getDossier,
  lienCritere,
  lienTheme,
  positions,
  scrutinDe,
  textesDuCritere,
  textesDuDossier,
  themesDuDossier,
} from "@/lib/data";
import { periode, vuesClassement } from "@/lib/stats";
import { BlocAffirmation, sourcesAffirmation } from "@/components/Affirmation";
import { Classement } from "@/components/Classement";
import { BandeauDossier, couleurDossier } from "@/components/Dossier";
import { Deplier } from "@/components/Deplier";
import { IconeTheme } from "@/components/Icones";
import { MatricePartis } from "@/components/MatricePartis";
import { PiedFiche } from "@/components/PiedFiche";

export const dynamicParams = false;
export const generateStaticParams = () => dossiers.map((d) => ({ id: d.id }));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: getDossier(id)?.titre };
}

export default async function DossierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = getDossier(id);
  if (!d) notFound();
  const textes = textesDuDossier(d);
  const p = couleurDossier(d.couleur);
  const nPositions = positions.filter((x) => d.criteres.some((c) => c.id === x.critere)).length;
  const affirmations = d.affirmations ?? [];

  return (
    <article>
      <BandeauDossier d={d}>
        <p className="text-xs font-bold uppercase tracking-widest opacity-80">
          Dossier · mis à jour le {formatDate(d.miseAJour)}
        </p>
        <h1 className="mt-1 text-[2rem] leading-tight">{d.titre}</h1>
        <p className="mt-2 text-xl font-semibold leading-snug">{d.question}</p>
      </BandeauDossier>

      {affirmations.map((a) => (
        <BlocAffirmation key={a.id} a={a} />
      ))}

      {textes.length > 0 && <Classement vues={vuesClassement(d)} periode={periode(textes)} />}

      {d.criteres.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold">Les questions du dossier</h2>
          <ul className="mt-3 space-y-2.5">
            {d.criteres.map((c) => {
              const n = textesDuCritere(c.id).length;
              return (
                <li key={c.id}>
                  <Link
                    href={lienCritere(c.id)}
                    className="flex items-center justify-between gap-3 rounded-2xl p-4 no-underline transition-colors"
                    style={{ background: p.bg, color: p.ink }}
                  >
                    <span>
                      <span className="block font-semibold leading-snug">{c.question}</span>
                      <span className="mt-0.5 block text-xs opacity-75">
                        {c.label} · {n} texte{n > 1 ? "s" : ""}
                      </span>
                    </span>
                    <span aria-hidden className="text-lg">
                      →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="mt-8 border-t border-line">
        {d.criteres.length > 0 && (
          <Deplier
            titre={
              <>
                Ce qu&apos;ils proposent dans leur programme{" "}
                <span className="font-normal text-ink-3">
                  · {nPositions ? `${nPositions} propositions` : "à venir"}
                </span>
              </>
            }
          >
            <MatricePartis criteres={d.criteres.map((c) => c.id)} />
          </Deplier>
        )}
        {textes.length > 0 && (
          <Deplier titre={`Les ${textes.length} textes votés`}>
            <ul className="space-y-3">
              {textes.map((t) => {
                const s = scrutinDe(t);
                return (
                  <li key={t.id}>
                    <Link href={`/texte/${t.id}`} className="font-medium">
                      {t.titreCourt}
                    </Link>
                    <p className="text-xs text-ink-3">
                      {formatDate(s.date)} · {s.sort} {s.decompte.pour}–{s.decompte.contre}
                    </p>
                  </li>
                );
              })}
            </ul>
          </Deplier>
        )}
        <Deplier titre="Thèmes concernés">
          <ul className="flex flex-wrap gap-2">
            {themesDuDossier(d).map((t) => (
              <li key={t.id}>
                <Link
                  href={lienTheme(t.id)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-sm no-underline"
                >
                  <IconeTheme id={t.id} className="h-4 w-4" />
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </Deplier>
        <Deplier titre="Comment ce dossier est construit">
          <p className="text-sm leading-relaxed text-ink-2">{d.intro}</p>
          <p className="mt-2 text-sm">
            <Link href="/methode">Toute la méthode →</Link>
          </p>
        </Deplier>
      </div>

      <PiedFiche
        sources={[
          ...affirmations.flatMap(sourcesAffirmation),
          ...textes.map((t) => ({
            label: `Scrutin n° ${scrutinDe(t).numero} — ${t.titreCourt}`,
            href: scrutinDe(t).url,
          })),
        ]}
      />
    </article>
  );
}
