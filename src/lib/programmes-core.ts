// Pure text functions shared by the programme scripts and their tests (no file or PDF access here).

// Makes a PDF's extracted text comparable with a citation typed by hand:
// ligatures, curly quotes, non-breaking spaces, soft hyphens and line-break hyphenation.
// Words, their order, punctuation and case are kept: the citation must still be verbatim.
export function normaliser(texte: string): string {
  return texte
    .normalize("NFKC")
    .replace(/\xAD/g, "")
    .replace(/(\p{Ll})-\s*\n\s*(\p{Ll})/gu, "$1$2")
    .replace(/[‘’ʼ`´]/g, "'")
    // French guillemets carry inner spaces (« libre »): drop them along with the marks.
    .replace(/«\s*/g, '"')
    .replace(/\s*»/g, '"')
    .replace(/[“”„]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

// Lower case and without accents, only to find keywords (never to check citations).
export const sansAccents = (s: string) =>
  normaliser(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export const CITATION_MAX = 300;

export function problemeCitation(citation: string): string | null {
  if (!citation.trim()) return "citation vide";
  if (citation.length > CITATION_MAX) return `citation trop longue (${citation.length} > ${CITATION_MAX} caractères)`;
  if (/\[\s*(…|\.\.\.)\s*\]/.test(citation)) return "citation coupée « […] » : une citation doit être un extrait continu";
  return null;
}

export const citationPresente = (citation: string, textePage: string) =>
  normaliser(textePage).includes(normaliser(citation));

// Pages where a citation appears (1-based), to give a useful error when the page number is wrong.
export const pagesAvecCitation = (citation: string, pages: string[]) =>
  pages.flatMap((p, i) => (citationPresente(citation, p) ? [i + 1] : []));

export type Candidat = { critere: string; page: number; phrase: string; motsTrouves: string[] };

// Sentences that contain at least one keyword of a criterion. Same keywords for every party.
export function trouverCandidats(
  pages: string[],
  criteres: { id: string; motsCles: string[] }[],
): Candidat[] {
  const out: Candidat[] = [];
  pages.forEach((texte, i) => {
    const phrases = normaliser(texte).split(/(?<=[.!?;:])\s+(?=[\p{Lu}"•\-–\d])|\s+•\s+/u);
    for (const phrase of phrases) {
      const p = sansAccents(phrase);
      for (const c of criteres) {
        const motsTrouves = c.motsCles.filter((m) => p.includes(sansAccents(m)));
        if (motsTrouves.length > 0) out.push({ critere: c.id, page: i + 1, phrase, motsTrouves });
      }
    }
  });
  return out;
}
