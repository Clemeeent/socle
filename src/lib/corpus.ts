// The corpus the AI checker may cite: official documents downloaded as text (corpus/_texte/),
// cut into passages, searched by keywords (BM25), and the automatic checks on what the model writes.
// Pure functions (no file access), shared by the scripts and the tests.
import { normaliser, sansAccents } from "./programmes-core";

export type NatureSource = "officielle" | "verification" | "presse" | "encyclopedie";

export type DocumentCorpus = {
  id: string;
  titre: string;
  organisme: string;
  nature: NatureSource;
  url: string;
};

export type Passage = {
  id: string; // "<document>#<n>"
  document: string;
  page: number; // 1-based (HTML documents have a single page)
  texte: string;
};

// ── HTML → text ──────────────────────────────────────────────────────────────

const ENTITES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", laquo: "«", raquo: "»",
  rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", hellip: "…", ndash: "–", mdash: "—",
  eacute: "é", egrave: "è", ecirc: "ê", euml: "ë", agrave: "à", acirc: "â", ccedil: "ç",
  icirc: "î", iuml: "ï", ocirc: "ô", ugrave: "ù", ucirc: "û", uuml: "ü", oelig: "œ",
  Eacute: "É", Egrave: "È", Ecirc: "Ê", Agrave: "À", Acirc: "Â", Ccedil: "Ç", Ocirc: "Ô",
  OElig: "Œ", euro: "€", deg: "°", middot: "·", shy: "\xAD", thinsp: " ", ensp: " ", emsp: " ",
};

export const decoderEntites = (s: string) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+\d*);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const code = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENTITES[e] ?? m;
  });

export function htmlVersTexte(html: string): string {
  // Prefer the main content when the page marks it.
  const principal = html.match(/<main[\s>][\s\S]*?<\/main>/i)?.[0] ?? html.match(/<article[\s>][\s\S]*<\/article>/i)?.[0];
  return decoderEntites(
    (principal ?? html)
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<(script|style|noscript|svg|nav|header|footer|form|aside|button|select|iframe)[\s>][\s\S]*?<\/\1>/gi, " ")
      .replace(/<(br|hr)\b[^>]*>/gi, "\n")
      .replace(/<\/(p|div|li|h[1-6]|tr|table|section|blockquote|dd|dt|figcaption|caption)>/gi, "\n")
      .replace(/<(td|th)\b[^>]*>/gi, " | ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/[ \t\f\v ]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

// ── Passages and search ──────────────────────────────────────────────────────

const TAILLE_PASSAGE = 900;

// Cuts each page into passages of about TAILLE_PASSAGE characters, along line breaks.
export function decouperPassages(document: string, pages: string[]): Passage[] {
  const out: Passage[] = [];
  pages.forEach((page, i) => {
    let courant = "";
    const pousser = () => {
      const t = courant.trim();
      if (t) out.push({ id: `${document}#${out.length + 1}`, document, page: i + 1, texte: t });
      courant = "";
    };
    for (const ligne of page.split("\n")) {
      // Very long lines (PDF pages without line breaks) are cut along sentences.
      const morceaux = ligne.length > TAILLE_PASSAGE ? ligne.split(/(?<=[.!?;])\s+/) : [ligne];
      for (const m of morceaux) {
        if (courant.length + m.length > TAILLE_PASSAGE && courant.length > 0) pousser();
        courant += (courant ? "\n" : "") + m;
      }
    }
    pousser();
  });
  return out;
}

const MOTS_VIDES = new Set(
  "les des une est pas que qui pour par dans sur avec son ses aux plus mais ont été etre être cette ces leur leurs elle ils nous vous tout tous sont fait faire entre comme sans sous dont aussi elles lui deja bien tres".split(" "),
);

export function mots(s: string): string[] {
  return sansAccents(s)
    .split(/[^a-z0-9]+/)
    .filter((m) => m.length > 2 || /^\d+$/.test(m))
    .filter((m) => !MOTS_VIDES.has(m))
    .map((m) => (m.length > 4 ? m.replace(/(es|s|x)$/, "") : m));
}

export type Index = { passages: Passage[]; mots: string[][]; df: Map<string, number>; longueurMoyenne: number };

export function indexer(passages: Passage[]): Index {
  const ms = passages.map((p) => mots(p.texte));
  const df = new Map<string, number>();
  for (const m of ms) for (const t of new Set(m)) df.set(t, (df.get(t) ?? 0) + 1);
  const longueurMoyenne = ms.reduce((a, m) => a + m.length, 0) / Math.max(1, ms.length);
  return { passages, mots: ms, df, longueurMoyenne };
}

// BM25: the classic keyword ranking. No AI here, so the retrieval step stays inspectable.
export function rechercher(index: Index, requete: string, k = 6): { passage: Passage; score: number }[] {
  const q = [...new Set(mots(requete))];
  const N = index.passages.length;
  const k1 = 1.2;
  const b = 0.75;
  return index.mots
    .map((m, i) => {
      let score = 0;
      for (const t of q) {
        const f = m.filter((x) => x === t).length;
        if (!f) continue;
        const n = index.df.get(t) ?? 0;
        const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
        score += (idf * f * (k1 + 1)) / (f + k1 * (1 - b + (b * m.length) / index.longueurMoyenne));
      }
      return { passage: index.passages[i], score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b2) => b2.score - a.score)
    .slice(0, k);
}

// ── Automatic checks on what the model writes ────────────────────────────────

// Numbers as written in French ("63,02", "10 920", "18,8 %", "1989"), normalised to "63.02", "10920"…
export function nombres(texte: string): string[] {
  const t = normaliser(texte).replace(/(\d)[  ](?=\d{3}\b)/g, "$1");
  return [...new Set((t.match(/\d+(?:[.,]\d+)?/g) ?? []).map((n) => n.replace(",", ".").replace(/^0+(?=\d)/, "")))];
}

// Numbers of a written answer that appear in none of the cited texts.
export function chiffresAbsents(reponse: string, textesCites: string[]): string[] {
  const disponibles = new Set(textesCites.flatMap(nombres));
  return nombres(reponse).filter((n) => !disponibles.has(n));
}

export const citationDansPassage = (citation: string, passage: string) =>
  citation.trim().length > 0 && normaliser(passage).includes(normaliser(citation));

// Where a card's fact stands against its downloaded source. Figures must sit together in one
// passage (or two neighbouring ones): figures scattered across a long PDF prove nothing.
export type EtatFait =
  | { etat: "aucun-chiffre" }
  | { etat: "meme-passage"; passage: Passage }
  | { etat: "disperses"; chiffres: string[] }
  | { etat: "absents"; absents: string[] };

export function controlerFait(texte: string, passages: Passage[]): EtatFait {
  const chiffres = nombres(texte);
  if (!chiffres.length) return { etat: "aucun-chiffre" };
  const presents = new Set(passages.flatMap((p) => nombres(p.texte)));
  const absents = chiffres.filter((n) => !presents.has(n));
  if (absents.length) return { etat: "absents", absents };
  for (let i = 0; i < passages.length; i++) {
    const fenetre = new Set([...nombres(passages[i].texte), ...(passages[i + 1] ? nombres(passages[i + 1].texte) : [])]);
    if (chiffres.every((n) => fenetre.has(n))) return { etat: "meme-passage", passage: passages[i] };
  }
  return { etat: "disperses", chiffres };
}
