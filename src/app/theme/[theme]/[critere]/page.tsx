import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCritere,
  getGroupe,
  grille,
  groupesSansParti,
  lienCritere,
  lienTheme,
  meta,
  partis,
  scrutinDe,
  textesDuCritere,
  theme,
} from "@/lib/data";
import { repartition, part, pct } from "@/lib/stats";
import { FicheMeta, Sources } from "@/components/Fiche";
import { GroupeTag } from "@/components/GroupeTag";
import { VoteBar, VoteLegende } from "@/components/VoteBar";
import { Confrontation } from "@/components/Confrontation";

export const dynamicParams = false;
export const generateStaticParams = () => grille.criteres.map((c) => ({ theme: theme.id, critere: c.id }));

export async function generateMetadata({ params }: { params: Promise<{ theme: string; critere: string }> }): Promise<Metadata> {
  const { critere } = await params;
  return { title: getCritere(critere)?.label };
}

export default async function GrillePage({ params }: { params: Promise<{ theme: string; critere: string }> }) {
  const { theme: themeId, critere } = await params;
  const c = getCritere(critere);
  if (!c || themeId !== theme.id) notFound();
  const textes = textesDuCritere(c.id).map((t) => ({ t, s: scrutinDe(t) }));
  const autres = groupesSansParti().filter((g) => textes.some(({ s }) => s.groupes.some((v) => v.organeRef === g.organeRef)));

  return (
    <article>
      <nav aria-label="Fil d'Ariane" className="text-xs text-ink-3">
        <Link href="/#themes" className="text-ink-3">Thèmes</Link> ›{" "}
        <Link href={lienTheme()} className="text-ink-3">{theme.label}</Link>
      </nav>
      <nav aria-label="Critères" className="-mx-4 mt-2 overflow-x-auto px-4">
        <ul className="flex gap-2 whitespace-nowrap">
          {grille.criteres.map((x) => (
            <li key={x.id}>
              <Link
                href={lienCritere(x.id)}
                aria-current={x.id === c.id ? "page" : undefined}
                className={`block rounded-full border px-3 py-1.5 text-sm no-underline ${
                  x.id === c.id ? "border-accent bg-accent text-white" : "border-line text-ink-2 hover:border-accent"
                }`}
              >
                {x.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <h1 className="mt-5 text-2xl font-bold leading-tight">{c.label}</h1>
      <div className="mt-2">
        <FicheMeta miseAJour={meta.importeLe} />
      </div>
      <p className="mt-3 leading-relaxed text-ink-2">
        <span className="font-medium text-ink">Critère : </span>
        {c.definition}
      </p>
      <p className="mt-2 text-sm text-ink-3">
        {textes.length} texte{textes.length > 1 ? "s" : ""} voté{textes.length > 1 ? "s" : ""} retenu
        {textes.length > 1 ? "s" : ""}.
        {textes.length < 2 && " C'est trop peu pour tirer une conclusion sur ce critère."}
      </p>

      <section className="mt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold">Parti par parti</h2>
          <VoteLegende />
        </div>
        <p className="mt-1 text-xs text-ink-3">
          À gauche, les propositions tirées du programme du parti. À droite, les votes de son groupe à
          l&apos;Assemblée. <Link href="/methode#partis">Correspondance partis ↔ groupes</Link> (à valider).
        </p>
        <ul className="mt-3 space-y-3">
          {partis.map((p) => (
            <li key={p.id} className="rounded border border-line p-3" style={{ borderLeft: `4px solid ${getGroupe(p.groupes[0])!.couleur}` }}>
              <div className="mb-3 flex items-baseline justify-between gap-2">
                <h3 className="font-semibold leading-tight">
                  <Link href={`/parti/${p.id}`} className="text-ink no-underline hover:underline">
                    {p.nom}
                  </Link>
                </h3>
                <span className="shrink-0 text-xs text-ink-3">
                  groupe{" "}
                  {p.groupes.map((g) => getGroupe(g)!.sigle).join(" puis ")}
                </span>
              </div>
              <Confrontation parti={p} critere={c.id} />
              <p className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-2 text-xs text-ink-3">
                Faisabilité juridique :
                <span className="rounded bg-warn-bg px-1.5 py-0.5 font-medium text-warn-ink">À analyser par un juriste</span>
              </p>
            </li>
          ))}
        </ul>
      </section>

      {autres.length > 0 && (
        <section className="mt-8">
          <h2 className="text-base font-semibold">Groupes sans parti associé</h2>
          <p className="mt-1 text-xs text-ink-3">Ces groupes réunissent plusieurs formations : votes seulement.</p>
          <ul className="mt-3 space-y-3">
            {autres.map((g) => (
              <li key={g.organeRef} className="rounded border border-line p-3 text-xs">
                <p className="mb-2 text-sm">
                  <GroupeTag g={g} long />
                </p>
                <ul className="space-y-2">
                  {textes.map(({ t, s }) => {
                    const v = s.groupes.find((x) => x.organeRef === g.organeRef);
                    if (!v) return null;
                    const r = repartition(v);
                    return (
                      <li key={t.id} className="grid grid-cols-[1fr_6rem_2.5rem] items-center gap-2">
                        <Link href={`/texte/${t.id}`} className="truncate text-ink no-underline hover:underline">
                          {t.titreCourt}
                        </Link>
                        <VoteBar r={r} label={`${g.sigle} — ${t.titreCourt}`} />
                        <span className="text-right tabular-nums">{pct(part(r.pour, r.membres))}</span>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Sources items={textes.map(({ t, s }) => ({ label: `Scrutin n° ${s.numero} — ${t.titreCourt}`, href: s.url }))} />
    </article>
  );
}
