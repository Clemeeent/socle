// Typed access to the local JSON files. Everything the site shows comes from here.
import grilleJson from "../../data/grille.json";
import scrutinsJson from "../../data/scrutins.json";
import groupesJson from "../../data/groupes.json";
import dossiersJson from "../../data/dossiers.json";
import deputesJson from "../../data/deputes.json";
import metaJson from "../../data/meta.json";
import questionsJson from "../../data/questions.json";
import partisJson from "../../data/partis.json";
import positionsJson from "../../data/positions.json";
import sourcesJson from "../../programmes/sources.json";
import { TYPES_DOCUMENT, type DocumentProgramme, type Position } from "./programmes-core";

export type Critere = { id: string; label: string; definition: string; chapeau: string };

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
  chapeau: string; // completes "Sur N textes … "
  criteres: string[];
};

export const grille = grilleJson as {
  theme: { id: string; label: string; intro: string; chapeau: string };
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
// Demo has a single theme; its criteria live under /theme/<theme>/<critere>.
export const theme = grille.theme;
export const lienTheme = () => `/theme/${theme.id}`;
export const lienCritere = (id: string) => `${lienTheme()}/${id}`;
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

// ── Parties and their programmes ──────────────────────────────────────────────

export type { DocumentProgramme, Position };
export type Parti = { id: string; nom: string; sigle: string; groupes: string[]; remarque?: string };

const ordreParti = (p: Parti) => Math.min(...p.groupes.map((g) => getGroupe(g)?.ordre ?? 99));
export const partisMeta = partisJson as { statut: string; note: string; partis: Parti[] };
export const partis = partisMeta.partis.toSorted((a, b) => ordreParti(a) - ordreParti(b));
export const documents = (sourcesJson as { documents: DocumentProgramme[] }).documents;
export const positions = positionsJson as Position[];

export const getParti = (id: string) => partis.find((p) => p.id === id);
export const getDocument = (id: string) => documents.find((d) => d.id === id);
export const partiDuGroupe = (organeRef: string) => partis.find((p) => p.groupes.includes(organeRef));
export const groupesSansParti = () => groupes.filter((g) => !partiDuGroupe(g.organeRef));

export const documentsDuParti = (id: string) =>
  documents
    .filter((d) => d.parti === id)
    .toSorted((a, b) => TYPES_DOCUMENT.indexOf(a.type) - TYPES_DOCUMENT.indexOf(b.type));

export type EtatPropositions =
  | { etat: "positions"; positions: Position[] }
  | { etat: "aucune" } // document read for this criterion, nothing found
  | { etat: "non-analyse" };

export function propositions(partiId: string, critereId: string): EtatPropositions {
  const trouvees = positions.filter((p) => p.parti === partiId && p.critere === critereId);
  if (trouvees.length) return { etat: "positions", positions: trouvees };
  if (documentsDuParti(partiId).some((d) => d.criteresAnalyses.includes(critereId))) return { etat: "aucune" };
  return { etat: "non-analyse" };
}

// The vote of the party's group on a given scrutin (a party may map to successive groups).
export const voteDuParti = (parti: Parti, scrutin: Scrutin) =>
  scrutin.groupes.find((v) => parti.groupes.includes(v.organeRef));
