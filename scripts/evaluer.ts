/**
 * Measures how Socle handles real sentences heard in debates (evaluation/phrases.json).
 *   npm run evaluer          → keyword matching (what the site does today, free)
 *   npm run evaluer -- --ia  → orientation by the AI analysis step (paid, logged in depenses-api.json)
 */
import { readFileSync } from "node:fs";
import { interpreterQuestion } from "../src/lib/question";

type Phrase = { id: string; phrase: string; attendu: string[] };

async function orienterParMotsCles(p: Phrase) {
  const r = await interpreterQuestion(p.phrase);
  return r?.carte ?? (r ? `dossier:${r.dossier}` : null);
}

async function main() {
  const ia = process.argv.includes("--ia");
  const { phrases } = JSON.parse(readFileSync("evaluation/phrases.json", "utf8")) as { phrases: Phrase[] };
  let orienter = orienterParMotsCles;
  let fin = () => {};
  if (ia) {
    const { analyser, catalogue } = await import("./verifier-ia");
    const { documentsCorpus } = await import("./corpus");
    const { depense, plafond } = await import("./api-claude");
    const cat = catalogue(documentsCorpus());
    orienter = async (p) => {
      const { orientation } = (await analyser(p.phrase, p.id, cat)).resultat;
      // A card is the most precise answer; else the dossier; else nothing.
      return orientation.carte !== "aucune" ? orientation.carte : orientation.dossier !== "aucune" ? `dossier:${orientation.dossier}` : null;
    };
    fin = () => console.log(`Dépense totale enregistrée : ${depense().toFixed(3)} $ (plafond ${plafond()} $)`);
  }
  let justes = 0;
  for (const p of phrases) {
    const trouve = await orienter(p);
    const ok = trouve ? p.attendu.includes(trouve) : p.attendu.length === 0;
    if (ok) justes++;
    console.log(`${ok ? "✓" : "✗"} ${p.id}  ${trouve ?? "rien"}${ok ? "" : `  (attendu : ${p.attendu.join(" ou ") || "rien"})`}\n   « ${p.phrase} »`);
  }
  console.log(`\n${ia ? "IA" : "Mots-clés"} : ${justes}/${phrases.length} phrases bien orientées (${Math.round((100 * justes) / phrases.length)} %).`);
  fin();
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
