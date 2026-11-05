// Turns a free-text question into a place in Socle (a card, a dossier, or one of its questions).
// v1: matches sample questions by keyword. Later: replace the body of interpreterQuestion
// with an LLM call restricted to Socle's own content; the pages don't change.
import { analyses, lienAnalyse, lienCarte, lienCritere, lienDossier, recherche, type Recherche } from "./data";

const normalise = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export const lienRecherche = (r: Recherche) =>
  r.analyse
    ? lienAnalyse(r.analyse)
    : r.carte
      ? lienCarte(r.carte)
      : r.critere
        ? lienCritere(r.critere)
        : lienDossier(r.dossier!);

// A long pasted text (a post, a comment) is matched to an analysis when several of its keywords appear.
const LONG = 280;

export async function interpreterQuestion(q: string): Promise<Recherche | null> {
  const texte = normalise(q);
  if (q.length > LONG) {
    const a = analyses.find((x) => x.motsCles.filter((m) => texte.includes(normalise(m))).length >= 3);
    if (a) return { question: q, motsCles: [], analyse: a.id };
  }
  return recherche.find((x) => x.motsCles.some((m) => texte.includes(normalise(m)))) ?? null;
}
