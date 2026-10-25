// Turns a free-text question into the criteria of the grid.
// v1: matches the written-in-advance example questions by keyword.
// Later: replace the body of interpreterQuestion with an LLM call; the pages don't change.
import { getQuestion, questions, type Question } from "./data";

export type Interpretation = Pick<Question, "slug" | "chapeau" | "criteres">;

const normalise = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export async function interpreterQuestion(q: string): Promise<Interpretation | null> {
  const texte = normalise(q);
  const trouvee = questions.find((x) => x.motsCles.some((m) => texte.includes(normalise(m))));
  return trouvee ?? null;
}

export const questionParSlug = (slug: string) => getQuestion(slug);
