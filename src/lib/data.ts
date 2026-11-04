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
import cartesJson from "../../data/cartes.json";
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

// A claim heard in public debate, confronted with official series. Values are only filled from
// downloaded official sources; until then the verdict stays "à établir".
export type SourceIndicateur = { organisme: string; publication: string; site: string; url: string | null };
export type Valeur = { annee: number; valeur: number; source: string; reference: string };
export type Indicateur = {
  id: string;
  label: string;
  ceQuIlMesure: string;
  unite: string;
  sources: SourceIndicateur[];
  valeurs: Valeur[];
};
export const VERDICTS_AFFIRMATION = ["vrai", "faux", "nuancé", "à établir"] as const;
export type Affirmation = {
  id: string;
  texte: string;
  contexte: string;
  origine: { etat: "à retrouver" | "trouvée"; qui: string | null; quand: string | null; source: string | null };
  verdict: (typeof VERDICTS_AFFIRMATION)[number];
  explication: string | null;
  indicateurs: Indicateur[];
  carte?: string; // shareable card on the same claim (figures found by search, to check)
};

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
  themes?: string[]; // for dossiers without voted texts
  affirmations?: Affirmation[];
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

// Search entries: a sample question and where it leads (a card, a dossier, or one of its questions).
export type Recherche = { question: string; motsCles: string[]; carte?: string; dossier?: string; critere?: string };

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
  themes.filter((t) => d.themes?.includes(t.id) || textesDuDossier(d).some((x) => x.themes.includes(t.id)));
export const textesDuTheme = (themeId: string) => textes.filter((t) => t.themes.includes(themeId));
export const dossiersDuTheme = (themeId: string) =>
  dossiers.filter((d) => themesDuDossier(d).some((t) => t.id === themeId));

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

// ── Shareable fact-check cards ─────────────────────────────────────────────────

export type SourceRef = { label: string; url: string };
export type Fait = { texte: string; source: SourceRef; statut: string };
export type Verdict = "jugement" | "depend" | "nuance" | "dementi" | "vrai" | "faux";
export type Carte = {
  id: string;
  affirmation: string;
  contexte: string;
  verifieLe: string;
  themes: string[];
  dossier?: string; // facts computed from the dossier's votes
  verdict: Verdict;
  enBref: string;
  faits: Fait[];
  definitions: string[];
  inconnu: { texte: string; source?: SourceRef }[];
  valeurs: string;
};

export const cartesMeta = cartesJson as { statut: string; note: string; cartes: Carte[] };
export const cartes = cartesMeta.cartes;
export const getCarte = (id: string) => cartes.find((c) => c.id === id);
export const lienCarte = (id: string) => `/carte/${id}`;
// The dossier that develops the same claim as a card, if any.
export const dossierDeLaCarte = (id: string) =>
  dossiers.find((d) => d.affirmations?.some((a) => a.carte === id));

export const VERDICTS: Record<Verdict, { label: string; court: string }> = {
  jugement: { label: "C'est un jugement : voici ce qu'on peut mesurer", court: "Jugement" },
  depend: { label: "Ça dépend de ce qu'on mesure", court: "Ça dépend" },
  nuance: { label: "Nuancé", court: "Nuancé" },
  dementi: { label: "Démenti par la source citée", court: "Démenti" },
  vrai: { label: "Vrai", court: "Vrai" },
  faux: { label: "Faux", court: "Faux" },
};

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
