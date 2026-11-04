/**
 * Claude API calls with a spending cap. Every call is recorded in evaluation/depenses-api.json;
 * once the total reaches the cap (SOCLE_BUDGET_USD, 5 $ by default), calls are refused until a
 * person raises it. The key is read from SOCLE_ANTHROPIC_API_KEY only.
 */
import Anthropic from "@anthropic-ai/sdk";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

export const MODELE = "claude-opus-5-5";
const JOURNAL = "evaluation/depenses-api.json";

// $ per million tokens (input, output, cache write 5 min, cache read). Fallback models are
// priced at Opus 4.8 rates, the most expensive a "default" fallback can route to.
const PRIX: Record<string, { entree: number; sortie: number; ecriture: number; lecture: number }> = {
  "claude-opus-5-5": { entree: 4, sortie: 20, ecriture: 5, lecture: 0.2 },
  autre: { entree: 5, sortie: 25, ecriture: 6.25, lecture: 0.5 },
};

type Appel = { date: string; etape: string; ref: string; modele: string; entree: number; sortie: number; cacheEcrit: number; cacheLu: number; cout: number };
type Journal = { plafond: string; total: number; appels: Appel[] };

const lireJournal = (): Journal =>
  existsSync(JOURNAL)
    ? JSON.parse(readFileSync(JOURNAL, "utf8"))
    : { plafond: "SOCLE_BUDGET_USD (5 $ par défaut). Au-delà, demander l'accord des porteurs du projet.", total: 0, appels: [] };

export const plafond = () => Number(process.env.SOCLE_BUDGET_USD ?? 5);
export const depense = () => lireJournal().total;

let client: Anthropic | null = null;
function getClient() {
  const apiKey = process.env.SOCLE_ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Variable SOCLE_ANTHROPIC_API_KEY absente : la clé d'API n'est pas disponible.");
  return (client ??= new Anthropic({ apiKey }));
}

type Usage = { input_tokens: number; output_tokens: number; cache_creation_input_tokens?: number | null; cache_read_input_tokens?: number | null };

function cout(modele: string, u: Usage) {
  const p = PRIX[modele] ?? PRIX.autre;
  return (
    (u.input_tokens * p.entree + u.output_tokens * p.sortie + (u.cache_creation_input_tokens ?? 0) * p.ecriture + (u.cache_read_input_tokens ?? 0) * p.lecture) /
    1e6
  );
}

// One structured call: the answer must match `schema` (JSON). Throws on refusal or truncation.
export async function appelerJson<T>(opts: {
  etape: string;
  ref: string;
  systeme: string;
  message: string;
  schema: object;
  effort: "low" | "medium" | "high";
  maxTokens?: number;
}): Promise<{ resultat: T; cout: number }> {
  const journal = lireJournal();
  if (journal.total >= plafond())
    throw new Error(`Plafond de dépenses atteint (${journal.total.toFixed(2)} $ ≥ ${plafond()} $). Demander l'accord avant de le relever.`);

  const params = {
    model: MODELE,
    max_tokens: opts.maxTokens ?? 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: [{ type: "text", text: opts.systeme, cache_control: { type: "ephemeral" } }],
    output_config: { effort: opts.effort, format: { type: "json_schema", schema: opts.schema } },
    messages: [{ role: "user", content: opts.message }],
  };
  // `fallbacks: "default"` is newer than the SDK's types: the request shape is checked by the API.
  const r = await getClient().beta.messages.create(params as unknown as Anthropic.Beta.MessageCreateParamsNonStreaming);

  const modele = r.model;
  const c = cout(modele, r.usage as Usage);
  journal.appels.push({
    date: new Date().toISOString(),
    etape: opts.etape,
    ref: opts.ref,
    modele,
    entree: r.usage.input_tokens,
    sortie: r.usage.output_tokens,
    cacheEcrit: r.usage.cache_creation_input_tokens ?? 0,
    cacheLu: r.usage.cache_read_input_tokens ?? 0,
    cout: Math.round(c * 10000) / 10000,
  });
  journal.total = Math.round(journal.appels.reduce((a, x) => a + x.cout, 0) * 10000) / 10000;
  writeFileSync(JOURNAL, JSON.stringify(journal, null, 1) + "\n");

  if (r.stop_reason === "refusal") throw new Error(`Refus du modèle (${opts.etape}, ${opts.ref})`);
  if (r.stop_reason === "max_tokens") throw new Error(`Réponse tronquée (${opts.etape}, ${opts.ref})`);
  const texte = r.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
  return { resultat: JSON.parse(texte) as T, cout: c };
}
