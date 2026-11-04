import { describe, expect, it } from "vitest";
import {
  chiffresAbsents,
  controlerFait,
  decouperPassages,
  htmlVersTexte,
  indexer,
  nombres,
  rechercher,
} from "../src/lib/corpus";
import { controler, type Redaction } from "../src/lib/verificateur-ia";

describe("htmlVersTexte", () => {
  it("keeps the text, drops scripts and menus, decodes entities", () => {
    const t = htmlVersTexte(
      "<html><nav>Menu</nav><script>x=1</script><p>Cr&eacute;dits&nbsp;: 63,02&#160;milliards</p><p>Fin</p></html>",
    );
    expect(t).toBe("Crédits : 63,02 milliards\nFin");
  });
});

describe("nombres", () => {
  it("reads French numbers, with decimal commas and thousands spaces", () => {
    expect(nombres("63,02 milliards, +18,8 %, 10 920 € en 2024")).toEqual(["63.02", "18.8", "10920", "2024"]);
  });
  it("flags figures of an answer absent from the citations", () => {
    expect(chiffresAbsents("6,7 % en 2023, 7,8 % avant", ["En 2023, la part s'établit à 6,7 %."])).toEqual(["7.8"]);
  });
});

describe("recherche", () => {
  const passages = decouperPassages("doc", [
    "La dépense intérieure d'éducation représente 6,7 % du PIB.\nAutre sujet : les contrôles d'identité.",
  ]);
  it("ranks passages by keywords, accent-insensitive", () => {
    const r = rechercher(indexer(passages), "depense education PIB");
    expect(r[0].passage.texte).toContain("6,7 %");
  });
});

describe("controlerFait", () => {
  const passages = decouperPassages("doc", ["En 2023, la dépense s'établit à 6,7 % du PIB.", "x".repeat(950), "Un chiffre de 2024 ailleurs."]);
  it("needs the fact's figures together in one passage", () => {
    expect(controlerFait("6,7 % du PIB en 2023", passages).etat).toBe("meme-passage");
    expect(controlerFait("6,7 % du PIB en 2024", passages).etat).toBe("disperses");
    expect(controlerFait("6,8 % du PIB en 2024", passages)).toEqual({ etat: "absents", absents: ["6.8"] });
  });
});

describe("controler (réponse de l'IA)", () => {
  const passages = decouperPassages("depp", ["En 2023, le poids des dépenses d'éducation dans le PIB s'établit à 6,7 %."]);
  const id = passages[0].id;
  const base: Redaction = { titre: "Non, en part du PIB", affirmations: [], inconnu: [], pourLancerLeDebat: [] };

  it("keeps an answer whose citation is verbatim and whose figures are quoted", () => {
    const r = controler(
      { ...base, affirmations: [{ extrait: "record", statut: "contredit", reponse: "6,7 % du PIB en 2023.", citations: [{ passage: id, extrait: "En 2023, le poids des dépenses d’éducation dans le PIB s’établit à 6,7 %." }] }] },
      passages,
    );
    expect(r.controles.every((c) => c.erreurs.length === 0)).toBe(true);
    expect(r.redaction.affirmations[0].statut).toBe("contredit");
  });

  it("turns an invented figure or citation into « on ne sait pas »", () => {
    const r = controler(
      {
        ...base,
        affirmations: [
          { extrait: "a", statut: "contredit", reponse: "6,8 % du PIB en 2024.", citations: [{ passage: id, extrait: "s'établit à 6,7 %" }] },
          { extrait: "b", statut: "etabli", reponse: "Oui.", citations: [{ passage: id, extrait: "une phrase qui n'existe pas" }] },
          { extrait: "c", statut: "etabli", reponse: "Oui.", citations: [] },
        ],
      },
      passages,
    );
    expect(r.redaction.affirmations.map((a) => a.statut)).toEqual(["on-ne-sait-pas", "on-ne-sait-pas", "on-ne-sait-pas"]);
    expect(r.redaction.affirmations[0].rejete?.erreurs[0]).toContain("6.8");
  });
});
