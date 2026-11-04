import Link from "next/link";
import { dossiersDuTheme, lienTheme, textesDuTheme, type Theme } from "@/lib/data";
import { IconeTheme } from "./Icones";

export function TuileTheme({ t }: { t: Theme }) {
  const nTextes = textesDuTheme(t.id).length;
  const nDossiers = dossiersDuTheme(t.id).length;
  const vide = nTextes + nDossiers === 0;
  return (
    <Link
      href={lienTheme(t.id)}
      className={`flex h-full flex-col gap-3 rounded-2xl border p-3.5 no-underline transition-colors ${
        vide ? "border-line text-ink-3" : "border-line bg-white text-ink hover:border-accent"
      }`}
    >
      <IconeTheme id={t.id} className={`h-7 w-7 ${vide ? "" : "text-accent"}`} />
      <span className="text-[0.95rem] font-semibold leading-tight">{t.label}</span>
      <span className="mt-auto text-xs text-ink-3">
        {vide
          ? "Bientôt"
          : nTextes
            ? `${nTextes} texte${nTextes > 1 ? "s" : ""}`
            : `${nDossiers} dossier${nDossiers > 1 ? "s" : ""}`}
      </span>
    </Link>
  );
}
