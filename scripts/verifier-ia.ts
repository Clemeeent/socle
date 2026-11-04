/**
 * AI checker, behind the scenes: turns a sentence into a draft answer for human review.
 *   npm run verifier -- "La phrase entendue"   → one draft in brouillons/
 *   npm run verifier -- --evaluation           → a draft for every sentence of evaluation/phrases.json
 * Steps: analysis (claims + searches) → keyword search in the corpus → answer written from the
 * passages only → automatic checks (verbatim citations, figures). Needs corpus:telecharger first.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { appelerJson, depense, MODELE, plafond } from "./api-claude";
import { chargerPassages } from "./corpus";
import { indexer, rechercher, type DocumentCorpus, type Passage } from "../src/lib/corpus";
import {
  controler,
  extraitsHorsPhrase,
  messageRedaction,
  schemaAnalyse,
  schemaRedaction,
  systemeAnalyse,
  systemeRedaction,
  type Analyse,
  type Catalogue,
  type Redaction,
} from "../src/lib/verificateur-ia";

type CarteJson = { id: string; affirmation: string; enBref: string; faits: { source: { url: string } }[] };
const lireJson = <T>(p: string): T => JSON.parse(readFileSync(p, "utf8"));

export function catalogue(documents: DocumentCorpus[]): Catalogue & { cartesCompletes: CarteJson[] } {
  const { cartes } = lireJson<{ cartes: CarteJson[] }>("data/cartes.json");
  const { dossiers } = lireJson<{ dossiers: { id: string; titre: string; question: string }[] }>("data/dossiers.json");
  return {
    cartes: cartes.map(({ id, affirmation, enBref }) => ({ id, affirmation, enBref })),
    dossiers: dossiers.map(({ id, titre, question }) => ({ id, titre, question })),
    documents,
    cartesCompletes: cartes,
  };
}

export async function analyser(phrase: string, ref: string, cat: Catalogue) {
  return appelerJson<Analyse>({
    etape: "analyse",
    ref,
    systeme: systemeAnalyse(cat),
    message: `Phrase : « ${phrase} »`,
    schema: schemaAnalyse(cat),
    effort: "low",
  });
}

const MAX_PAR_AFFIRMATION = 8;
const MAX_PASSAGES = 30;

// Keyword search for each claim, plus the sources of the card the sentence was oriented to.
function choisirPassages(analyse: Analyse, passages: Passage[], cat: ReturnType<typeof catalogue>): Passage[] {
  const index = indexer(passages);
  const carte = cat.cartesCompletes.find((c) => c.id === analyse.orientation.carte);
  const docsCarte = new Set(
    (carte?.faits ?? []).flatMap((f) => cat.documents.filter((d) => d.url === f.source.url).map((d) => d.id)),
  );
  const indexCarte = indexer(passages.filter((p) => docsCarte.has(p.document)));
  const retenus = new Map<string, Passage>();
  for (const a of analyse.affirmations) {
    const scores = new Map<string, { passage: Passage; score: number }>();
    for (const q of [a.question, ...a.requetes]) {
      for (const r of [...rechercher(index, q, 4), ...(docsCarte.size ? rechercher(indexCarte, q, 2) : [])]) {
        const avant = scores.get(r.passage.id);
        scores.set(r.passage.id, { passage: r.passage, score: (avant?.score ?? 0) + r.score });
      }
    }
    [...scores.values()]
      .sort((x, y) => y.score - x.score)
      .slice(0, MAX_PAR_AFFIRMATION)
      .forEach((r) => retenus.set(r.passage.id, r.passage));
  }
  return [...retenus.values()].slice(0, MAX_PASSAGES);
}

const slug = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

export async function verifierPhrase(phrase: string, ref: string) {
  const { documents, passages, manquants } = chargerPassages();
  if (!passages.length) throw new Error("Corpus vide : lancer d'abord npm run corpus:telecharger");
  const cat = catalogue(documents);

  const a = await analyser(phrase, ref, cat);
  const choisis = choisirPassages(a.resultat, passages, cat);
  const r = await appelerJson<Redaction>({
    etape: "redaction",
    ref,
    systeme: systemeRedaction,
    message: messageRedaction(phrase, a.resultat.affirmations, choisis, documents),
    schema: schemaRedaction,
    effort: "medium",
  });
  const { redaction, controles } = controler(r.resultat, choisis);

  const docs = new Map(documents.map((d) => [d.id, d]));
  const cites = [...new Set(redaction.affirmations.flatMap((x) => x.citations.map((c) => c.passage)))];
  const brouillon = {
    statut: "brouillon généré par IA, non relu",
    phrase,
    ref,
    genereLe: new Date().toISOString(),
    modele: MODELE,
    cout: Math.round((a.cout + r.cout) * 10000) / 10000,
    orientation: a.resultat.orientation,
    analyse: a.resultat.affirmations,
    extraitsHorsPhrase: extraitsHorsPhrase(phrase, a.resultat),
    reponse: redaction,
    controles: controles.filter((c) => c.erreurs.length),
    sources: cites.map((id) => {
      const p = choisis.find((x) => x.id === id)!;
      const d = docs.get(p.document)!;
      return { passage: id, organisme: d.organisme, titre: d.titre, nature: d.nature, url: d.url, page: p.page };
    }),
    passagesConsultes: choisis.map((p) => p.id),
    documentsNonTelecharges: manquants,
  };
  mkdirSync("brouillons", { recursive: true });
  const fichier = join("brouillons", `${ref}.json`);
  writeFileSync(fichier, JSON.stringify(brouillon, null, 1) + "\n");
  return { brouillon, fichier };
}

function afficher(b: Awaited<ReturnType<typeof verifierPhrase>>["brouillon"], fichier: string) {
  console.log(`\n« ${b.phrase} »`);
  console.log(`→ carte : ${b.orientation.carte} · dossier : ${b.orientation.dossier}`);
  console.log(`  ${b.reponse.titre}`);
  for (const x of b.reponse.affirmations)
    console.log(`  • « ${x.extrait} » [${x.statut}] ${x.reponse}${x.citations.length ? ` (${x.citations.map((c) => c.passage).join(", ")})` : ""}`);
  for (const c of b.controles) console.log(`  ⚠ ${c.affirmation} : ${c.erreurs.join(" ; ")}`);
  console.log(`  ${fichier} · ${b.cout.toFixed(3)} $`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === "--evaluation") {
    const { phrases } = lireJson<{ phrases: { id: string; phrase: string; attendu: string[] }[] }>("evaluation/phrases.json");
    const seulement = args.slice(1);
    for (const p of phrases.filter((x) => !seulement.length || seulement.includes(x.id))) {
      const { brouillon, fichier } = await verifierPhrase(p.phrase, p.id);
      afficher(brouillon, fichier);
    }
  } else if (args[0]) {
    const phrase = args.join(" ");
    const { brouillon, fichier } = await verifierPhrase(phrase, `${new Date().toISOString().slice(0, 10)}-${slug(phrase)}`);
    afficher(brouillon, fichier);
  } else {
    console.log('Usage : npm run verifier -- "phrase"  |  npm run verifier -- --evaluation [p01 p02…]');
    return;
  }
  console.log(`\nDépense totale enregistrée : ${depense().toFixed(3)} $ (plafond ${plafond()} $)`);
}

if (process.argv[1]?.endsWith("verifier-ia.ts")) {
  main().catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  });
}
