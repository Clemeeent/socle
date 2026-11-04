"use client";

// "Et toi ?" quick replies under a debate question. Picking a position shows, among the card's own
// sourced facts, what supports it and what could give it pause. Nothing is stored or sent.
import { useState } from "react";

type Source = { label: string; url: string; texte: string };
type Position = { label: string; appuis: number[]; doutes: number[] };

function Faits({ titre, refs, sources }: { titre: string; refs: number[]; sources: Source[] }) {
  if (refs.length === 0) return null;
  return (
    <div className="mt-3">
      <p className="text-xs font-bold uppercase tracking-widest text-ink-3">{titre}</p>
      <ul className="mt-1.5 space-y-2">
        {refs.map((n) => (
          <li key={n} className="text-[0.95rem] leading-snug">
            {sources[n - 1].texte}
            <sup className="ml-0.5">
              <a href={`#source-${n}`} className="text-[0.7em] font-bold no-underline">
                {n}
              </a>
            </sup>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Positionnement({ question, positions, sources }: { question: string; positions: Position[]; sources: Source[] }) {
  const [choix, setChoix] = useState<number | null>(null);
  const p = choix !== null ? positions[choix] : null;
  return (
    <div>
      <p className="text-[1.05rem] font-semibold leading-snug">{question}</p>
      <div role="group" aria-label={`Ta position : ${question}`} className="mt-2.5 flex flex-wrap gap-2">
        {positions.map((x, i) => (
          <button
            key={x.label}
            type="button"
            aria-pressed={choix === i}
            onClick={() => setChoix(choix === i ? null : i)}
            className="rounded-full border border-line bg-white px-3.5 py-2 text-sm font-medium text-ink-2 transition-colors hover:border-accent aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-white"
          >
            {x.label}
          </button>
        ))}
      </div>
      {p && (
        <div className="apparait mt-3 rounded-2xl bg-bg-alt p-4" role="status">
          {p.appuis.length + p.doutes.length === 0 ? (
            <p className="text-[0.95rem] text-ink-2">
              Socle n&apos;a pas encore de données pour éclairer cette position : c&apos;est un débat de valeurs.
            </p>
          ) : (
            <>
              <Faits titre="Ce qui va dans ton sens" refs={p.appuis} sources={sources} />
              <Faits titre="Ce qui pourrait te faire douter" refs={p.doutes} sources={sources} />
            </>
          )}
          <p className="mt-3 text-xs text-ink-3">Ton choix n&apos;est ni enregistré ni envoyé.</p>
        </div>
      )}
    </div>
  );
}
