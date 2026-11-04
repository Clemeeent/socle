// Finds, in the sentence someone typed, the passages a card explains, so they can be highlighted.
// Pure functions (no data import), used in the browser and in tests.

export type Passage = {
  extrait?: string; // the passage as written in the card's own sentence
  motsCles: string[];
  type: "donnee" | "definition" | "source";
  note: string;
  source?: { label: string; url: string };
};

export type Morceau = { texte: string; passage?: number }; // passage = index in the card's list

// Accent-, case- and apostrophe-insensitive, keeping one output char per input char
// so that positions found in the normalised text are valid in the original.
function normaliserPosition(s: string) {
  return Array.from(s)
    .map((c) => {
      const n = c.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
      if (c === "’" || c === "‘") return "'";
      return n.length === 1 ? n : c.toLowerCase().slice(0, 1) || c;
    })
    .join("");
}

export function decouper(texte: string, passages: Passage[]): Morceau[] {
  const norm = normaliserPosition(texte);
  const pris: { debut: number; fin: number; passage: number }[] = [];
  passages.forEach((p, i) => {
    // Longest keywords first: "10 milliards" before "milliards".
    const mots = [...p.motsCles].sort((a, b) => b.length - a.length);
    for (const mot of mots) {
      const m = normaliserPosition(mot);
      let depart = 0;
      while (true) {
        const debut = norm.indexOf(m, depart);
        if (debut < 0) break;
        const fin = debut + m.length;
        if (!pris.some((x) => debut < x.fin && fin > x.debut)) {
          pris.push({ debut, fin, passage: i });
          return;
        }
        depart = debut + 1;
      }
    }
  });
  pris.sort((a, b) => a.debut - b.debut);
  const chars = Array.from(texte);
  const morceaux: Morceau[] = [];
  let curseur = 0;
  for (const x of pris) {
    if (x.debut > curseur) morceaux.push({ texte: chars.slice(curseur, x.debut).join("") });
    morceaux.push({ texte: chars.slice(x.debut, x.fin).join(""), passage: x.passage });
    curseur = x.fin;
  }
  if (curseur < chars.length) morceaux.push({ texte: chars.slice(curseur).join("") });
  return morceaux;
}

// The card's own sentence, cut along the passages it declares.
export const decouperAffirmation = (affirmation: string, passages: Passage[]) =>
  decouper(
    affirmation,
    passages.map((p) => ({ ...p, motsCles: p.extrait ? [p.extrait] : [] })),
  );
