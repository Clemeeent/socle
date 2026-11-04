"use client";

// Home entry point. The reader pastes a sentence heard in a debate; it moves to the centre,
// "thinks" for a moment, then its passages light up, each tied to a fact, a definition or a source.
// v1: the breakdown is prepared in each card; the reader's own words are matched against it.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cartes, getCarte, lienCarte, type Carte } from "@/lib/data";
import { sourcesCarte } from "@/lib/stats";
import { PastilleVerdict } from "./Carte";
import { COULEURS_PASSAGE, Recit, SuiteRecit } from "./Recit";
import { decouper, decouperAffirmation, type Morceau } from "@/lib/decoupage";
import { interpreterQuestion, lienRecherche } from "@/lib/question";

const TYPES = COULEURS_PASSAGE;

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
  const [exempleIndex, setExempleIndex] = useState(0);
  const [pause, setPause] = useState(false);
  const haut = useRef<HTMLDivElement>(null);

  // Rotate the example while the field is empty and not focused (never with reduced motion).
  useEffect(() => {
    if (etat.nom !== "saisie" || pause || q || mouvementReduit()) return;
    const t = setInterval(() => setExempleIndex((i) => i + 1), 3500);
    return () => clearInterval(t);
  }, [etat.nom, pause, q]);

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
    const exemple = cartes[exempleIndex % cartes.length].affirmation;
    return (
      <div ref={haut}>
        <h1 className="text-center text-[2rem] leading-[1.1]">Poser le socle{" "}<br /><span className="text-accent">d&apos;un débat public</span></h1>
        <form
          className="mt-6"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            // An empty field checks the example on display.
            verifier(q.trim() ? q : exemple);
          }}
        >
          <label htmlFor="question" className="sr-only">
            La phrase entendue en débat
          </label>
          <div className="relative rounded-[1.75rem] border border-line bg-white p-2 shadow-[0_10px_40px_-12px_rgba(42,62,177,0.35)] focus-within:border-accent">
            {!q && (
              // Rotating example, shown like a placeholder (decorative: the button label names it).
              <p
                key={exempleIndex}
                aria-hidden
                className="apparait pointer-events-none absolute inset-x-5 top-4 pr-12 text-lg leading-snug text-ink-3"
              >
                «&nbsp;{exemple}&nbsp;»
              </p>
            )}
            <textarea
              id="question"
              value={q}
              rows={3}
              onFocus={() => setPause(true)}
              onBlur={() => setPause(false)}
              onChange={(e) => {
                setQ(e.target.value);
                if (etat.inconnue) setEtat({ nom: "saisie", inconnue: false });
              }}
              onKeyDown={(e) => {
                // Enter sends, Shift+Enter goes to a new line (like chat apps).
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  verifier(q.trim() ? q : exemple);
                }
              }}
              className="relative block w-full resize-none bg-transparent px-3 pb-12 pt-2 text-lg leading-snug outline-none"
            />
            <button
              type="submit"
              aria-label={q.trim() ? "Vérifier cette phrase" : `Vérifier l'exemple : ${exemple}`}
              className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-accent text-xl text-white"
            >
              ↑
            </button>
          </div>
        </form>
        {etat.inconnue && (
          <p className="mt-3 rounded-2xl bg-warn-bg p-3 text-sm text-warn-ink" role="status">
            Cette phrase n&apos;a pas encore été vérifiée. Essaie un des exemples qui défilent dans le champ.
          </p>
        )}
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
  // The reader's words for each passage, reused at the start of the matching paragraph.
  const extraits: Record<number, string> = {};
  morceaux.forEach((m) => m.passage !== undefined && (extraits[m.passage] ??= m.texte));
  const sources = sourcesCarte(carte);

  return (
    <div ref={haut} className="scroll-mt-4" aria-live="polite" data-etat={etat.nom}>
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
          <div className="apparait mt-10" style={{ animationDelay: `${0.3 + numeros.size * 0.35}s` }}>
            <p className="flex flex-wrap items-center gap-2">
              <PastilleVerdict v={carte.verdict} long />
            </p>
            <div className="mt-5">
              <Recit c={carte} sources={sources} extraits={extraits} />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-2">
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
            <SuiteRecit c={carte} sources={sources} />
          </div>
        </>
      )}
    </div>
  );
}
