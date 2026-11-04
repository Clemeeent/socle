/**
 * Corpus of documents the AI checker may cite (corpus/sources.json).
 *   npm run corpus:telecharger → downloads each document, extracts its text into corpus/_texte/
 *                                and records date, size and fingerprint in corpus/manifeste.json
 *   npm run corpus:controler   → for each fact of data/cartes.json, checks that its figures
 *                                appear in the downloaded source (report: evaluation/controle-faits.md)
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { textePages } from "./programmes";
import { controlerFait, decouperPassages, htmlVersTexte, type DocumentCorpus, type Passage } from "../src/lib/corpus";

const DIR = "corpus";
const CACHE = ".cache/corpus";
const UA = "Mozilla/5.0 (compatible; Socle/0.1; verification de faits, projet citoyen)";

type Manifeste = Record<
  string,
  { url: string; telechargeLe: string; sha256: string; octets: number; format: "pdf" | "html"; pages: number; caracteres: number } | { url: string; erreur: string; essaye: string }
>;

const lireJson = <T>(p: string): T => JSON.parse(readFileSync(p, "utf8"));
export const documentsCorpus = () => lireJson<{ documents: DocumentCorpus[] }>(join(DIR, "sources.json")).documents;
const attendre = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function telechargerUn(url: string): Promise<{ octets: Buffer; type: string }> {
  let derniere: unknown;
  for (const delai of [0, 2000, 4000, 8000]) {
    if (delai) await attendre(delai);
    try {
      const r = await fetch(url, { headers: { "user-agent": UA, accept: "text/html,application/pdf,*/*" }, signal: AbortSignal.timeout(60_000) });
      if (!r.ok) {
        derniere = new Error(`HTTP ${r.status}`);
        if (r.status === 403 || r.status === 404) break; // a refusal, not a network hiccup
        continue;
      }
      return { octets: Buffer.from(await r.arrayBuffer()), type: r.headers.get("content-type") ?? "" };
    } catch (e) {
      derniere = e;
    }
  }
  throw derniere;
}

