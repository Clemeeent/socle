// All the numbers shown on the site are computed here, from the official tallies.
import { getGroupe, groupes, scrutinDe, type Groupe, type Texte, type VoteGroupe } from "./data";

export type Repartition = { pour: number; contre: number; abstention: number; absent: number; membres: number };

export const CATEGORIES = [
  { key: "pour", label: "Pour" },
  { key: "contre", label: "Contre" },
  { key: "abstention", label: "Abstention" },
  { key: "absent", label: "Absent ou non-votant" },
] as const;

// "Absent" = group members with no recorded vote, plus those who did not take part (nonVotant).
export function repartition(v: VoteGroupe): Repartition {
  const pour = v.pour.length;
  const contre = v.contre.length;
  const abstention = v.abstention.length;
  return { pour, contre, abstention, absent: v.membres - pour - contre - abstention, membres: v.membres };
}

const vide = (): Repartition => ({ pour: 0, contre: 0, abstention: 0, absent: 0, membres: 0 });

function ajoute(a: Repartition, b: Repartition): Repartition {
  return {
    pour: a.pour + b.pour,
    contre: a.contre + b.contre,
    abstention: a.abstention + b.abstention,
    absent: a.absent + b.absent,
    membres: a.membres + b.membres,
  };
}

export const part = (n: number, total: number) => (total === 0 ? 0 : n / total);
export const pct = (x: number) => `${Math.round(x * 100)} %`;

export type LigneGroupe = { groupe: Groupe; total: Repartition; textes: number };

// Sum of every seat of the group over the selected votes: share = votes "pour" / seats.
export function parGroupe(textes: Texte[]): LigneGroupe[] {
  const lignes = new Map<string, LigneGroupe>();
  for (const t of textes) {
    for (const v of scrutinDe(t).groupes) {
      const groupe = getGroupe(v.organeRef)!;
      const l = lignes.get(v.organeRef) ?? { groupe, total: vide(), textes: 0 };
      lignes.set(v.organeRef, { groupe, total: ajoute(l.total, repartition(v)), textes: l.textes + 1 });
    }
  }
  return groupes.flatMap((g) => lignes.get(g.organeRef) ?? []);
}

export type Phrase = { texte: string; sources: { label: string; href: string }[] };

export function synthese(textes: Texte[]): Phrase[] {
  if (textes.length === 0) return [];
  const sources = textes.map((t) => {
    const s = scrutinDe(t);
    return { label: `Scrutin n° ${s.numero}`, href: s.url };
  });
  const adoptes = textes.filter((t) => scrutinDe(t).sort === "adopté").length;
  // Non-attached deputies are not a group: they are left out of the comparison.
  const lignes = parGroupe(textes).filter((l) => !l.groupe.nonInscrits);
  const tri = lignes.toSorted((a, b) => part(b.total.pour, b.total.membres) - part(a.total.pour, a.total.membres));
  const haut = tri[0];
  const bas = tri[tri.length - 1];
  const tous = lignes.reduce((acc, l) => ajoute(acc, l.total), vide());
  const n = textes.length;
  const nom = (l: LigneGroupe) => `${l.groupe.libelle} (${l.groupe.sigle})`;
  return [
    {
      texte: `${adoptes} des ${n} texte${n > 1 ? "s" : ""} retenu${n > 1 ? "s ont" : " a"} été adopté${n > 1 ? "s" : ""} par l'Assemblée nationale lors du vote sur l'ensemble.`,
      sources,
    },
    {
      texte: `La part de députés ayant voté pour va de ${pct(part(bas.total.pour, bas.total.membres))} pour le groupe ${nom(bas)} à ${pct(part(haut.total.pour, haut.total.membres))} pour le groupe ${nom(haut)}.`,
      sources,
    },
    {
      texte: `Sur l'ensemble de ces votes, ${pct(part(tous.absent, tous.membres))} des sièges des groupes n'ont pas exprimé de vote (absents ou non-votants).`,
      sources,
    },
  ];
}
