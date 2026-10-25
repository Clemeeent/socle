/**
 * Downloads the Assemblée nationale open data and writes the small JSON files
 * the site reads (data/scrutins.json, data/groupes.json, data/deputes.json,
 * data/dossiers.json, data/meta.json).
 *
 * Only the scrutins listed in data/grille.json are kept.
 * Usage: npm run import
 */
import { mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { unzipSync, strFromU8 } from "fflate";

const BASE = "https://data.assemblee-nationale.fr/static/openData/repository";
const CACHE = ".cache/an";
const DATA = "data";

const sources = {
  scrutins: (leg: number) => `${BASE}/${leg}/loi/scrutins/Scrutins.json.zip`,
  dossiers: (leg: number) =>
    `${BASE}/${leg}/loi/dossiers_legislatifs/Dossiers_Legislatifs.json.zip`,
  acteurs: `${BASE}/17/amo/tous_acteurs_mandats_organes_xi_legislature/AMO30_tous_acteurs_tous_mandats_tous_organes_historique.json.zip`,
};

type Grille = {
  textes: { id: string; scrutin: { legislature: number; numero: number }; dossierRef: string }[];
};

// The open data is XML converted to JSON: a single child is an object, several are an array.
const list = <T>(x: T | T[] | null | undefined): T[] =>
  x == null ? [] : Array.isArray(x) ? x : [x];

async function download(url: string): Promise<Uint8Array> {
  mkdirSync(CACHE, { recursive: true });
  const file = join(CACHE, url.replace(/[^a-zA-Z0-9.]+/g, "_"));
  const fresh = process.argv.includes("--fresh");
  if (!fresh && existsSync(file)) return new Uint8Array(readFileSync(file));
  console.log(`Téléchargement ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  const buf = new Uint8Array(await res.arrayBuffer());
  writeFileSync(file, buf);
  return buf;
}

async function readZip(url: string, wanted: (name: string) => boolean) {
  const files = unzipSync(await download(url), { filter: (f) => wanted(f.name) });
  const out = new Map<string, any>();
  for (const [name, bytes] of Object.entries(files)) {
    out.set(name.split("/").pop()!.replace(/\.json$/, ""), JSON.parse(strFromU8(bytes)));
  }
  return out;
}

type VoteKey = "pour" | "contre" | "abstention" | "nonVotant";
const NOMINATIF: Record<VoteKey, string> = {
  pour: "pours",
  contre: "contres",
  abstention: "abstentions",
  nonVotant: "nonVotants",
};

async function main() {
  const grille: Grille = JSON.parse(readFileSync(join(DATA, "grille.json"), "utf8"));

  // 1. Scrutins
  const scrutins = [];
  const groupeRefs = new Set<string>();
  const acteurRefs = new Set<string>();
  const seats = new Map<string, number[]>(); // organeRef → seat numbers, to order groups
  const legs = [...new Set(grille.textes.map((t) => t.scrutin.legislature))];
  for (const leg of legs) {
    const wanted = new Set(
      grille.textes
        .filter((t) => t.scrutin.legislature === leg)
        .map((t) => `VTANR5L${leg}V${t.scrutin.numero}`),
    );
    const files = await readZip(sources.scrutins(leg), (n) =>
      wanted.has(n.split("/").pop()!.replace(/\.json$/, "")),
    );
    for (const uid of wanted) {
      const s = files.get(uid)?.scrutin;
      if (!s) throw new Error(`Scrutin ${uid} introuvable dans l'open data`);
      const groupes = list(s.ventilationVotes.organe.groupes.groupe).map((g: any) => {
        const votes = {} as Record<VoteKey, string[]>;
        for (const key of Object.keys(NOMINATIF) as VoteKey[]) {
          const votants = list(g.vote.decompteNominatif[NOMINATIF[key]]?.votant);
          votes[key] = votants.map((v: any) => v.acteurRef);
          for (const v of votants) {
            acteurRefs.add(v.acteurRef);
            const place = Number(v.numPlace);
            if (Number.isFinite(place) && place > 0) {
              seats.set(g.organeRef, [...(seats.get(g.organeRef) ?? []), place]);
            }
          }
        }
        // Check our counts against the official per-group tally.
        const d = g.vote.decompteVoix;
        const expected = [d.pour, d.contre, d.abstentions, d.nonVotants].map(Number);
        const got = [votes.pour, votes.contre, votes.abstention, votes.nonVotant].map((v) => v.length);
        if (expected.join() !== got.join()) {
          throw new Error(`${uid} ${g.organeRef}: décompte ${expected} ≠ liste nominative ${got}`);
        }
        groupeRefs.add(g.organeRef);
        return {
          organeRef: g.organeRef as string,
          membres: Number(g.nombreMembresGroupe),
          positionMajoritaire: g.vote.positionMajoritaire as string,
          ...votes,
        };
      });
      const dec = s.syntheseVote.decompte;
      scrutins.push({
        uid,
        legislature: leg,
        numero: Number(s.numero),
        date: s.dateScrutin,
        titre: s.titre,
        typeVote: s.typeVote.libelleTypeVote,
        sort: s.sort.code,
        annonce: s.syntheseVote.annonce,
        decompte: {
          pour: Number(dec.pour),
          contre: Number(dec.contre),
          abstention: Number(dec.abstentions),
          nonVotant: Number(dec.nonVotants),
        },
        url: `https://www.assemblee-nationale.fr/dyn/${leg}/scrutins/${s.numero}`,
        groupes,
      });
    }
  }
  scrutins.sort((a, b) => a.date.localeCompare(b.date));

  // 2. Groups and deputies (historical file, so groups that no longer exist are included)
  const amo = await readZip(sources.acteurs, (n) => {
    const id = n.split("/").pop()!.replace(/\.json$/, "");
    return groupeRefs.has(id) || acteurRefs.has(id);
  });
  const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  const groupes = [...groupeRefs].map((ref) => {
    const o = amo.get(ref)?.organe;
    if (!o) throw new Error(`Groupe ${ref} introuvable`);
    return {
      organeRef: ref,
      sigle: o.libelleAbrev as string,
      libelle: o.libelle as string,
      couleur: (o.couleurAssociee as string) ?? "#8D949A",
      dateDebut: o.viMoDe?.dateDebut ?? null,
      dateFin: o.viMoDe?.dateFin ?? null,
      // Seat numbers in the chamber decrease from left to right: a higher mean seat
      // number means the group sits further to the left.
      placeMoyenne: seats.has(ref) ? Math.round(mean(seats.get(ref)!)) : null,
      nonInscrits: o.libelleAbrev === "NI",
    };
  });
  groupes.sort((a, b) => {
    if (a.nonInscrits !== b.nonInscrits) return a.nonInscrits ? 1 : -1;
    return (b.placeMoyenne ?? 0) - (a.placeMoyenne ?? 0);
  });
  const groupesOrdonnes = groupes.map((g, i) => ({ ...g, ordre: i + 1 }));

  const deputes: Record<string, string> = {};
  for (const ref of acteurRefs) {
    const ident = amo.get(ref)?.acteur?.etatCivil?.ident;
    deputes[ref] = ident ? `${ident.prenom} ${ident.nom}` : ref;
  }

  // 3. Dossiers législatifs (for titles, AN page and Légifrance link)
  const dossiers: Record<string, unknown> = {};
  const dossierLegs = [...new Set(grille.textes.map((t) => Number(t.dossierRef.match(/L(\d+)N/)![1])))];
  for (const leg of dossierLegs) {
    const refs = new Set(grille.textes.map((t) => t.dossierRef));
    const files = await readZip(sources.dossiers(leg), (n) =>
      refs.has(n.split("/").pop()!.replace(/\.json$/, "")),
    );
    for (const [ref, json] of files) {
      const dp = json.dossierParlementaire;
      const promulgation = findActe(dp, "PROM-PUB");
      const jo = promulgation?.infoJO ?? null;
      dossiers[ref] = {
        uid: ref,
        titre: dp.titreDossier.titre,
        urlAN: `https://www.assemblee-nationale.fr/dyn/${dp.legislature}/dossiers/${dp.titreDossier.titreChemin ?? ref}`,
        promulgation: jo
          ? {
              dateJO: String(jo.dateJO).slice(0, 10),
              referenceNOR: jo.referenceNOR ?? null,
              urlLegifrance: jo.urlLegifrance?.replace(/^http:/, "https:") ?? null,
            }
          : null,
      };
    }
  }
  for (const t of grille.textes) {
    if (!dossiers[t.dossierRef]) throw new Error(`Dossier ${t.dossierRef} introuvable`);
  }

  const write = (name: string, value: unknown) =>
    writeFileSync(join(DATA, name), JSON.stringify(value, null, 1) + "\n");
  write("scrutins.json", scrutins);
  write("groupes.json", groupesOrdonnes);
  write("deputes.json", deputes);
  write("dossiers.json", dossiers);
  write("meta.json", {
    importeLe: new Date().toISOString().slice(0, 10),
    sources: [
      ...legs.map((l) => sources.scrutins(l)),
      ...dossierLegs.map((l) => sources.dossiers(l)),
      sources.acteurs,
    ],
  });
  console.log(
    `OK : ${scrutins.length} scrutins, ${groupesOrdonnes.length} groupes, ${acteurRefs.size} députés, ${Object.keys(dossiers).length} dossiers.`,
  );
}

function findActe(node: any, code: string): any {
  if (!node || typeof node !== "object") return null;
  if (node.codeActe === code) return node;
  for (const v of Object.values(node)) {
    const found = findActe(v, code);
    if (found) return found;
  }
  return null;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
