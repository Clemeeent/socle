import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, grille, lienCritere, scrutinDe, textesDuCritere, theme } from "@/lib/data";
import { periode, vuesClassement } from "@/lib/stats";
import { Classement } from "@/components/Classement";
import { Deplier } from "@/components/Deplier";
import { PiedFiche } from "@/components/PiedFiche";

export const dynamicParams = false;
export const generateStaticParams = () => [{ theme: theme.id }];
export const metadata: Metadata = { title: theme.label };

export default async function ThemePage({ params }: { params: Promise<{ theme: string }> }) {
  const { theme: themeId } = await params;
  if (themeId !== theme.id) notFound();
  const criteres = grille.criteres.map((c) => c.id);

  return (
    <article>
      <nav aria-label="Fil d'Ariane" className="text-xs text-ink-3">
        <Link href="/#themes" className="text-ink-3">Thèmes</Link>
      </nav>
      <h1 className="mt-1 text-2xl font-bold leading-tight">{theme.label}</h1>

      <div className="mt-4">
        <Classement vues={vuesClassement(criteres, theme.chapeau)} periode={periode(grille.textes)} />
      </div>

      <div className="mt-8 border-t border-line">
        <Deplier titre={`Les ${criteres.length} critères`}>
          <ul className="space-y-3">
            {grille.criteres.map((c) => (
              <li key={c.id}>
                <Link href={lienCritere(c.id)} className="font-medium">{c.label} →</Link>
                <p className="text-sm text-ink-2">{c.definition}</p>
                <p className="text-xs text-ink-3">{textesDuCritere(c.id).length} texte(s)</p>
              </li>
            ))}
          </ul>
        </Deplier>
        <Deplier titre={`Les ${grille.textes.length} textes retenus`}>
          <ul className="space-y-3">
            {grille.textes.map((t) => {
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
        <Deplier titre="Pourquoi des critères">
          <p className="text-sm leading-relaxed text-ink-2">{theme.intro}</p>
          <p className="mt-2 text-sm"><Link href="/methode">Toute la méthode →</Link></p>
        </Deplier>
      </div>

      <PiedFiche sources={grille.textes.map((t) => ({ label: `Scrutin n° ${scrutinDe(t).numero} — ${t.titreCourt}`, href: scrutinDe(t).url }))} />
    </article>
  );
}
