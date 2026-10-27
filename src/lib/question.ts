// Turns a free-text question into a place in Socle (a dossier, or one of its questions).
// v1: matches sample questions by keyword. Later: replace the body of interpreterQuestion
// with an LLM call restricted to Socle's own content; the pages don't change.
import { lienCritere, lienDossier, recherche, type Recherche } from "./data";

const normalise = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export const lienRecherche = (r: Recherche) => (r.critere ? lienCritere(r.critere) : lienDossier(r.dossier));

export async function interpreterQuestion(q: string): Promise<Recherche | null> {
  const texte = normalise(q);
  return recherche.find((x) => x.motsCles.some((m) => texte.includes(normalise(m)))) ?? null;
}
