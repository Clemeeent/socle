import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, getCritere, meta, questions, scrutinDe, textesDesCriteres, textesDuCritere } from "@/lib/data";
import { questionParSlug } from "@/lib/question";
import { parGroupe, synthese } from "@/lib/stats";
import { FicheMeta, SourceInline, Sources } from "@/components/Fiche";
import { RecapGroupes } from "@/components/RecapGroupes";

export const dynamicParams = false;
export const generateStaticParams = () => questions.map((q) => ({ slug: q.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: questionParSlug(slug)?.question };
}

export default async function QuestionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const q = questionParSlug(slug);
  if (!q) notFound();
  const textes = textesDesCriteres(q.criteres);
  const phrases = synthese(textes);

  return (
    <article>
      <p className="text-xs uppercase tracking-wide text-ink-3">Ta question</p>
      <h1 className="mt-1 text-2xl font-bold leading-tight">« {q.question} »</h1>
      <div className="mt-2">
        <FicheMeta miseAJour={meta.importeLe} />
      </div>

      <section className="mt-5 rounded border-l-4 border-accent bg-accent-soft p-4">
        <p className="leading-relaxed">{q.reformulation}</p>
        <p className="mt-2 text-sm text-ink-2">
          À l&apos;Assemblée, les votes sont enregistrés par <strong>groupe parlementaire</strong>, pas
          par parti : les résultats sont donc présentés par groupe.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold">Nos critères</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {q.criteres.map((id) => {
            const c = getCritere(id)!;
            const n = textesDuCritere(id).length;
            return (
              <li key={id}>
                <Link href={`/grille/${id}`} className="block h-full rounded border border-line p-3 no-underline hover:border-accent">
                  <span className="font-semibold text-ink">{c.label}</span>
                  <span className="mt-1 block text-sm text-ink-2">{c.definition}</span>
                  <span className="mt-2 block text-xs text-accent">
                    {n} texte{n > 1 ? "s" : ""} retenu{n > 1 ? "s" : ""} →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Qui a voté pour ces textes ?</h2>
        <p className="mt-1 text-sm text-ink-3">
          Part des députés de chaque groupe ayant voté pour les {textes.length} textes retenus.
          Groupes dans l&apos;ordre de l&apos;hémicycle, de gauche à droite.
        </p>
        <div className="mt-4">
          <RecapGroupes lignes={parGroupe(textes)} totalTextes={textes.length} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">En résumé</h2>
        <ul className="mt-2 space-y-2 leading-relaxed">
          {phrases.map((p) => (
            <li key={p.texte} className="flex gap-2">
              <span aria-hidden className="text-accent">•</span>
              <span>
                {p.texte}
                <SourceInline items={p.sources} />
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-ink-3">
          Ces phrases sont calculées automatiquement à partir des scrutins ; elles décrivent des votes,
          pas des intentions. Le résultat dépend de la sélection des textes, encore provisoire.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Les textes retenus</h2>
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {textes.map((t) => {
            const s = scrutinDe(t);
            return (
              <li key={t.id}>
                <Link href={`/texte/${t.id}`} className="flex items-center justify-between gap-3 py-3 no-underline">
                  <span>
                    <span className="block font-medium text-ink">{t.titreCourt}</span>
                    <span className="block text-xs text-ink-3">
                      {formatDate(s.date)} · {s.sort} · {s.decompte.pour} pour, {s.decompte.contre} contre
                    </span>
                  </span>
                  <span aria-hidden className="text-accent">→</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <Sources items={textes.map((t) => ({ label: `Scrutin n° ${scrutinDe(t).numero} — ${t.titreCourt}`, href: scrutinDe(t).url }))} />
    </article>
  );
}
