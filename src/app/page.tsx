import Link from "next/link";
import { documentsDuParti, getGroupe, grille, partis, questions, textesDuCritere } from "@/lib/data";
import { QuestionBox } from "@/components/QuestionBox";

// Only "Libertés publiques" has content in the demo; the others are announced, not filled.
const THEMES_A_VENIR = ["Institutions et démocratie", "Économie et fiscalité", "Travail et retraites", "Santé", "Écologie et énergie", "Immigration"];

export default function Home() {
  return (
    <div>
      <section className="pt-4">
        <h1 className="text-3xl font-bold leading-tight tracking-tight">
          Les faits d&apos;abord.
          <br />
          <span className="text-ink-3">Le débat ensuite.</span>
        </h1>
        <p className="mt-3 leading-relaxed text-ink-2">
          Socle répond aux questions politiques avec des votes et des textes officiels, sourcés et
          datés, selon des critères visibles et identiques pour tous les partis.
        </p>
        <div className="mt-6">
          <QuestionBox />
        </div>
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-3">Exemples</p>
          <ul className="mt-2 flex flex-col gap-2">
            {questions.map((q) => (
              <li key={q.slug}>
                <Link
                  href={`/question/${q.slug}`}
                  className="inline-block rounded-full border border-line bg-bg-alt px-3 py-1.5 text-sm text-ink no-underline hover:border-accent"
                >
                  {q.question}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="partis" className="mt-12 scroll-mt-4">
        <h2 className="text-lg font-semibold">Partis</h2>
        <p className="mt-1 text-sm text-ink-3">Leurs propositions face aux votes de leur groupe.</p>
        <ul className="mt-3 grid grid-cols-2 gap-2">
          {partis.map((p) => (
            <li key={p.id}>
              <Link href={`/parti/${p.id}`} className="flex h-full items-start gap-2 rounded border border-line p-2.5 text-sm no-underline hover:border-accent">
                <span className="mt-1.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: getGroupe(p.groupes[0])!.couleur }} />
                <span>
                  <span className="block font-medium leading-snug text-ink">{p.nom}</span>
                  <span className="block text-xs text-ink-3">
                    {documentsDuParti(p.id).length ? "Programme analysé" : "Programme à venir"}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">Thèmes</h2>
        <ol className="mt-3 divide-y divide-line border-y border-line">
          <li className="py-3">
            <p className="font-semibold">1. Libertés publiques</p>
            <ol className="mt-2 space-y-1.5 pl-4 text-sm">
              {grille.criteres.map((c, i) => {
                const n = textesDuCritere(c.id).length;
                return (
                  <li key={c.id} className="flex justify-between gap-2">
                    <Link href={`/grille/${c.id}`}>
                      1.{i + 1} {c.label}
                    </Link>
                    <span className="shrink-0 text-ink-3">
                      {n} texte{n > 1 ? "s" : ""}
                    </span>
                  </li>
                );
              })}
            </ol>
          </li>
          {THEMES_A_VENIR.map((t, i) => (
            <li key={t} className="flex justify-between py-3 text-ink-3">
              <span>
                {i + 2}. {t}
              </span>
              <span className="text-xs">En préparation</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
