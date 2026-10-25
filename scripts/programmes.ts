/**
 * Programmes des partis.
 *   npm run programmes:extraire  → texte page par page + passages candidats par critère
 *   npm run programmes:verifier  → contrôle data/positions.json contre les PDF
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { pagesAvecCitation, problemeCitation, trouverCandidats } from "../src/lib/programmes-core";

const DIR = "programmes";
const TYPES = ["programme-2027", "programme-presidentiel-2022", "texte-officiel"];
const STATUTS = ["à valider", "vérifié"];

export type Document = {
  id: string;
  parti: string;
  type: string;
  titre: string;
  annee: number;
  url: string;
  fichier: string;
  consulteLe: string;
  criteresAnalyses: string[];
};

export type Position = {
  id: string;
  parti: string;
  critere: string;
  document: string;
  resume: string;
  citation: string;
  page: number;
  lien: string;
  date: string;
  statut: string;
};

const lireJson = <T>(p: string): T => JSON.parse(readFileSync(p, "utf8"));

export async function textePages(fichierPdf: string): Promise<string[]> {
  const tache = getDocument({ data: new Uint8Array(readFileSync(fichierPdf)), useSystemFonts: true });
  const pdf = await tache.promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const contenu = await (await pdf.getPage(i)).getTextContent();
    pages.push(
      contenu.items.map((it) => ("str" in it ? it.str + (it.hasEOL ? "\n" : "") : "")).join(""),
    );
  }
  await tache.destroy();
  return pages;
}

// Pages are cached in programmes/_texte/ so the check stays fast.
async function pagesDe(doc: Document, racine: string): Promise<string[]> {
  const cache = join(racine, "_texte", `${doc.id}.json`);
  const pdf = join(racine, doc.fichier);
  if (!existsSync(pdf)) throw new Error(`${doc.id} : fichier ${pdf} introuvable`);
  if (existsSync(cache)) return lireJson<string[]>(cache);
  const pages = await textePages(pdf);
  mkdirSync(join(racine, "_texte"), { recursive: true });
  writeFileSync(cache, JSON.stringify(pages));
  return pages;
}

export async function verifier(opts: {
  documents: Document[];
  positions: Position[];
  partis: string[];
  criteres: string[];
  racine?: string;
}): Promise<string[]> {
  const racine = opts.racine ?? DIR;
  const erreurs: string[] = [];
  const docs = new Map(opts.documents.map((d) => [d.id, d]));
  for (const d of opts.documents) {
    if (!opts.partis.includes(d.parti)) erreurs.push(`${d.id} : parti inconnu « ${d.parti} »`);
    if (!TYPES.includes(d.type)) erreurs.push(`${d.id} : type inconnu « ${d.type} »`);
    if (!/^https:\/\//.test(d.url)) erreurs.push(`${d.id} : l'URL officielle doit commencer par https://`);
    for (const c of d.criteresAnalyses) if (!opts.criteres.includes(c)) erreurs.push(`${d.id} : critère inconnu « ${c} »`);
    if (!existsSync(join(racine, d.fichier))) erreurs.push(`${d.id} : fichier ${d.fichier} absent de ${racine}/`);
  }
  const ids = new Set<string>();
  for (const p of opts.positions) {
    const ici = `position ${p.id}`;
    if (ids.has(p.id)) erreurs.push(`${ici} : identifiant en double`);
    ids.add(p.id);
    const d = docs.get(p.document);
    if (!d) {
      erreurs.push(`${ici} : document « ${p.document} » non déclaré dans sources.json`);
      continue;
    }
    if (d.parti !== p.parti) erreurs.push(`${ici} : le document appartient à « ${d.parti} », pas à « ${p.parti} »`);
    if (!opts.criteres.includes(p.critere)) erreurs.push(`${ici} : critère inconnu « ${p.critere} »`);
    if (!d.criteresAnalyses.includes(p.critere))
      erreurs.push(`${ici} : le critère « ${p.critere} » n'est pas marqué comme analysé pour ${d.id}`);
    if (p.lien !== d.url) erreurs.push(`${ici} : le lien doit être l'URL du document (${d.url})`);
    if (!STATUTS.includes(p.statut)) erreurs.push(`${ici} : statut « ${p.statut} » invalide`);
    if (!p.resume?.trim()) erreurs.push(`${ici} : résumé vide`);
    const pb = problemeCitation(p.citation ?? "");
    if (pb) erreurs.push(`${ici} : ${pb}`);
    if (!existsSync(join(racine, d.fichier))) continue;
    const pages = await pagesDe(d, racine);
    if (!Number.isInteger(p.page) || p.page < 1 || p.page > pages.length) {
      erreurs.push(`${ici} : page ${p.page} hors du document (${pages.length} pages)`);
      continue;
    }
    const trouvees = pagesAvecCitation(p.citation, pages);
    if (!trouvees.includes(p.page)) {
      erreurs.push(
        trouvees.length
          ? `${ici} : citation trouvée page ${trouvees.join(", ")}, pas page ${p.page}`
          : `${ici} : citation introuvable mot pour mot dans ${d.fichier}`,
      );
    }
  }
  return erreurs;
}

async function main() {
  const commande = process.argv[2];
  const sources = lireJson<{ documents: Document[] }>(join(DIR, "sources.json"));
  const grille = lireJson<{ criteres: { id: string; motsCles: string[] }[] }>("data/grille.json");
  const partis = lireJson<{ partis: { id: string }[] }>("data/partis.json").partis.map((p) => p.id);

  if (commande === "extraire") {
    if (sources.documents.length === 0) {
      console.log("Aucun document déclaré dans programmes/sources.json : rien à extraire.");
      return;
    }
    mkdirSync(join(DIR, "candidats"), { recursive: true });
    for (const d of sources.documents) {
      const pages = await pagesDe(d, DIR);
      const candidats = trouverCandidats(pages, grille.criteres);
      writeFileSync(join(DIR, "candidats", `${d.id}.json`), JSON.stringify(candidats, null, 1) + "\n");
      const parCritere = grille.criteres.map((c) => `${c.id} ${candidats.filter((x) => x.critere === c.id).length}`);
      console.log(`${d.id} : ${pages.length} pages · passages candidats : ${parCritere.join(", ")}`);
    }
    return;
  }

  if (commande === "verifier") {
    const erreurs = await verifier({
      documents: sources.documents,
      positions: lireJson<Position[]>("data/positions.json"),
      partis,
      criteres: grille.criteres.map((c) => c.id),
    });
    if (erreurs.length) {
      console.error(`${erreurs.length} problème(s) :\n- ${erreurs.join("\n- ")}`);
      process.exit(1);
    }
    console.log("OK : chaque citation figure mot pour mot à la page indiquée.");
    return;
  }

  console.log("Usage : tsx scripts/programmes.ts extraire|verifier");
}

if (process.argv[1]?.endsWith("programmes.ts")) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
