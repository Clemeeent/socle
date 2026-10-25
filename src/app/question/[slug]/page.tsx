import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, getCritere, lienCritere, positions, questions, scrutinDe, textesDesCriteres } from "@/lib/data";
import { questionParSlug } from "@/lib/question";
import { periode, vuesClassement } from "@/lib/stats";
import { Classement } from "@/components/Classement";
import { Deplier } from "@/components/Deplier";
import { MatricePartis } from "@/components/MatricePartis";
import { PiedFiche } from "@/components/PiedFiche";

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
  const nPositions = positions.filter((p) => q.criteres.includes(p.critere)).length;

  return (
    <article>
      <h1 className="text-2xl font-bold leading-tight">« {q.question} »</h1>

      <div className="mt-4">
        <Classement vues={vuesClassement(q.criteres, q.chapeau)} periode={periode(textes)} />
      </div>

      <div className="mt-8 border-t border-line">
        <Deplier
          titre={
            <>
              Ce qu&apos;ils proposent dans leur programme{" "}
              <span className="font-normal text-ink-3">· {nPositions ? `${nPositions} propositions` : "à venir"}</span>
            </>
          }
        >
          <MatricePartis criteres={q.criteres} />
        </Deplier>
        <Deplier titre={`Les ${textes.length} textes retenus`}>
          <ul className="space-y-3">
            {textes.map((t) => {
              const s = scrutinDe(t);
              return (
                <li key={t.id}>
                  <Link href={`/texte/${t.id}`} className="font-medium">
                    {t.titreCourt}
                  </Link>
                  <p className="text-xs text-ink-3">
                    {formatDate(s.date)} · {s.sort} {s.decompte.pour}–{s.decompte.contre} ·{" "}
                    {t.criteres.map((c) => getCritere(c)?.label).join(", ")}
                  </p>
                </li>
              );
            })}
          </ul>
        </Deplier>
        <Deplier titre="Comment ces textes ont été choisis">
          <ul className="space-y-2 text-sm">
            {q.criteres.map((id) => {
              const c = getCritere(id)!;
              return (
                <li key={id}>
                  <Link href={lienCritere(id)} className="font-medium">
                    {c.label}
                  </Link>{" "}
                  <span className="text-ink-2">— {c.definition}</span>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-sm">
            <Link href="/methode">Toute la méthode →</Link>
          </p>
        </Deplier>
      </div>

      <PiedFiche sources={textes.map((t) => ({ label: `Scrutin n° ${scrutinDe(t).numero} — ${t.titreCourt}`, href: scrutinDe(t).url }))} />
    </article>
  );
}
