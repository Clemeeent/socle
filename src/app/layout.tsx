import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { meta, formatDate } from "@/lib/data";

export const metadata: Metadata = {
  title: { default: "Socle — les faits avant le débat", template: "%s · Socle" },
  description:
    "Un socle de faits sourcés sur la politique française : votes de l'Assemblée nationale, méthode visible.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className="min-h-dvh flex flex-col">
        <header className="border-b border-line">
          <div className="mx-auto max-w-3xl px-4 h-14 flex items-center justify-between">
            <Link href="/" className="font-bold text-lg tracking-tight text-ink no-underline">
              Socle<span className="text-accent">.</span>
              <span className="ml-2 rounded bg-warn-bg px-1.5 py-0.5 align-middle text-[10px] font-medium uppercase tracking-wide text-warn-ink">
                démo
              </span>
            </Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/#themes" className="text-ink-2 no-underline hover:underline">
                Thèmes
              </Link>
              <Link href="/#partis" className="text-ink-2 no-underline hover:underline">
                Partis
              </Link>
              <Link href="/methode" className="text-ink-2 no-underline hover:underline">
                Méthode
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-6">{children}</main>
        <footer className="border-t border-line bg-bg-alt text-sm text-ink-3">
          <div className="mx-auto max-w-3xl px-4 py-6 space-y-2">
            <p>
              Votes : open data officiel de l&apos;Assemblée nationale, importé le{" "}
              {formatDate(meta.importeLe)}. Textes : Légifrance.
            </p>
            <p>
              Socle est un projet indépendant, sans lien avec l&apos;Assemblée nationale ni aucun
              parti. <Link href="/methode">Lire la méthode</Link>.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
