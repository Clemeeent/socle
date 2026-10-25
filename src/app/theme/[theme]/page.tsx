import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, grille, lienCritere, meta, scrutinDe, textesDuCritere, theme } from "@/lib/data";
import { FicheMeta, Sources } from "@/components/Fiche";
import { MatricePartis } from "@/components/MatricePartis";

export const dynamicParams = false;
export const generateStaticParams = () => [{ theme: theme.id }];
export const metadata: Metadata = { title: theme.label };

export default async function ThemePage({ params }: { params: Promise<{ theme: string }> }) {
  const { theme: themeId } = await params;
  if (themeId !== theme.id) notFound();

  return (
    <article>
      <nav aria-label="Fil d'Ariane" className="text-xs text-ink-3">
        <Link href="/#themes" className="text-ink-3">Thèmes</Link>
      </nav>
      <h1 className="mt-1 text-2xl font-bold leading-tight">{theme.label}</h1>
      <div className="mt-2">
        <FicheMeta miseAJour={meta.importeLe} />
      </div>
      <p className="mt-3 leading-relaxed text-ink-2">{theme.intro}</p>

      <section className="mt-6">
        <h2 className="text-lg font-semibold">Les {grille.criteres.length} critères</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {grille.criteres.map((c) => {
            const n = textesDuCritere(c.id).length;
            return (
              <li key={c.id}>
                <Link href={lienCritere(c.id)} className="block h-full rounded border border-line p-3 no-underline hover:border-accent">
                  <span className="font-semibold text-ink">{c.label}</span>
                  <span className="mt-1 block text-sm text-ink-2">{c.definition}</span>
                  <span className="mt-2 block text-xs text-accent">
                    {n} texte{n > 1 ? "s" : ""} · propositions et votes parti par parti →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Ce qu&apos;ils proposent, ce qu&apos;ils ont voté</h2>
        <div className="mt-3">
          <MatricePartis criteres={grille.criteres.map((c) => c.id)} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Les textes retenus</h2>
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {grille.textes.map((t) => {
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

      <Sources items={grille.textes.map((t) => ({ label: `Scrutin n° ${scrutinDe(t).numero} — ${t.titreCourt}`, href: scrutinDe(t).url }))} />
    </article>
  );
}
