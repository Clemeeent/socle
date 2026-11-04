"use client";

// Home entry point. The reader pastes a sentence heard in a debate; it moves to the centre,
// "thinks" for a moment, then its passages light up, each tied to a fact, a definition or a source.
// v1: the breakdown is prepared in each card; the reader's own words are matched against it.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cartes, getCarte, lienCarte, VERDICTS, type Carte } from "@/lib/data";
import { decouper, decouperAffirmation, type Morceau, type Passage } from "@/lib/decoupage";
import { interpreterQuestion, lienRecherche } from "@/lib/question";

const TYPES: Record<Passage["type"], { label: string; fond: string; trait: string }> = {
  donnee: { label: "Ce que disent les données", fond: "#e6ebff", trait: "#2a3eb1" },
  definition: { label: "Ça dépend de la définition", fond: "#fff1d6", trait: "#d9692e" },
  source: { label: "D'où ça vient", fond: "#fde8e7", trait: "#c43d32" },
};

const ETAPES = ["Je découpe la phrase…", "Je cherche les sources officielles…", "Je sépare les faits des jugements…"];

type Etat =
  | { nom: "saisie"; inconnue: boolean }
  | { nom: "reflexion"; phrase: string; carte: Carte }
  | { nom: "resultat"; phrase: string; carte: Carte };

