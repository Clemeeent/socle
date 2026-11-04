"use client";

// The main entry point: paste the sentence heard in a debate, get the matching card or dossier.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { interpreterQuestion, lienRecherche } from "@/lib/question";
import { recherche } from "@/lib/data";

export function QuestionBox({ suggestions = true }: { suggestions?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [inconnue, setInconnue] = useState(false);

  async function envoyer(e?: React.FormEvent) {
    e?.preventDefault();
    if (!q.trim()) return;
    const r = await interpreterQuestion(q);
    if (r) router.push(lienRecherche(r));
    else setInconnue(true);
  }

  return (
    <form onSubmit={envoyer} role="search">
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
            setInconnue(false);
          }}
          onKeyDown={(e) => {
            // Enter sends, Shift+Enter goes to a new line (like chat apps).
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              envoyer();
            }
          }}
          placeholder="Colle ici la phrase qu'on t'a lancée…"
          className="block w-full resize-none bg-transparent px-3 pb-12 pt-2 text-lg leading-snug outline-none placeholder:text-ink-3"
        />
        <button
          type="submit"
          aria-label="Vérifier"
          className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-accent text-xl text-white disabled:opacity-40"
          disabled={!q.trim()}
        >
          ↑
        </button>
      </div>
      {inconnue && (
        <p className="mt-3 rounded-2xl bg-warn-bg p-3 text-sm text-warn-ink" role="status">
          Cette phrase n&apos;a pas encore été vérifiée. Essaie une des suggestions, ou parcours les cartes déjà faites.
        </p>
      )}
      {suggestions && (
        <ul className="mt-4 flex flex-wrap justify-center gap-2">
          {recherche.slice(0, 4).map((r) => (
            <li key={r.question}>
              <Link
                href={lienRecherche(r)}
                className="inline-block rounded-full border border-line bg-white px-3 py-1.5 text-sm text-ink-2 no-underline hover:border-accent hover:text-accent"
              >
                {r.question}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
