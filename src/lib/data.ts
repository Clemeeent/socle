// Typed access to the local JSON files. Everything the site shows comes from here.
import themesJson from "../../data/themes.json";
import dossiersJson from "../../data/dossiers.json";
import textesJson from "../../data/textes.json";
import scrutinsJson from "../../data/scrutins.json";
import groupesJson from "../../data/groupes.json";
import dossiersLegislatifsJson from "../../data/dossiers-legislatifs.json";
import deputesJson from "../../data/deputes.json";
import metaJson from "../../data/meta.json";
import rechercheJson from "../../data/recherche.json";
import partisJson from "../../data/partis.json";
import positionsJson from "../../data/positions.json";
import sourcesJson from "../../programmes/sources.json";
import { TYPES_DOCUMENT, type DocumentProgramme, type Position } from "./programmes-core";

export const AVERTISSEMENT = "Sélection provisoire, non validée par un juriste.";

// ── Themes (stable axes) and dossiers (cross-cutting subjects) ────────────────

export type Theme = { id: string; label: string };

export type Critere = {
  id: string;
  label: string;
  question: string;
  definition: string;
  chapeau: string; // completes "Sur N textes votés en … "
  motsCles: string[];
};

// Why a text belongs to a dossier, and under which of its criteria.
export type Selection = { texte: string; criteres: string[]; justification: string; base: string };

export type Dossier = {
  id: string;
  titre: string;
  question: string;
  chapeau: string;
  intro: string;
  couleur: string;
  statut: string;
  miseAJour: string;
  criteres: Critere[];
  selection: Selection[];
};

export type Texte = {
  id: string;
  titreCourt: string;
  scrutin: { legislature: number; numero: number };
  dossierLegislatif: string;
  themes: string[];
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

export type DossierLegislatif = {
  uid: string;
  titre: string;
  urlAN: string;
  promulgation: { dateJO: string; referenceNOR: string | null; urlLegifrance: string | null } | null;
};

// Search entries: a sample question and where it leads (a dossier, or one of its criteria).
export type Recherche = { question: string; motsCles: string[]; dossier: string; critere?: string };

export const themes = (themesJson as { themes: Theme[] }).themes;
export const dossiers = (dossiersJson as { dossiers: Dossier[] }).dossiers;
export const textes = textesJson as Texte[];
export const scrutins = scrutinsJson as Scrutin[];
export const groupes = (groupesJson as Groupe[]).toSorted((a, b) => a.ordre - b.ordre);
export const dossiersLegislatifs = dossiersLegislatifsJson as Record<string, DossierLegislatif>;
export const deputes = deputesJson as Record<string, string>;
export const meta = metaJson as { importeLe: string; sources: string[] };
export const recherche = rechercheJson as Recherche[];

export const criteres = dossiers.flatMap((d) => d.criteres);
export const getTheme = (id: string) => themes.find((t) => t.id === id);
export const getDossier = (id: string) => dossiers.find((d) => d.id === id);
export const getTexte = (id: string) => textes.find((t) => t.id === id);
export const getGroupe = (ref: string) => groupes.find((g) => g.organeRef === ref);
export const getCritere = (id: string) => criteres.find((c) => c.id === id);
export const dossierDuCritere = (id: string) => dossiers.find((d) => d.criteres.some((c) => c.id === id))!;

export const lienDossier = (id: string) => `/dossier/${id}`;
export const lienCritere = (id: string) => `${lienDossier(dossierDuCritere(id).id)}/${id}`;
export const lienTheme = (id: string) => `/theme/${id}`;

export const textesDuDossier = (d: Dossier) => d.selection.map((s) => getTexte(s.texte)!);
export const textesDuCritere = (critereId: string) =>
  dossierDuCritere(critereId)
    .selection.filter((s) => s.criteres.includes(critereId))
    .map((s) => getTexte(s.texte)!);
export const textesDesCriteres = (ids: string[]) =>
  textes.filter((t) => ids.some((id) => textesDuCritere(id).includes(t)));

// Every dossier that retained a text, with the reason.
export const selectionsDuTexte = (texteId: string) =>
  dossiers.flatMap((d) => d.selection.filter((s) => s.texte === texteId).map((s) => ({ dossier: d, ...s })));

export const themesDuDossier = (d: Dossier) =>
  themes.filter((t) => textesDuDossier(d).some((x) => x.themes.includes(t.id)));
export const textesDuTheme = (themeId: string) => textes.filter((t) => t.themes.includes(themeId));
export const dossiersDuTheme = (themeId: string) =>
  dossiers.filter((d) => textesDuDossier(d).some((t) => t.themes.includes(themeId)));

export function scrutinDe(texte: Texte): Scrutin {
  const s = scrutins.find(
    (x) => x.legislature === texte.scrutin.legislature && x.numero === texte.scrutin.numero,
  );
  if (!s) throw new Error(`Scrutin manquant pour ${texte.id} : lancer npm run import`);
  return s;
}

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
