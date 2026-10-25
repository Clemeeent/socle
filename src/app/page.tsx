import Link from "next/link";
import { documentsDuParti, getGroupe, grille, partis, questions, lienTheme, theme } from "@/lib/data";
import { QuestionBox } from "@/components/QuestionBox";

function etatProgramme(partiId: string) {
  const docs = documentsDuParti(partiId);
  if (docs.some((d) => d.criteresAnalyses.length)) return "Programme analysé";
  return docs.length ? "Programme identifié, à analyser" : "Programme à venir";
}

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
          Pose une question politique : Socle répond avec les votes et les programmes officiels.
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
                    {etatProgramme(p.id)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="themes" className="mt-12 scroll-mt-4">
        <h2 className="text-lg font-semibold">Thèmes</h2>
        <Link
          href={lienTheme()}
          className="mt-3 flex items-center justify-between rounded border border-line p-3 no-underline hover:border-accent"
        >
          <span>
            <span className="block font-semibold text-ink">{theme.label}</span>
            <span className="block text-xs text-ink-3">
              {grille.criteres.length} critères · {grille.textes.length} textes
            </span>
          </span>
          <span aria-hidden className="text-accent">→</span>
        </Link>
        <p className="mt-2 text-sm text-ink-3">Bientôt : {THEMES_A_VENIR.join(", ")}.</p>
      </section>
    </div>
  );
}
