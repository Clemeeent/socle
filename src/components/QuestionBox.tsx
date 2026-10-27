"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { interpreterQuestion, lienRecherche } from "@/lib/question";

export function QuestionBox() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [inconnue, setInconnue] = useState(false);

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    const r = await interpreterQuestion(q);
    if (r) router.push(lienRecherche(r));
    else setInconnue(true);
  }

  return (
    <form onSubmit={envoyer} role="search">
      <label htmlFor="question" className="sr-only">
        Pose ta question
      </label>
      <div className="flex rounded-2xl border-2 border-ink bg-white p-1 focus-within:border-accent">
        <input
          id="question"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setInconnue(false);
          }}
          placeholder="Ex. : la surveillance"
          className="min-w-0 flex-1 bg-transparent px-3 py-3 text-base outline-none"
        />
        <button type="submit" className="rounded-xl bg-accent px-4 font-semibold text-white">
          Chercher
        </button>
      </div>
      {inconnue && (
        <p className="mt-2 text-sm text-warn-ink" role="status">
          Ce sujet n&apos;est pas encore traité. Les dossiers ci-dessous montrent ce que Socle couvre déjà.
        </p>
      )}
    </form>
  );
}
