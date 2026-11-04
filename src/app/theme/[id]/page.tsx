import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dossiersDuTheme, formatDate, getTheme, scrutinDe, textesDuTheme, themes } from "@/lib/data";
import { CarteDossier } from "@/components/Dossier";
import { IconeTheme } from "@/components/Icones";
import { PiedFiche } from "@/components/PiedFiche";

export const dynamicParams = false;
export const generateStaticParams = () => themes.map((t) => ({ id: t.id }));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: getTheme(id)?.label };
}

export default async function ThemePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = getTheme(id);
  if (!t) notFound();
  const textes = textesDuTheme(t.id);
  const dossiersLies = dossiersDuTheme(t.id);

  return (
    <article>
      <Link href="/#themes" className="text-sm">
        ← Tous les thèmes
      </Link>
      <h1 className="mt-3 flex items-center gap-3 text-[1.9rem] leading-tight">
        <IconeTheme id={t.id} className="h-9 w-9 shrink-0 text-accent" />
        {t.label}
      </h1>

      {textes.length + dossiersLies.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-bg-alt p-5 text-ink-2">
          Pas encore de contenu sur ce thème. Socle ajoute les thèmes au fur et à mesure.
        </p>
      ) : (
        <>
          {dossiersLies.length > 0 && (
            <section className="mt-6">
              <h2 className="text-lg font-bold">Dans les dossiers</h2>
              <ul className="mt-3 grid gap-4 sm:grid-cols-2">
                {dossiersLies.map((d) => (
                  <li key={d.id}>
                    <CarteDossier d={d} />
                  </li>
                ))}
              </ul>
            </section>
          )}
          {textes.length > 0 && (
            <section className="mt-8">
              <h2 className="text-lg font-bold">Les textes votés</h2>
              <ul className="mt-2 divide-y divide-line border-y border-line">
                {textes.map((x) => {
                  const s = scrutinDe(x);
                  return (
                    <li key={x.id}>
                      <Link
                        href={`/texte/${x.id}`}
                        className="flex items-center justify-between gap-3 py-3 no-underline"
                      >
                        <span>
                          <span className="block font-medium text-ink">{x.titreCourt}</span>
                          <span className="block text-xs text-ink-3">
                            {formatDate(s.date)} · {s.sort} {s.decompte.pour}–{s.decompte.contre}
                          </span>
                        </span>
                        <span aria-hidden className="text-accent">
                          →
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </>
      )}

      <PiedFiche
        sources={textes.map((x) => ({
          label: `Scrutin n° ${scrutinDe(x).numero} — ${x.titreCourt}`,
          href: scrutinDe(x).url,
        }))}
      />
    </article>
  );
}
