import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { citationPresente, normaliser, problemeCitation, trouverCandidats } from "../src/lib/programmes-core";
import { textePages, verifier, type Document, type Position } from "../scripts/programmes";

describe("normaliser", () => {
  it("unifies apostrophes, quotes, ligatures and spaces but keeps words", () => {
    expect(normaliser("l’eﬃcacité  « libre »")).toBe(`l'efficacité "libre"`);
  });
  it("joins words hyphenated at a line break", () => {
    expect(normaliser("vidéo-\nprotection")).toBe("vidéoprotection");
  });
});

describe("citations", () => {
  it("rejects cut, empty or too long citations", () => {
    expect(problemeCitation("Nous […] supprimerons")).toMatch(/continu/);
    expect(problemeCitation(" ")).toMatch(/vide/);
    expect(problemeCitation("a".repeat(301))).toMatch(/trop longue/);
    expect(problemeCitation("Nous supprimerons les contrôles.")).toBeNull();
  });
  it("is case and word sensitive", () => {
    expect(citationPresente("Nous supprimerons", "nous supprimerons")).toBe(false);
    expect(citationPresente("Nous supprimerons tous", "Nous supprimerons les")).toBe(false);
  });
});

describe("trouverCandidats", () => {
  it("finds sentences with a criterion keyword, accent-insensitive", () => {
    const c = trouverCandidats(["La politique agricole. Nous limiterons la VIDEOPROTECTION."], [
      { id: "surveillance", motsCles: ["vidéoprotection"] },
    ]);
    expect(c).toEqual([
      { critere: "surveillance", page: 1, phrase: "Nous limiterons la VIDEOPROTECTION.", motsTrouves: ["vidéoprotection"] },
    ]);
  });
});

describe("verifier (fictional test PDF)", () => {
  const doc: Document = {
    id: "test",
    parti: "lfi",
    type: "texte-officiel",
    titre: "Document de test fictif",
    annee: 2026,
    url: "https://example.org/test.pdf",
    fichier: "test-fictif.pdf",
    consulteLe: "2026-10-25",
    criteresAnalyses: ["surveillance", "police"],
  };
  const pos = (p: Partial<Position>): Position => ({
    id: "p1",
    parti: "lfi",
    critere: "police",
    document: "test",
    resume: "Supprimer les contrôles d'identité sans motif.",
    citation: "Nous supprimerons les contrôles d’identité sans motif.",
    page: 2,
    lien: doc.url,
    date: "2026",
    statut: "à valider",
    ...p,
  });
  const run = (positions: Position[]) =>
    verifier({
      documents: [doc],
      positions,
      partis: ["lfi"],
      criteres: ["surveillance", "police", "expression", "manifester"],
      racine: "tests/fixtures",
    });

  it("reads the PDF page by page", async () => {
    const pages = await textePages("tests/fixtures/test-fictif.pdf");
    expect(pages).toHaveLength(2);
    expect(normaliser(pages[1])).toContain("vidéoprotection");
  });
  it("accepts a verbatim citation on the right page", async () => {
    expect(await run([pos({})])).toEqual([]);
  });
  it("rejects a wrong page and says where the citation is", async () => {
    expect(await run([pos({ page: 1 })])).toEqual([expect.stringMatching(/trouvée page 2, pas page 1/)]);
  });
  it("rejects an invented or reworded citation", async () => {
    expect(await run([pos({ citation: "Nous interdirons les contrôles d'identité." })])).toEqual([
      expect.stringMatching(/introuvable mot pour mot/),
    ]);
  });
  it("rejects a position on a criterion not marked as analysed", async () => {
    expect(await run([pos({ critere: "expression" })])).toEqual([expect.stringMatching(/pas marqué comme analysé/)]);
  });
});

describe("data files", () => {
  it("every position in data/positions.json is verified against its PDF", async () => {
    const sources = JSON.parse(readFileSync("programmes/sources.json", "utf8"));
    const dossiers = JSON.parse(readFileSync("data/dossiers.json", "utf8")).dossiers;
    const partis = JSON.parse(readFileSync("data/partis.json", "utf8"));
    const erreurs = await verifier({
      documents: sources.documents,
      positions: JSON.parse(readFileSync("data/positions.json", "utf8")),
      partis: partis.partis.map((p: { id: string }) => p.id),
      criteres: dossiers.flatMap((d: { criteres: { id: string }[] }) => d.criteres.map((c) => c.id)),
    });
    expect(erreurs).toEqual([]);
  });
});
