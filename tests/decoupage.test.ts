import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { decouper, decouperAffirmation, type Passage } from "../src/lib/decoupage";

const passages: Passage[] = [
  { extrait: "10 milliards", motsCles: ["10 milliards", "milliards"], type: "donnee", note: "a" },
  { extrait: "jamais", motsCles: ["jamais", "record"], type: "donnee", note: "b" },
];

describe("decouper", () => {
  it("highlights the reader's own words, accent- and case-insensitive", () => {
    const m = decouper("Les 10 MILLIARDS de l'Éducation, c'est un RECORD !", passages);
    expect(m.filter((x) => x.passage !== undefined).map((x) => [x.texte, x.passage])).toEqual([
      ["10 MILLIARDS", 0],
      ["RECORD", 1],
    ]);
    expect(m.map((x) => x.texte).join("")).toBe("Les 10 MILLIARDS de l'Éducation, c'est un RECORD !");
  });
  it("prefers the longest keyword and never overlaps passages", () => {
    const m = decouper("dix milliards ou 10 milliards", passages);
    expect(m.find((x) => x.passage === 0)?.texte).toBe("10 milliards");
  });
  it("leaves the text untouched when nothing matches", () => {
    expect(decouper("rien à voir", passages)).toEqual([{ texte: "rien à voir" }]);
  });
});

describe("cards", () => {
  it("every passage with an extract is found in the card's own sentence", () => {
    const { cartes } = JSON.parse(readFileSync("data/cartes.json", "utf8"));
    for (const c of cartes) {
      const m = decouperAffirmation(c.affirmation, c.decoupage);
      const trouves = new Set(m.filter((x) => x.passage !== undefined).map((x) => x.passage));
      c.decoupage.forEach((p: Passage, i: number) => {
        if (p.extrait) expect(trouves.has(i), `${c.id} : « ${p.extrait} »`).toBe(true);
      });
    }
  });
});

describe("narratives", () => {
  it("every citation points to an existing source and every paragraph passage exists", () => {
    const { cartes } = JSON.parse(readFileSync("data/cartes.json", "utf8"));
    for (const c of cartes) {
      // Cards tied to a dossier get one computed fact first.
      const nSources = (c.dossier ? 1 : 0) + c.faits.length + c.inconnu.filter((x: { source?: unknown }) => x.source).length;
      for (const p of c.recit.paragraphes) {
        for (const m of p.texte.matchAll(/\[(\d+)\]/g)) {
          const n = Number(m[1]);
          expect(n >= 1 && n <= nSources, `${c.id} : [${n}] sur ${nSources} sources`).toBe(true);
        }
        if (p.passage !== undefined) expect(c.decoupage[p.passage], `${c.id} passage ${p.passage}`).toBeDefined();
      }
      expect(c.debat.length, c.id).toBeGreaterThan(0);
    }
  });
});
