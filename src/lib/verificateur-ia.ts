// AI checker, step by step: sentence → claims → passages of the corpus → cited answer or
// "on ne sait pas" → automatic checks. This file holds the prompts, the output formats and the
// checks (pure functions); the API calls live in scripts/verifier-ia.ts.
import { chiffresAbsents, citationDansPassage, type DocumentCorpus, type Passage } from "./corpus";
import { CITATION_MAX } from "./programmes-core";

// ── Step 1: analyse the sentence ─────────────────────────────────────────────

export const TYPES_AFFIRMATION = ["donnee", "definition", "valeur", "source"] as const;

export type Analyse = {
  orientation: { carte: string; dossier: string; raison: string }; // "aucune" when nothing fits
  affirmations: { extrait: string; type: (typeof TYPES_AFFIRMATION)[number]; question: string; requetes: string[] }[];
};

export type Catalogue = {
  cartes: { id: string; affirmation: string; enBref: string }[];
  dossiers: { id: string; titre: string; question: string }[];
  documents: DocumentCorpus[];
};

export const schemaAnalyse = (cat: Catalogue) => ({
  type: "object",
  properties: {
    orientation: {
      type: "object",
      properties: {
        carte: { type: "string", enum: [...cat.cartes.map((c) => c.id), "aucune"] },
        dossier: { type: "string", enum: [...cat.dossiers.map((d) => d.id), "aucune"] },
        raison: { type: "string" },
      },
      required: ["carte", "dossier", "raison"],
      additionalProperties: false,
    },
    affirmations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          extrait: { type: "string" },
          type: { type: "string", enum: [...TYPES_AFFIRMATION] },
          question: { type: "string" },
          requetes: { type: "array", items: { type: "string" } },
        },
        required: ["extrait", "type", "question", "requetes"],
        additionalProperties: false,
      },
    },
  },
  required: ["orientation", "affirmations"],
  additionalProperties: false,
});

export const systemeAnalyse = (cat: Catalogue) => `Tu travailles pour Socle, un outil neutre qui aide à vérifier une phrase entendue dans un débat politique français, à partir de sources officielles.

Ta tâche : analyser la phrase, sans y répondre.
1. Découpe-la en affirmations vérifiables ou discutables. Pour chacune :
   - extrait : le passage exact de la phrase, recopié mot pour mot (caractère pour caractère) ;
   - type : "donnee" (un fait ou un chiffre qu'une source peut établir), "definition" (la réponse dépend du sens donné à un mot), "valeur" (un jugement, un souhait ou une proposition qui relève du débat de valeurs), "source" (une attribution : « X a dit / a trouvé… ») ;
   - question : la question neutre et vérifiable que pose ce passage ;
   - requetes : 2 à 4 recherches par mots-clés, en français, pour retrouver les passages utiles dans les documents listés ci-dessous (mots qu'on trouverait dans un rapport officiel, pas dans la phrase).
   Une phrase de pur souhait (« vivement… », « il faut… ») contient quand même des présupposés factuels : relève-les.
2. Oriente la phrase vers la carte de Socle qui en parle déjà (ou "aucune"), et vers le dossier (ou "aucune"). Une carte n'est pertinente que si elle traite le même sujet, même formulé autrement ; ne force pas un rapprochement.

Règles : neutralité totale, aucun jugement sur un parti, une personne ou un média. N'invente rien.

Cartes existantes :
${cat.cartes.map((c) => `- ${c.id} : « ${c.affirmation} » — ${c.enBref}`).join("\n")}

Dossiers :
${cat.dossiers.map((d) => `- ${d.id} : ${d.titre} — ${d.question}`).join("\n")}

Documents du corpus :
${cat.documents.map((d) => `- ${d.organisme} : ${d.titre}`).join("\n")}`;

// ── Step 2: write the answer from the passages only ──────────────────────────

export const STATUTS_REPONSE = [
  "etabli", // the sources support it
  "contredit", // the sources contradict it
  "nuance", // partly supported, partly not
  "depend-de-la-definition",
  "debat-de-valeurs",
  "on-ne-sait-pas", // nothing in the corpus answers
] as const;
export type StatutReponse = (typeof STATUTS_REPONSE)[number];

export type Citation = { passage: string; extrait: string };
export type ReponseAffirmation = { extrait: string; statut: StatutReponse; reponse: string; citations: Citation[] };
export type Redaction = {
  titre: string;
  affirmations: ReponseAffirmation[];
  inconnu: string[];
  pourLancerLeDebat: string[];
};

export const schemaRedaction = {
  type: "object",
  properties: {
    titre: { type: "string" },
    affirmations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          extrait: { type: "string" },
          statut: { type: "string", enum: [...STATUTS_REPONSE] },
          reponse: { type: "string" },
          citations: {
            type: "array",
            items: {
              type: "object",
              properties: { passage: { type: "string" }, extrait: { type: "string" } },
              required: ["passage", "extrait"],
              additionalProperties: false,
            },
          },
        },
        required: ["extrait", "statut", "reponse", "citations"],
        additionalProperties: false,
      },
    },
    inconnu: { type: "array", items: { type: "string" } },
    pourLancerLeDebat: { type: "array", items: { type: "string" } },
  },
  required: ["titre", "affirmations", "inconnu", "pourLancerLeDebat"],
  additionalProperties: false,
} as const;

export const NATURES: Record<DocumentCorpus["nature"], string> = {
  officielle: "source officielle",
  verification: "site de vérification des faits",
  presse: "article de presse",
  encyclopedie: "encyclopédie collaborative",
};

