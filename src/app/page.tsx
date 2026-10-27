import Link from "next/link";
import { dossiers, recherche, textesDuTheme, themes } from "@/lib/data";
import { lienRecherche } from "@/lib/question";
import { CarteDossier } from "@/components/Dossier";
import { QuestionBox } from "@/components/QuestionBox";
import { TuileTheme } from "@/components/TuileTheme";

export default function Home() {
  return (
    <div>
      <section className="pt-2">
        <h1 className="text-[2.1rem] leading-[1.08]">
          Les faits d&apos;abord.
          <br />
          <span className="text-accent">Le débat ensuite.</span>
        </h1>
        <p className="mt-3 text-ink-2">Pose ta question : on répond avec les votes et les programmes officiels.</p>
        <div className="mt-5">
          <QuestionBox />
        </div>
        <ul className="mt-3 flex flex-wrap gap-2">
          {recherche.map((r) => (
            <li key={r.question}>
              <Link
                href={lienRecherche(r)}
                className="inline-block rounded-full bg-bg-alt px-3 py-1.5 text-sm text-ink-2 no-underline hover:text-accent"
              >
                {r.question}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="dossiers" className="mt-12 scroll-mt-4">
        <h2 className="text-xl font-bold">Les dossiers</h2>
        <p className="mt-1 text-sm text-ink-3">Les grands débats du moment, décortiqués.</p>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {dossiers.map((d) => (
            <li key={d.id}>
              <CarteDossier d={d} />
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-ink-3">Prochains dossiers : la police, les manifestations…</p>
      </section>

      <section id="themes" className="mt-12 scroll-mt-4">
        <h2 className="text-xl font-bold">Les thèmes</h2>
        <p className="mt-1 text-sm text-ink-3">Tous les textes votés, rangés par grand sujet.</p>
        <ul className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {themes
            .filter((t) => textesDuTheme(t.id).length > 0)
            .map((t) => (
              <li key={t.id}>
                <TuileTheme t={t} />
              </li>
            ))}
        </ul>
        <p className="mt-4 text-sm text-ink-3">
          Bientôt :{" "}
          {themes
            .filter((t) => textesDuTheme(t.id).length === 0)
            .map((t) => t.label)
            .join(" · ")}
        </p>
      </section>
    </div>
  );
}