const mouvementReduit = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Verificateur() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [etat, setEtat] = useState<Etat>({ nom: "saisie", inconnue: false });
  const [etape, setEtape] = useState(0);
  const haut = useRef<HTMLDivElement>(null);

  // The thinking phase: a few visible steps, then the result.
  useEffect(() => {
    if (etat.nom !== "reflexion") return;
    const t1 = setInterval(() => setEtape((e) => Math.min(e + 1, ETAPES.length - 1)), 650);
    const t2 = setTimeout(() => setEtat({ nom: "resultat", phrase: etat.phrase, carte: etat.carte }), 2000);
    return () => {
      clearInterval(t1);
      clearTimeout(t2);
    };
  }, [etat]);

  async function verifier(phrase: string) {
    if (!phrase.trim()) return;
    const r = await interpreterQuestion(phrase);
    if (!r) return setEtat({ nom: "saisie", inconnue: true });
    // Dossier questions have their own pages.
    if (!r.carte) return router.push(lienRecherche(r));
    setEtape(0);
    // With reduced motion, skip the thinking animation.
    setEtat({ nom: mouvementReduit() ? "resultat" : "reflexion", phrase: phrase.trim(), carte: getCarte(r.carte)! });
    haut.current?.scrollIntoView({ behavior: mouvementReduit() ? "auto" : "smooth", block: "start" });
  }

  function recommencer() {
    setQ("");
    setEtat({ nom: "saisie", inconnue: false });
  }

  if (etat.nom === "saisie") {
    return (
      <div ref={haut} className="text-center">
        <p className="text-sm font-semibold text-accent">Les faits d&apos;abord, le débat ensuite</p>
        <h1 className="mt-2 text-[2.2rem] leading-[1.08]">Qu&apos;est-ce qu&apos;on t&apos;a affirmé ?</h1>
        <p className="mx-auto mt-3 max-w-md text-ink-2">
          Colle la phrase : Socle la découpe, montre ce qui est mesurable, ce qui dépend des mots, et d&apos;où ça
          vient.
        </p>
        <form
          className="mt-6 text-left"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            verifier(q);
          }}
        >
          <label htmlFor="question" className="sr-only">
            La phrase entendue
          </label>
          <div className="relative rounded-[1.75rem] border border-line bg-white p-2 shadow-[0_10px_40px_-12px_rgba(42,62,177,0.35)] focus-within:border-accent">
            <textarea
              id="question"
              value={q}
              rows={3}
              onChange={(e) => {
                setQ(e.target.value);
                if (etat.inconnue) setEtat({ nom: "saisie", inconnue: false });
              }}
              onKeyDown={(e) => {
                // Enter sends, Shift+Enter goes to a new line (like chat apps).
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  verifier(q);
                }
              }}
              placeholder="Colle ici la phrase qu'on t'a lancée…"
              className="block w-full resize-none bg-transparent px-3 pb-12 pt-2 text-lg leading-snug outline-none placeholder:text-ink-3"
            />
            <button
              type="submit"
              aria-label="Vérifier"
              disabled={!q.trim()}
              className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-accent text-xl text-white disabled:opacity-40"
            >
              ↑
            </button>
          </div>
        </form>
        {etat.inconnue && (
          <p className="mt-3 rounded-2xl bg-warn-bg p-3 text-left text-sm text-warn-ink" role="status">
            Cette phrase n&apos;a pas encore été vérifiée. Essaie un des exemples ci-dessous.
          </p>
        )}
        <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-ink-3">Essaie avec</p>
        <ul className="mt-2 flex flex-wrap justify-center gap-2">
          {cartes.slice(0, 4).map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => {
                  setQ(c.affirmation);
                  verifier(c.affirmation);
                }}
                className="rounded-full border border-line bg-white px-3 py-1.5 text-left text-sm text-ink-2 hover:border-accent hover:text-accent"
              >
                « {c.affirmation} »
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const { phrase, carte } = etat;
  const resultat = etat.nom === "resultat";

  // Highlight the reader's own words; if none match, show the card's own sentence instead.
  let morceaux: Morceau[] = decouper(phrase, carte.decoupage);
  const reconnue = morceaux.some((m) => m.passage !== undefined);
  if (!reconnue) morceaux = decouperAffirmation(carte.affirmation, carte.decoupage);
  const numeros = new Map<number, number>();
  morceaux.forEach((m) => m.passage !== undefined && !numeros.has(m.passage) && numeros.set(m.passage, numeros.size + 1));

  return (
    <div ref={haut} className="scroll-mt-4" aria-live="polite">
      {!reconnue && resultat && (
        <p className="text-center text-sm text-ink-3">La phrase vérifiée la plus proche :</p>
      )}
      <p className="mt-2 text-center text-[1.75rem] font-extrabold leading-snug tracking-tight">
        {resultat ? (
          <>
            «&nbsp;
            {morceaux.map((m, i) => {
              if (m.passage === undefined) return <span key={i}>{m.texte}</span>;
              const t = TYPES[carte.decoupage[m.passage].type];
              const n = numeros.get(m.passage)!;
              return (
                <span key={i}>
                  <mark
                    className="surligne text-ink"
                    style={{
                      backgroundImage: `linear-gradient(${t.fond}, ${t.fond})`,
                      boxShadow: `inset 0 -3px 0 ${t.trait}`,
                      animationDelay: `${(n - 1) * 0.35}s`,
                    }}
                  >
                    {m.texte}
                  </mark>
                  <sup className="ml-0.5 text-sm font-bold" style={{ color: t.trait }}>
                    {n}
                  </sup>
                </span>
              );
            })}
            &nbsp;»
          </>
        ) : (
          <span className="reflexion">« {phrase} »</span>
        )}
      </p>

      {!resultat ? (
        <p className="mt-6 text-center text-sm text-ink-3" role="status">
          {ETAPES[etape]}
        </p>
      ) : (
        <>
          <ol className="mt-8 space-y-3">
            {[...numeros.entries()].map(([passage, n]) => {
              const p = carte.decoupage[passage];
              const t = TYPES[p.type];
              const extrait = morceaux.find((m) => m.passage === passage)!.texte;
              return (
                <li
                  key={passage}
                  className="apparait rounded-2xl border-l-4 bg-white p-4 shadow-[0_1px_0_var(--line)]"
                  style={{ borderColor: t.trait, animationDelay: `${0.3 + n * 0.35}s` }}
                >
                  <p className="flex flex-wrap items-center gap-2 text-xs font-bold">
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full text-white"
                      style={{ background: t.trait }}
                    >
                      {n}
                    </span>
                    <span style={{ color: t.trait }}>{t.label}</span>
                  </p>
                  <p className="mt-2 text-sm text-ink-3">« {extrait} »</p>
                  <p className="mt-1 leading-relaxed">{p.note}</p>
                  {p.source && (
                    <a href={p.source.url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs">
                      {p.source.label} ↗
                    </a>
                  )}
                </li>
              );
            })}
          </ol>

          <div
            className="apparait mt-6 rounded-3xl bg-bg-alt p-5"
            style={{ animationDelay: `${0.5 + numeros.size * 0.35}s` }}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-ink-3">Le socle commun</p>
            <p className="mt-2 font-semibold leading-snug">{carte.enBref}</p>
            <p className="mt-2 text-xs text-ink-3">
              Verdict : {VERDICTS[carte.verdict].label}. Chiffres relevés par recherche, à vérifier sur les sources.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link
                href={lienCarte(carte.id)}
                className="rounded-xl bg-accent px-4 py-3 text-center font-semibold text-white no-underline"
              >
                Carte à partager
              </Link>
              <button onClick={recommencer} className="rounded-xl border-2 border-ink px-4 py-3 font-semibold">
                Autre phrase
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
