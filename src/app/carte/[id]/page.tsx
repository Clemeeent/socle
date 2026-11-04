import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cartes, formatDate, getCarte, VERDICTS } from "@/lib/data";
import { sourcesCarte } from "@/lib/stats";
import { BoutonsPartage } from "@/components/BoutonsPartage";
import { PastilleVerdict } from "@/components/Carte";
import { Deplier } from "@/components/Deplier";
import { Recit, SuiteRecit } from "@/components/Recit";

export const dynamicParams = false;
export const generateStaticParams = () => cartes.map((c) => ({ id: c.id }));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = getCarte(id);
  if (!c) return {};
  const title = `« ${c.affirmation} » — ${VERDICTS[c.verdict].court}`;
  // Absolute URL when the public address is known (GitHub Pages lives under a sub-path).
  const image = `${process.env.SITE_URL ?? ""}/carte/${c.id}/apercu.png`;
  return {
    title,
    description: c.enBref,
    openGraph: { title, description: c.enBref, type: "article", images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", images: [image] },
  };
}

export default async function CartePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = getCarte(id);
  if (!c) notFound();
  const sources = sourcesCarte(c);

  return (
    <article>
      <Link href="/cartes" className="text-sm">← Toutes les vérifications</Link>

      <header className="mt-5">
        <PastilleVerdict v={c.verdict} long />
        <h1 className="mt-3 text-[1.9rem] leading-tight">«&nbsp;{c.affirmation}&nbsp;»</h1>
        <p className="mt-2 text-sm text-ink-3">
          {c.contexte} Vérifié le {formatDate(c.verifieLe)}.
        </p>
      </header>

      <div className="mt-6">
        <Recit c={c} sources={sources} />
      </div>

      <div className="mt-8">
        <BoutonsPartage titre={`« ${c.affirmation} »`} texte={c.enBref} chemin={c.id} />
      </div>

      <SuiteRecit c={c} sources={sources} />

      {c.medias.length > 0 && (
        <div className="mt-8 border-t border-line">
          <Deplier titre={<>Comment les médias en ont parlé <span className="font-normal text-ink-3">· {c.medias.length}</span></>}>
            <ul className="space-y-4">
              {c.medias.map((m) => (
                <li key={m.media + m.titre}>
                  <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
                    <span className="font-semibold">{m.media}</span>
                    {m.date && <span className="text-xs text-ink-3">{m.date}</span>}
                    <span className="rounded-full bg-bg-alt px-2 py-0.5 text-xs text-ink-2">{m.role}</span>
                  </p>
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noreferrer"
                    // A "via" entry describes the coverage; only the others are exact headlines.
                    className={`mt-1 block text-[0.95rem] leading-snug ${m.via ? "italic" : ""}`}
                  >
                    {m.titre} ↗
                  </a>
                  {m.via && <p className="text-xs text-ink-3">{m.via}</p>}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-ink-3">
              Liste non exhaustive, relevée par recherche. Socle décrit ce que chaque média a publié, sans le noter.
            </p>
          </Deplier>
        </div>
      )}

      <p className="mt-10 border-t border-line pt-3 text-xs text-ink-3">
        Chiffres relevés par recherche, à vérifier sur les sources. <Link href="/methode">Méthode</Link>
      </p>
    </article>
  );
}
