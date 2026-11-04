import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cartes, dossierDeLaCarte, getCarte, getDossier, getTheme, lienDossier, lienTheme, VERDICTS, type Fait } from "@/lib/data";
import { faitsDuDossier } from "@/lib/stats";
import { BoutonsPartage } from "@/components/BoutonsPartage";
import { CarteVerif, PastilleVerdict } from "@/components/Carte";
import { Deplier } from "@/components/Deplier";
import { PiedFiche } from "@/components/PiedFiche";

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

function ListeFaits({ faits }: { faits: Fait[] }) {
  return (
    <ul className="space-y-4">
      {faits.map((f) => (
        <li key={f.texte} className="text-[0.95rem] leading-relaxed">
          <p>{f.texte}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-ink-3">
            <a href={f.source.url} target="_blank" rel="noreferrer">
              {f.source.label} ↗
            </a>
            <span className={f.statut === "vérifié" ? "text-ok-ink" : "text-warn-ink"}>
              · {f.statut === "vérifié" ? "✓ vérifié" : "à vérifier sur la source"}
            </span>
          </p>
        </li>
      ))}
    </ul>
  );
}

export default async function CartePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = getCarte(id);
  if (!c) notFound();
  const dossier = c.dossier ? getDossier(c.dossier) : undefined;
  const faits = [...(dossier ? faitsDuDossier(dossier) : []), ...c.faits];
  const aVerifier = faits.some((f) => f.statut !== "vérifié");
  const dossierLie = dossier ?? dossierDeLaCarte(c.id);

  return (
    <article>
      <Link href="/cartes" className="text-sm">← Toutes les vérifications</Link>

      <div className="mt-3">
        <CarteVerif c={c} />
      </div>
      <div className="mt-4">
        <BoutonsPartage titre={`« ${c.affirmation} »`} texte={c.enBref} chemin={c.id} />
      </div>

      <div className="mt-4 border-t border-line">
        <Deplier ouvert titre={<>Ce que disent les données <span className="font-normal text-ink-3">· {faits.length}</span></>}>
          <ListeFaits faits={faits} />
          {dossierLie && (
            <Link href={lienDossier(dossierLie.id)} className="mt-4 inline-block text-sm font-semibold">
              {dossier ? "Voir le détail des votes, parti par parti →" : `Aller plus loin : dossier ${dossierLie.titre} →`}
            </Link>
          )}
        </Deplier>
        <Deplier titre="Ce qui dépend de la définition">
          <ul className="list-disc space-y-2 pl-5 text-[0.95rem] leading-relaxed">
            {c.definitions.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </Deplier>
        <Deplier titre="Ce qu'on ne sait pas">
          <ul className="list-disc space-y-2 pl-5 text-[0.95rem] leading-relaxed">
            {c.inconnu.map((x) => (
              <li key={x.texte}>
                {x.texte}
                {x.source && (
                  <>
                    {" "}
                    <a href={x.source.url} target="_blank" rel="noreferrer" className="text-xs">
                      {x.source.label} ↗
                    </a>
                  </>
                )}
              </li>
            ))}
          </ul>
        </Deplier>
        <Deplier titre={<>Comment les médias en ont parlé <span className="font-normal text-ink-3">· {c.medias.length || "à venir"}</span></>}>
          {c.medias.length ? (
            <>
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
            </>
          ) : (
            <p className="text-sm text-ink-3">Revue de presse à venir.</p>
          )}
        </Deplier>
        {c.valeurs && (
          <Deplier titre="Ce qui reste à débattre">
            <p className="text-[0.95rem] leading-relaxed">{c.valeurs}</p>
          </Deplier>
        )}
      </div>

      <p className="mt-5 flex flex-wrap items-center gap-2 text-sm text-ink-3">
        <PastilleVerdict v={c.verdict} long />
      </p>
      <p className="mt-3 flex flex-wrap gap-2">
        {c.themes.map((t) => (
          <Link key={t} href={lienTheme(t)} className="rounded-full border border-line px-3 py-1 text-xs no-underline">
            {getTheme(t)?.label}
          </Link>
        ))}
      </p>

      <PiedFiche
        avertissement={aVerifier ? "Chiffres relevés par recherche, à vérifier sur les sources." : "Données officielles."}
        sources={faits.map((f) => ({ label: f.source.label, href: f.source.url }))}
      />
    </article>
  );
}
