"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { interpreterQuestion } from "@/lib/question";

export function QuestionBox() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [inconnue, setInconnue] = useState(false);

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    const r = await interpreterQuestion(q);
    if (r) router.push(`/question/${r.slug}`);
    else setInconnue(true);
  }

  return (
    <form onSubmit={envoyer} role="search">
      <label htmlFor="question" className="sr-only">
        Pose ta question
      </label>
      <div className="flex rounded-lg border-2 border-ink focus-within:border-accent">
        <input
          id="question"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setInconnue(false);
          }}
          placeholder="Pose ta question…"
          className="min-w-0 flex-1 rounded-l-lg bg-transparent px-4 py-3.5 text-base outline-none"
        />
        <button type="submit" className="rounded-r-md bg-accent px-4 font-medium text-white">
          Chercher
        </button>
      </div>
      {inconnue && (
        <p className="mt-2 text-sm text-warn-ink" role="status">
          Cette question n&apos;est pas encore couverte par la démo. Essaie une des questions ci-dessous.
        </p>
      )}
    </form>
  );
}
