import type { Metadata } from "next";
import Link from "next/link";
import { documentsDuParti, getGroupe, partis } from "@/lib/data";

export const metadata: Metadata = { title: "Partis" };

function etatProgramme(partiId: string) {
  const docs = documentsDuParti(partiId);
  if (docs.some((d) => d.criteresAnalyses.length)) return "Programme analysé";
  return docs.length ? "Programme identifié, à analyser" : "Programme à venir";
}

export default function PartisPage() {
  return (
    <article>
      <h1 className="text-[1.9rem] leading-tight">Les partis</h1>
      <p className="mt-2 text-ink-2">Ce qu&apos;ils proposent, face à ce que leurs députés ont voté.</p>
      <ul className="mt-5 divide-y divide-line border-y border-line">
        {partis.map((p) => (
          <li key={p.id}>
            <Link href={`/parti/${p.id}`} className="flex items-center gap-3 py-3.5 no-underline">
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: getGroupe(p.groupes[0])!.couleur }} />
              <span className="flex-1">
                <span className="block font-semibold text-ink">{p.nom}</span>
                <span className="block text-xs text-ink-3">{etatProgramme(p.id)}</span>
              </span>
              <span aria-hidden className="text-accent">→</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-ink-3">Ordre : de la gauche à la droite de l&apos;hémicycle.</p>
    </article>
  );
}
