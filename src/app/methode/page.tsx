import type { Metadata } from "next";
import Link from "next/link";
import {
  AVERTISSEMENT,
  documents,
  dossiers,
  dossiersLegislatifs,
  formatDate,
  getCritere,
  getGroupe,
  getTexte,
  groupes,
  lienCritere,
  lienDossier,
  meta,
  partis,
  partisMeta,
  scrutinDe,
  textes,
} from "@/lib/data";
import { StatutBadge } from "@/components/Fiche";
import { GroupeTag } from "@/components/GroupeTag";

export const metadata: Metadata = { title: "Méthode" };

function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return <h2 id={id} className="mt-10 scroll-mt-4 text-xl font-bold">{children}</h2>;
}

export default function MethodePage() {
  return (
    <article className="leading-relaxed">
      <p className="text-xs uppercase tracking-wide text-ink-3">Méthode</p>
      <h1 className="mt-1 text-2xl font-bold leading-tight">Comment Socle fabrique ses réponses</h1>
      <p className="mt-3 text-ink-2">
        Mêmes critères pour tous les groupes, méthode visible, une source officielle pour chaque
        chiffre. Quand une donnée manque, on l&apos;écrit plutôt que de l&apos;inventer.
      </p>

      <H2>Fait, lecture, valeur</H2>
      <p className="mt-2">
        Socle sépare toujours trois choses : le <strong>fait</strong> (un vote, daté et sourcé), ses{" "}
        <strong>lectures possibles</strong> (ce que le texte change, à analyser par un juriste) et les{" "}
        <strong>valeurs</strong> (est-ce bien ou mal ?), qui appartiennent au lecteur. Un mot comme
        « liberticide » est un jugement : dans chaque dossier, nous le traduisons en critères vérifiables.
      </p>

      <H2>Thèmes et dossiers</H2>
      <p className="mt-2">
        Les <strong>thèmes</strong> sont les grands axes de la politique (Économie, Santé, Sécurité et
        justice…) : ils servent à ranger chaque texte. Les <strong>dossiers</strong> sont les grands
        débats du moment : ils rassemblent des textes de plusieurs thèmes et traduisent la question
        posée en critères vérifiables.
      </p>
      {dossiers.map((d) => (
        <div key={d.id} className="mt-4">
          <h3 className="font-semibold">
            Dossier <Link href={lienDossier(d.id)}>{d.titre}</Link> : ses critères
          </h3>
          <dl className="mt-2 space-y-3">
            {d.criteres.map((c) => (
              <div key={c.id} className="rounded border border-line p-3">
                <dt className="font-semibold">
                  <Link href={lienCritere(c.id)}>{c.label}</Link>
                </dt>
                <dd className="mt-1 text-sm text-ink-2">{c.definition}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}

      <H2>Les programmes des partis</H2>
      <ul className="mt-2 list-disc space-y-1.5 pl-5">
        <li>
          Un document par parti, par ordre de priorité : <strong>programme 2027</strong> s&apos;il est
          publié, sinon <strong>programme présidentiel 2022</strong>, sinon{" "}
          <strong>texte officiel du parti</strong> (projet, motion de congrès). Le badge de chaque
          proposition indique la provenance et l&apos;année.
        </li>
        <li>
          Seuls des PDF officiels, téléchargés depuis le site du parti, sont utilisés. Un parti qui
          n&apos;avait pas son propre candidat en 2022 n&apos;hérite pas du programme d&apos;un autre.
        </li>
        <li>
          Le texte est extrait page par page. Une même liste de mots-clés par critère, identique pour
          tous les partis, repère les passages candidats. Chaque proposition retenue comporte un
          résumé neutre, une <strong>citation courte et exacte</strong> et son numéro de page.
        </li>
        <li>
          Un contrôle automatique vérifie que chaque citation figure mot pour mot à la page indiquée
          du PDF ; seules les différences typographiques (apostrophes, guillemets, espaces,
          césures de fin de ligne) sont tolérées. Sinon, la proposition est refusée.
        </li>
        <li>
          « Pas de proposition trouvée dans le programme » signifie que le document a été lu pour ce
          critère sans résultat : c&apos;est aussi une information. « Programme pas encore analysé »
          signifie qu&apos;aucun document n&apos;a encore été traité.
        </li>
      </ul>
      <p className="mt-2 text-sm text-ink-3">
        Documents identifiés : {documents.length}. Documents analysés :{" "}
        {documents.filter((d) => d.criteresAnalyses.length).length}.
      </p>

      <H2 id="partis">Partis et groupes parlementaires</H2>
      <p className="mt-2">
        {partisMeta.note} Statut : <strong>{partisMeta.statut}</strong>.
      </p>
      <table className="mt-3 w-full text-sm">
        <tbody>
          {partis.map((p) => (
            <tr key={p.id} className="border-b border-line align-top">
              <td className="py-1.5 pr-3">
                <Link href={`/parti/${p.id}`}>{p.nom}</Link>
              </td>
              <td className="py-1.5">
                {p.groupes.map((g) => getGroupe(g)!.sigle).join(" puis ")}
                {p.remarque && <span className="block text-xs text-ink-3">{p.remarque}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-ink-3">LIOT et les non-inscrits ne correspondent à aucun parti unique : seuls leurs votes sont affichés.</p>

      <H2>Comment les textes sont sélectionnés</H2>
      <ul className="mt-2 list-disc space-y-1.5 pl-5">
        <li>
          Législature en cours (XVII<sup>e</sup>), scrutins publics de l&apos;Assemblée nationale.
        </li>
        <li>
          Pour chaque texte, un seul vote : le vote sur <strong>l&apos;ensemble du texte</strong>, dans
          la dernière lecture disponible à l&apos;Assemblée (texte de commission mixte paritaire s&apos;il
          existe). Les votes d&apos;amendements ne sont pas pris en compte.
        </li>
        <li>
          Chaque texte est rattaché à un ou plusieurs critères, avec une justification courte. Pour
          cette démo, le rattachement est proposé à partir de l&apos;intitulé et de l&apos;objet général
          du texte, pas d&apos;une analyse article par article.
        </li>
        <li>
          <strong>{AVERTISSEMENT}</strong> La liste n&apos;est pas exhaustive : d&apos;autres textes
          pourraient relever de ces critères.
        </li>
      </ul>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-ink-3">
              <th className="py-1.5 pr-3 font-medium">Texte</th>
              <th className="py-1.5 pr-3 font-medium">Critères</th>
              <th className="py-1.5 font-medium">Justification</th>
            </tr>
          </thead>
          <tbody>
            {dossiers.flatMap((d) => d.selection).map((sel) => {
              const t = getTexte(sel.texte)!;
              const s = scrutinDe(t);
              return (
                <tr key={t.id} className="border-b border-line align-top">
                  <td className="py-2 pr-3">
                    <Link href={`/texte/${t.id}`}>{t.titreCourt}</Link>
                    <span className="block text-xs text-ink-3">
                      Scrutin n° {s.numero}, {formatDate(s.date)}
                    </span>
                  </td>
                  <td className="py-2 pr-3 text-xs">{sel.criteres.map((c) => getCritere(c)?.label).join(", ")}</td>
                  <td className="py-2 text-xs text-ink-2">
                    {sel.justification} <em>Statut : {t.statut}.</em>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <H2>Comment les chiffres sont calculés</H2>
      <ul className="mt-2 list-disc space-y-1.5 pl-5">
        <li>
          <strong>Part de députés ayant voté pour</strong> = nombre de « pour » du groupe ÷ effectif du
          groupe le jour du vote. Sur plusieurs textes, on additionne les voix et les effectifs.
          Les absents restent dans le total : un groupe peu présent a donc une part faible, sans que
          cela signifie qu&apos;il a voté contre.
        </li>
        <li>
          Sur les pages réponse, les partis sont <strong>classés</strong> par part de votes « pour »,
          du plus au moins. Les groupes sans parti associé (LIOT, non-inscrits) n&apos;entrent pas dans
          ce classement.
        </li>
        <li>
          <strong>Absent ou non-votant</strong> = effectif − pour − contre − abstentions. Cela inclut
          les députés qui ne prennent pas part au vote (par exemple la présidence de séance).
        </li>
        <li>
          Les corrections de vote déclarées après coup (« mises au point ») ne modifient pas le
          résultat officiel et ne sont pas prises en compte.
        </li>
        <li>
          Les députés non inscrits ne forment pas un groupe : ils sont affichés, mais exclus des
          comparaisons entre groupes dans les phrases de synthèse.
        </li>
        <li>
          Un groupe dissous puis recréé sous un autre nom est traité comme deux groupes distincts,
          tels qu&apos;ils figurent dans l&apos;open data.
        </li>
        <li>
          Les phrases de synthèse sont générées automatiquement à partir de ces chiffres : aucune
          n&apos;est écrite à la main.
        </li>
      </ul>

      <H2>L&apos;hémicycle</H2>
      <p className="mt-2">
        Un point par siège. Couleur = groupe (couleur fournie par l&apos;Assemblée), remplissage = vote :
        plein (pour), vide (contre), demi (abstention), petit point gris (absent). La disposition est
        schématique : les groupes sont ordonnés de gauche à droite selon le numéro moyen des places
        qu&apos;occupent leurs députés lors des scrutins retenus, ce qui suit le placement officiel
        sans reproduire le plan exact des sièges.
      </p>
      <ol className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {groupes.map((g) => (
          <li key={g.organeRef}>
            {g.ordre}. <GroupeTag g={g} />
          </li>
        ))}
      </ol>

      <H2>Statuts des fiches</H2>
      <ul className="mt-3 space-y-2 text-sm">
        <li className="flex flex-wrap items-center gap-2">
          <StatutBadge /> données importées automatiquement depuis les sources officielles, non relues.
        </li>
        <li className="flex flex-wrap items-center gap-2">
          <StatutBadge verifie /> relue par un juriste (aucune fiche pour l&apos;instant).
        </li>
      </ul>

      <H2>Sources</H2>
      <ul className="mt-2 space-y-1 text-sm break-all">
        {meta.sources.map((u) => (
          <li key={u}>
            <a href={u}>{u}</a>
          </li>
        ))}
        {Object.values(dossiersLegislatifs)
          .filter((d) => d.promulgation?.urlLegifrance)
          .map((d) => (
            <li key={d.uid}>
              <a href={d.promulgation!.urlLegifrance!} target="_blank" rel="noreferrer">
                Légifrance — {d.titre}
              </a>
            </li>
          ))}
      </ul>
      <p className="mt-3 text-sm text-ink-3">
        Dernier import : {formatDate(meta.importeLe)}. Les fichiers sont régénérés par le script{" "}
        <code>npm run import</code>, qui vérifie que chaque décompte nominatif correspond au
        décompte officiel du groupe.
      </p>

      <H2>Limites de cette version</H2>
      <ul className="mt-2 list-disc space-y-1.5 pl-5">
        <li>{textes.length} textes seulement : trop peu pour un classement robuste.</li>
        <li>Un vote ne dit pas pourquoi un député a voté ainsi ; il ne remplace pas une position.</li>
        <li>Le Sénat et les analyses juridiques ne sont pas encore couverts ; les programmes sont en cours d&apos;intégration.</li>
      </ul>
    </article>
  );
}
