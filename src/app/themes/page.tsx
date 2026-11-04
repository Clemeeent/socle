import type { Metadata } from "next";
import { dossiersDuTheme, textesDuTheme, themes } from "@/lib/data";
import { TuileTheme } from "@/components/TuileTheme";

export const metadata: Metadata = { title: "Thèmes" };

const aDuContenu = (id: string) => textesDuTheme(id).length + dossiersDuTheme(id).length > 0;

export default function ThemesPage() {
  return (
    <article>
      <h1 className="text-[1.9rem] leading-tight">Les thèmes</h1>
      <p className="mt-2 text-ink-2">Tous les textes votés et les dossiers, rangés par grand sujet.</p>
      <ul className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {themes.filter((t) => aDuContenu(t.id)).map((t) => (
          <li key={t.id}>
            <TuileTheme t={t} />
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-ink-3">
        Bientôt : {themes.filter((t) => !aDuContenu(t.id)).map((t) => t.label).join(" · ")}
      </p>
    </article>
  );
}
