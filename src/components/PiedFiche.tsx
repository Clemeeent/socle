// Level 3 of every page: status, date and sources, folded into one discreet line.
import Link from "next/link";
import { formatDate, grille, meta } from "@/lib/data";

export function PiedFiche({
  sources,
  verifie = false,
}: {
  sources: { label: string; href: string }[];
  verifie?: boolean;
}) {
  return (
    <footer className="mt-10 border-t border-line pt-3 text-xs text-ink-3">
      <p className="flex flex-wrap gap-x-2 gap-y-1">
        <span className={verifie ? "text-ok-ink" : undefined}>
          {verifie ? "✓ Vérifié par un juriste" : "Sourcé automatiquement"}
        </span>
        <span>· Mis à jour le {formatDate(meta.importeLe)}</span>
        <span>· {grille.avertissement}</span>
      </p>
      <details className="mt-2">
        <summary className="cursor-pointer text-accent">
          Sources ({sources.length}) · <Link href="/methode">Méthode</Link>
        </summary>
        <ul className="mt-2 space-y-1">
          {sources.map((s) => (
            <li key={s.href + s.label}>
              <a href={s.href} target="_blank" rel="noreferrer">
                {s.label} ↗
              </a>
            </li>
          ))}
        </ul>
      </details>
    </footer>
  );
}
