// Typed access to the local JSON files. Everything the site shows comes from here.
import grilleJson from "../../data/grille.json";
import scrutinsJson from "../../data/scrutins.json";
import groupesJson from "../../data/groupes.json";
import dossiersJson from "../../data/dossiers.json";
import deputesJson from "../../data/deputes.json";
import metaJson from "../../data/meta.json";
import questionsJson from "../../data/questions.json";

export type Critere = { id: string; label: string; definition: string };

export type Texte = {
  id: string;
  titreCourt: string;
  scrutin: { legislature: number; numero: number };
  dossierRef: string;
  criteres: string[];
  justification: string;
  base: string;
  statut: string;
};

export type VoteGroupe = {
  organeRef: string;
  membres: number;
  positionMajoritaire: string;
  pour: string[];
  contre: string[];
  abstention: string[];
  nonVotant: string[];
};

export type Scrutin = {
  uid: string;
  legislature: number;
  numero: number;
  date: string;
  titre: string;
  typeVote: string;
  sort: string;
  annonce: string;
  decompte: { pour: number; contre: number; abstention: number; nonVotant: number };
  url: string;
  groupes: VoteGroupe[];
};

export type Groupe = {
  organeRef: string;
  sigle: string;
  libelle: string;
  couleur: string;
  dateDebut: string | null;
  dateFin: string | null;
  placeMoyenne: number | null;
  nonInscrits: boolean;
  ordre: number;
};

export type Dossier = {
  uid: string;
  titre: string;
  urlAN: string;
  promulgation: { dateJO: string; referenceNOR: string | null; urlLegifrance: string | null } | null;
};

export type Question = {
  slug: string;
  question: string;
  motsCles: string[];
  reformulation: string;
  criteres: string[];
};

export const grille = grilleJson as {
  statut: string;
  miseAJour: string;
  avertissement: string;
  criteres: Critere[];
  textes: Texte[];
};
export const scrutins = scrutinsJson as Scrutin[];
export const groupes = (groupesJson as Groupe[]).toSorted((a, b) => a.ordre - b.ordre);
export const dossiers = dossiersJson as Record<string, Dossier>;
export const deputes = deputesJson as Record<string, string>;
export const meta = metaJson as { importeLe: string; sources: string[] };
export const questions = questionsJson as Question[];

export const getCritere = (id: string) => grille.criteres.find((c) => c.id === id);
export const getTexte = (id: string) => grille.textes.find((t) => t.id === id);
export const getGroupe = (ref: string) => groupes.find((g) => g.organeRef === ref);
export const getQuestion = (slug: string) => questions.find((q) => q.slug === slug);

export function scrutinDe(texte: Texte): Scrutin {
  const s = scrutins.find(
    (x) => x.legislature === texte.scrutin.legislature && x.numero === texte.scrutin.numero,
  );
  if (!s) throw new Error(`Scrutin manquant pour ${texte.id} : lancer npm run import`);
  return s;
}

export const textesDuCritere = (critereId: string) =>
  grille.textes.filter((t) => t.criteres.includes(critereId));

export const textesDesCriteres = (ids: string[]) =>
  grille.textes.filter((t) => t.criteres.some((c) => ids.includes(c)));

export function formatDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