// HTML pages declare their charset in the header or in a <meta> tag (senat.fr is still in latin-1).
function decoderHtml(octets: Buffer, type: string): string {
  const brut = octets.toString("latin1");
  const charset = (type.match(/charset=([\w-]+)/i)?.[1] ?? brut.match(/<meta[^>]+charset=["']?([\w-]+)/i)?.[1] ?? "utf-8").toLowerCase();
  return new TextDecoder(charset === "iso-8859-1" || charset === "latin1" ? "windows-1252" : charset).decode(octets);
}

async function telecharger() {
  const manifeste: Manifeste = existsSync(join(DIR, "manifeste.json")) ? lireJson(join(DIR, "manifeste.json")) : {};
  mkdirSync(CACHE, { recursive: true });
  mkdirSync(join(DIR, "_texte"), { recursive: true });
  for (const d of documentsCorpus()) {
    process.stdout.write(`${d.id} … `);
    try {
      const { octets, type } = await telechargerUn(d.url);
      const pdf = type.includes("pdf") || octets.subarray(0, 5).toString() === "%PDF-";
      const fichier = join(CACHE, `${d.id}.${pdf ? "pdf" : "html"}`);
      writeFileSync(fichier, octets);
      const pages = pdf ? await textePages(fichier) : [htmlVersTexte(decoderHtml(octets, type))];
      const caracteres = pages.reduce((a, p) => a + p.length, 0);
      if (caracteres < 500) throw new Error(`texte trop court (${caracteres} caractères) : page de blocage ou contenu en JavaScript ?`);
      writeFileSync(join(DIR, "_texte", `${d.id}.json`), JSON.stringify(pages));
      manifeste[d.id] = {
        url: d.url,
        telechargeLe: new Date().toISOString().slice(0, 10),
        sha256: createHash("sha256").update(octets).digest("hex"),
        octets: octets.length,
        format: pdf ? "pdf" : "html",
        pages: pages.length,
        caracteres,
      };
      console.log(`ok (${pdf ? `PDF, ${pages.length} pages` : "HTML"}, ${caracteres} caractères)`);
    } catch (e) {
      const erreur = e instanceof Error ? `${e.message}${e.cause ? ` (${String((e.cause as Error).message ?? e.cause)})` : ""}` : String(e);
      // Keep a previous successful download if this attempt failed.
      if (!manifeste[d.id] || "erreur" in manifeste[d.id]) manifeste[d.id] = { url: d.url, erreur, essaye: new Date().toISOString().slice(0, 10) };
      console.log(`échec : ${erreur}`);
    }
  }
  writeFileSync(join(DIR, "manifeste.json"), JSON.stringify(manifeste, null, 1) + "\n");
}

// All passages of the downloaded documents.
export function chargerPassages(): { documents: DocumentCorpus[]; passages: Passage[]; manquants: string[] } {
  const documents = documentsCorpus();
  const passages: Passage[] = [];
  const manquants: string[] = [];
  for (const d of documents) {
    const f = join(DIR, "_texte", `${d.id}.json`);
    if (!existsSync(f)) {
      manquants.push(d.id);
      continue;
    }
    passages.push(...decouperPassages(d.id, lireJson<string[]>(f)));
  }
  return { documents, passages, manquants };
}

type Fait = { texte: string; source: { label: string; url: string }; statut: string };
type Carte = { id: string; faits: Fait[] };

function controler() {
  const documents = documentsCorpus();
  const { cartes } = lireJson<{ cartes: Carte[] }>("data/cartes.json");
  const lignes = [
    "# Contrôle automatique des chiffres des cartes",
    "",
    `_Généré par \`npm run corpus:controler\` le ${new Date().toISOString().slice(0, 10)}._`,
    "",
    "Pour chaque fait, on cherche ses chiffres (années comprises) ensemble dans un même passage du texte",
    "téléchargé de sa source. 🟢 ne veut pas dire « vérifié » : il reste à lire le passage pour confirmer qu'il",
    "dit bien ce que dit le fait. 🟡 (chiffres dispersés) et 🟠 (chiffres absents) signalent une erreur possible,",
    "un calcul fait par la carte, une autre source que celle citée, ou un chiffre écrit autrement (en lettres,",
    "dans un tableau). Le statut d'un fait ne passe à « vérifié » qu'après relecture humaine.",
    "",
  ];
  let total = 0;
  let complets = 0;
  for (const c of cartes) {
    if (!c.faits.length) continue;
    lignes.push(`## ${c.id}`, "");
    for (const f of c.faits) {
      total++;
      const d = documents.find((x) => x.url === f.source.url);
      const fichier = d && join(DIR, "_texte", `${d.id}.json`);
      if (!d || !existsSync(fichier!)) {
        lignes.push(`- ⬜ ${f.texte}\n  - source non téléchargée (${d ? d.id : "absente de corpus/sources.json"})`);
        continue;
      }
      const r = controlerFait(f.texte, decouperPassages(d.id, lireJson<string[]>(fichier!)));
      if (r.etat === "meme-passage" || r.etat === "aucun-chiffre") complets++;
      const detail =
        r.etat === "aucun-chiffre"
          ? "aucun chiffre (citation et sens à relire)"
          : r.etat === "meme-passage"
            ? `chiffres réunis dans un même passage${r.passage.page > 1 || d.url.endsWith(".pdf") ? ` (page ${r.passage.page})` : ""} : « ${r.passage.texte.replace(/\s+/g, " ").slice(0, 160)}… »`
            : r.etat === "disperses"
              ? "chiffres présents dans la source mais jamais ensemble : le fait mélange peut-être plusieurs passages ou plusieurs années"
              : `absents de la source : ${r.absents.join(", ")}`;
      const icone = { "aucun-chiffre": "⚪", "meme-passage": "🟢", disperses: "🟡", absents: "🟠" }[r.etat];
      lignes.push(`- ${icone} ${f.texte}\n  - ${d.id} · statut : ${f.statut} · ${detail}`);
    }
    lignes.push("");
  }
  lignes.splice(4, 0, `**${complets} faits sur ${total}** passent le contrôle (🟢 chiffres réunis dans un même passage de la source, ⚪ pas de chiffre).`, "");
  writeFileSync("evaluation/controle-faits.md", lignes.join("\n"));
  console.log(`${complets}/${total} faits passent le contrôle → evaluation/controle-faits.md`);
}

if (process.argv[1]?.endsWith("corpus.ts")) {
  const commande = process.argv[2];
  if (commande === "telecharger") telecharger();
  else if (commande === "controler") controler();
  else console.log("Usage : tsx scripts/corpus.ts telecharger|controler");
}
