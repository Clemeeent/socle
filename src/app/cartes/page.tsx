import type { Metadata } from "next";
import { cartes, cartesMeta } from "@/lib/data";
import { LigneCarte } from "@/components/Carte";

export const metadata: Metadata = { title: "Vérifications" };

export default function CartesPage() {
  return (
    <article>
      <h1 className="text-[1.9rem] leading-tight">Ce qu&apos;on a vérifié</h1>
      <p className="mt-2 text-ink-2">
        Des phrases entendues dans de vrais débats. Pour chacune : ce que disent les données, ce qui dépend
        de la définition, ce qu&apos;on ne sait pas. Une carte à partager dans la conversation.
      </p>
      <ul className="mt-5 space-y-3">
        {cartes.map((c) => (
          <li key={c.id}>
            <LigneCarte c={c} />
          </li>
        ))}
      </ul>
      <p className="mt-6 text-xs text-ink-3">{cartesMeta.note}</p>
    </article>
  );
}
