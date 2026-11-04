// All the numbers shown on the site are computed here, from the official tallies.
import {
  getGroupe,
  partis,
  scrutinDe,
  textesDuCritere,
  textesDuDossier,
  voteDuParti,
  getDossier,
  type Carte,
  type Dossier,
  type Fait,
  type Texte,
  type VoteGroupe,
} from "./data";

import { CATEGORIES, part, pct, type Repartition } from "./format";

export { CATEGORIES, part, pct, type Repartition };

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


// ── Party ranking (answer pages) ─────────────────────────────────────────────

export type DetailTexte = { id: string; titre: string; r: Repartition | null };
export type LignePartiData = {
  id: string;
  sigle: string;
  nom: string;
  couleur: string;
  total: Repartition;
  textes: DetailTexte[];
};

// One line per party (its group's votes), sorted by share of "pour", most first.
// Ties keep the hemicycle order. Groups without a party (LIOT, NI) are left out.
export function classementPartis(textes: Texte[]): LignePartiData[] {
  return partis
    .map((p) => {
      let total = vide();
      const details = textes.map((t) => {
        const v = voteDuParti(p, scrutinDe(t));
        const r = v ? repartition(v) : null;
        if (r) total = ajoute(total, r);
        return { id: t.id, titre: t.titreCourt, r };
      });
      return {
        id: p.id,
        sigle: p.sigle,
        nom: p.nom,
        couleur: getGroupe(p.groupes[0])!.couleur,
        total,
        textes: details,
      };
    })
    .toSorted((a, b) => part(b.total.pour, b.total.membres) - part(a.total.pour, a.total.membres));
}

// "votés en 2025-2026"
export function periode(textes: Texte[]) {
  const annees = [...new Set(textes.map((t) => scrutinDe(t).date.slice(0, 4)))].toSorted();
  return annees.length > 1 ? `${annees[0]}-${annees[annees.length - 1]}` : annees[0];
}

// The views of the ranking: all the dossier's criteria together, then one per criterion.
export function vuesClassement(dossier: Dossier, seulement?: string) {
  const vue = (id: string, label: string, chapeau: string, textes: Texte[]) => ({
    id,
    label,
    chapeau,
    nTextes: textes.length,
    lignes: classementPartis(textes),
  });
  const parCritere = dossier.criteres
    .filter((c) => !seulement || c.id === seulement)
    .map((c) => vue(c.id, c.label, c.chapeau, textesDuCritere(c.id)));
  if (seulement) return parCritere;
  return [vue("tous", "Tous", dossier.chapeau, textesDuDossier(dossier)), ...parCritere];
}

// Facts for a card tied to a dossier, computed from the official votes (so already checked).
export function faitsDuDossier(d: Dossier) {
  const textes = textesDuDossier(d);
  const lignes = classementPartis(textes).filter((l) => l.total.membres > 0);
  const p = (l: LignePartiData) => pct(part(l.total.pour, l.total.membres));
  const haut = lignes[0];
  const bas = lignes[lignes.length - 1];
  const source = { label: "Assemblée nationale, scrutins publics", url: scrutinDe(textes[0]).url };
  return [
    {
      texte: `Sur ${textes.length} textes votés en ${periode(textes)} ${d.chapeau}, la part de députés ayant voté pour va de ${p(bas)} (${bas.sigle}) à ${p(haut)} (${haut.sigle}).`,
      source,
      statut: "vérifié",
    },
  ];
}

// All facts of a card: those computed from a dossier's votes first, then the card's own.
export const faitsCarte = (c: Carte): Fait[] => {
  const d = c.dossier ? getDossier(c.dossier) : undefined;
  return [...(d ? faitsDuDossier(d) : []), ...c.faits];
};

// Numbered sources of a card, as cited by "[n]" in its narrative: facts, then unknowns with a source.
// Each keeps the sentence it supports, so positions can quote it.
export const sourcesCarte = (c: Carte) => [
  ...faitsCarte(c).map((f) => ({ ...f.source, statut: f.statut, texte: f.texte })),
  ...c.inconnu.flatMap((x) => (x.source ? [{ ...x.source, statut: "à vérifier", texte: x.texte }] : [])),
];