export const systemeRedaction = `Tu travailles pour Socle, un outil neutre qui pose le socle commun d'un débat : ce que disent les données sourcées, ce qui dépend de la définition, ce qu'on ne sait pas, ce qui relève des valeurs.

Tu reçois une phrase entendue en débat, ses affirmations, et des passages numérotés de documents. Tu réponds à chaque affirmation UNIQUEMENT à partir de ces passages.

Règles absolues :
- Chaque statut autre que "on-ne-sait-pas" et "debat-de-valeurs" s'appuie sur au moins une citation.
- Une citation est un extrait recopié MOT POUR MOT d'un seul passage (identifiant exact, ex. "senat-avis#12"), continu, sans « […] », de 300 caractères au plus.
- Chaque chiffre écrit dans "reponse" ou "titre", années et dates comprises, doit figurer, écrit de la même façon, dans une citation de cette affirmation (pour le titre : dans une citation de la réponse). Pas de calcul, pas d'arrondi, pas de chiffre de mémoire. Au besoin, cite un extrait de plus ou écris la réponse sans ce chiffre.
- Si les passages ne permettent pas de répondre : statut "on-ne-sait-pas", et dis ce qui manque. Mieux vaut « on ne sait pas » qu'une réponse plausible.
- Dis d'où vient l'information quand ce n'est pas une source officielle (article de presse, encyclopédie) et quand c'est une déclaration (« selon le ministre… »).
- Un souhait ou un jugement (« il faut », « vivement », « c'est scandaleux ») : statut "debat-de-valeurs" ; donne les faits sourcés utiles au débat s'il y en a, sans trancher.
- Neutralité totale : aucun jugement sur un parti, une personne ou un média ; mêmes exigences quel que soit le camp.
- "reponse" : 1 à 3 phrases simples, ton direct, tutoiement interdit, pas de jargon.
- "titre" : la réponse en une phrase courte.
- "inconnu" : ce qu'on ne sait pas ou ce qui n'est pas mesuré, d'après les passages (liste vide sinon).
- "pourLancerLeDebat" : 2 ou 3 questions ouvertes, jamais des affirmations.`;

export function messageRedaction(
  phrase: string,
  affirmations: Analyse["affirmations"],
  passages: Passage[],
  documents: DocumentCorpus[],
): string {
  const doc = new Map(documents.map((d) => [d.id, d]));
  return `Phrase : « ${phrase} »

Affirmations :
${affirmations.map((a, i) => `${i + 1}. « ${a.extrait} » (${a.type}) — ${a.question}`).join("\n")}

Passages :
${passages
  .map((p) => {
    const d = doc.get(p.document)!;
    return `<passage id="${p.id}" document="${d.organisme} — ${d.titre}" nature="${NATURES[d.nature]}"${p.page > 1 ? ` page="${p.page}"` : ""}>\n${p.texte}\n</passage>`;
  })
  .join("\n\n")}`;
}

// ── Step 3: automatic checks ─────────────────────────────────────────────────

export type Controle = {
  affirmation: string;
  erreurs: string[];
};

// Checks every citation against its passage and every figure against the citations.
// Rejected answers are replaced by "on ne sait pas"; the rejected text is kept for review.
export function controler(
  redaction: Redaction,
  passages: Passage[],
): { redaction: Redaction & { affirmations: (ReponseAffirmation & { rejete?: { reponse: string; statut: StatutReponse; erreurs: string[] } })[] }; controles: Controle[] } {
  const parId = new Map(passages.map((p) => [p.id, p]));
  const controles: Controle[] = [];
  const affirmations = redaction.affirmations.map((a) => {
    const erreurs: string[] = [];
    for (const c of a.citations) {
      const p = parId.get(c.passage);
      if (!p) erreurs.push(`citation vers un passage inconnu « ${c.passage} »`);
      else if (c.extrait.length > CITATION_MAX) erreurs.push(`citation trop longue (${c.extrait.length} caractères)`);
      else if (/\[\s*(…|\.\.\.)\s*\]/.test(c.extrait)) erreurs.push("citation coupée « […] »");
      else if (!citationDansPassage(c.extrait, p.texte)) erreurs.push(`citation absente mot pour mot de ${c.passage} : « ${c.extrait.slice(0, 80)}… »`);
    }
    const absents = chiffresAbsents(a.reponse, a.citations.map((c) => c.extrait));
    if (absents.length) erreurs.push(`chiffres absents des citations : ${absents.join(", ")}`);
    if (a.statut !== "on-ne-sait-pas" && a.statut !== "debat-de-valeurs" && a.citations.length === 0)
      erreurs.push(`statut « ${a.statut} » sans aucune citation`);
    controles.push({ affirmation: a.extrait, erreurs });
    if (!erreurs.length) return a;
    return {
      extrait: a.extrait,
      statut: "on-ne-sait-pas" as const,
      reponse: "La réponse rédigée n'a pas passé le contrôle automatique des sources : à reprendre à la main.",
      citations: [],
      rejete: { reponse: a.reponse, statut: a.statut, erreurs },
    };
  });
  // The title may only use figures quoted somewhere in the kept answers.
  const toutesCitations = affirmations.flatMap((a) => a.citations.map((c) => c.extrait));
  const absentsTitre = chiffresAbsents(redaction.titre, toutesCitations);
  if (absentsTitre.length) controles.push({ affirmation: "(titre)", erreurs: [`chiffres du titre absents des citations : ${absentsTitre.join(", ")}`] });
  const titre = absentsTitre.length ? "Titre à reprendre : chiffre non sourcé" : redaction.titre;
  return { redaction: { ...redaction, titre, affirmations }, controles };
}

// Claims whose excerpt is not a verbatim part of the sentence (the highlighting would break).
export const extraitsHorsPhrase = (phrase: string, analyse: Analyse) =>
  analyse.affirmations.filter((a) => !phrase.toLowerCase().includes(a.extrait.toLowerCase())).map((a) => a.extrait);
