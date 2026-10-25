import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCritere, getGroupe, grille, groupes, meta, scrutinDe, textesDuCritere } from "@/lib/data";
import { repartition, part, pct } from "@/lib/stats";
import { FicheMeta, Sources } from "@/components/Fiche";
import { GroupeTag } from "@/components/GroupeTag";
import { VoteBar, VoteLegende } from "@/components/VoteBar";

export const dynamicParams = false;
export const generateStaticParams = () => grille.criteres.map((c) => ({ critere: c.id }));

export async function generateMetadata({ params }: { params: Promise<{ critere: string }> }): Promise<Metadata> {
  const { critere } = await params;
  return { title: getCritere(critere)?.label };
}

const POSITION: Record<string, string> = { pour: "Majorité pour", contre: "Majorité contre", abstention: "Majorité abstention" };

export default async function GrillePage({ params }: { params: Promise<{ critere: string }> }) {
  const { critere } = await params;
  const c = getCritere(critere);
  if (!c) notFound();
  const textes = textesDuCritere(c.id).map((t) => ({ t, s: scrutinDe(t) }));
  // Every group that took part in at least one of these votes, in hemicycle order.
  const presents = groupes.filter((g) => textes.some(({ s }) => s.groupes.some((v) => v.organeRef === g.organeRef)));

  return (
    <article>
      <p className="text-xs uppercase tracking-wide text-ink-3">La grille · un critère à la fois</p>
      <nav aria-label="Critères" className="-mx-4 mt-2 overflow-x-auto px-4">
        <ul className="flex gap-2 whitespace-nowrap">
          {grille.criteres.map((x) => (
            <li key={x.id}>
              <Link
                href={`/grille/${x.id}`}
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

      <section className="mt-5">
        <h2 className="text-sm font-semibold text-ink-2">
          {textes.length} texte{textes.length > 1 ? "s" : ""} retenu{textes.length > 1 ? "s" : ""} pour ce critère
        </h2>
        <ul className="mt-2 space-y-1 text-sm">
          {textes.map(({ t }) => (
            <li key={t.id}>
              <Link href={`/texte/${t.id}`}>{t.titreCourt}</Link>
            </li>
          ))}
        </ul>
        {textes.length < 2 && (
          <p className="mt-2 text-sm text-warn-ink">
            Un seul texte retenu : c&apos;est trop peu pour tirer une conclusion sur ce critère.
          </p>
        )}
      </section>

      <section className="mt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold">Groupe par groupe</h2>
          <VoteLegende />
        </div>
        <ul className="mt-3 space-y-3">
          {presents.map((g) => (
            <li key={g.organeRef} className="rounded border border-line p-3" style={{ borderLeft: `4px solid ${g.couleur}` }}>
              <h3 className="text-base">
                <GroupeTag g={getGroupe(g.organeRef)!} long />
              </h3>

              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                <dt className="text-ink-3">Position ou promesse</dt>
                <dd className="italic text-ink-3">Pas encore de position ou de programme sourcé</dd>
                <dt className="text-ink-3">Faisabilité juridique</dt>
                <dd>
                  <span className="rounded bg-warn-bg px-1.5 py-0.5 text-xs font-medium text-warn-ink">
                    À analyser par un juriste
                  </span>
                </dd>
              </dl>

              <h4 className="mt-3 text-xs font-semibold uppercase tracking-wide text-ink-3">Votes passés (pour/contre/abst./absents)</h4>
              <ul className="mt-1 space-y-2">
                {textes.map(({ t, s }) => {
                  const v = s.groupes.find((x) => x.organeRef === g.organeRef);
                  if (!v) {
                    return (
                      <li key={t.id} className="text-sm text-ink-3">
                        {t.titreCourt} : groupe pas encore ou plus constitué lors de ce vote.
                      </li>
                    );
                  }
                  const r = repartition(v);
                  return (
                    <li key={t.id} className="text-sm">
                      <div className="flex justify-between gap-2 leading-snug">
                        <Link href={`/texte/${t.id}`} className="text-ink no-underline hover:underline">
                          {t.titreCourt}
                        </Link>
                        <span className="shrink-0 tabular-nums text-ink-2">{pct(part(r.pour, r.membres))} pour</span>
                      </div>
                      <div className="mt-1">
                        <VoteBar r={r} label={`${g.sigle} — ${t.titreCourt}`} />
                      </div>
                      <p className="mt-0.5 text-xs text-ink-3">
                        {POSITION[v.positionMajoritaire] ?? v.positionMajoritaire} · {r.pour}/{r.contre}/{r.abstention}/{r.absent} sur {r.membres} ·{" "}
                        <a href={s.url} target="_blank" rel="noreferrer">scrutin n° {s.numero}</a>
                      </p>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <Sources items={textes.map(({ t, s }) => ({ label: `Scrutin n° ${s.numero} — ${t.titreCourt}`, href: s.url }))} />
    </article>
  );
}
