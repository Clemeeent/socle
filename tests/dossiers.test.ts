import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dossiers, getTheme, VERDICTS } from "../src/lib/data";

const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
const affirmations = dossiers.flatMap((d) => d.affirmations ?? []);

describe("dossiers", () => {
  it("each colour has its palette in globals.css", () => {
    for (const d of dossiers) {
      for (const k of ["bg", "ink", "a", "b"]) expect(css).toContain(`--dossier-${d.couleur}-${k}:`);
    }
  });
  it("declared themes exist", () => {
    for (const d of dossiers) for (const t of d.themes ?? []) expect(getTheme(t), t).toBeDefined();
  });
});

// Never a verdict without the facts: values must come from an official source, the claim's origin
// must be found, and every value must say where it was read.
describe("affirmations", () => {
  it("every value points to a source and a precise reference", () => {
    for (const a of affirmations)
      for (const i of a.indicateurs)
        for (const v of i.valeurs) {
          expect(v.source, `${a.id}/${i.id}/${v.annee}`).toMatch(/^https:\/\//);
          expect(v.reference.trim(), `${a.id}/${i.id}/${v.annee}`).not.toBe("");
        }
  });
  it("a verdict needs the origin of the claim and data for every indicator", () => {
    for (const a of affirmations) {
      expect(VERDICTS).toContain(a.verdict);
      if (a.verdict === "à établir") {
        expect(a.explication, a.id).toBeNull();
        continue;
      }
      expect(a.origine.etat, a.id).toBe("trouvée");
      expect(a.origine.source, a.id).toMatch(/^https:\/\//);
      expect(a.explication?.trim(), a.id).toBeTruthy();
      for (const i of a.indicateurs) expect(i.valeurs.length, `${a.id}/${i.id}`).toBeGreaterThanOrEqual(2);
    }
  });
});
