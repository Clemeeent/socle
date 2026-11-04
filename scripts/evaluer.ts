/**
 * Measures how Socle handles real sentences heard in debates (evaluation/phrases.json).
 * Today: keyword matching. Later: the AI pipeline, measured on the same list.
 * Usage: npm run evaluer
 */
import { readFileSync } from "node:fs";
import { interpreterQuestion } from "../src/lib/question";

type Phrase = { id: string; phrase: string; attendu: string[] };

async function main() {
  const { phrases } = JSON.parse(readFileSync("evaluation/phrases.json", "utf8")) as { phrases: Phrase[] };
  let justes = 0;
  for (const p of phrases) {
    const r = await interpreterQuestion(p.phrase);
    const trouve = r?.carte ?? (r ? `dossier:${r.dossier}` : null);
    const ok = trouve ? p.attendu.includes(trouve) : p.attendu.length === 0;
    if (ok) justes++;
    console.log(`${ok ? "✓" : "✗"} ${p.id}  ${trouve ?? "rien"}${ok ? "" : `  (attendu : ${p.attendu.join(" ou ") || "rien"})`}\n   « ${p.phrase} »`);
  }
  console.log(`\n${justes}/${phrases.length} phrases bien orientées (${Math.round((100 * justes) / phrases.length)} %).`);
}

main();
