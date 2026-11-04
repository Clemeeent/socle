import Link from "next/link";
import { cartes, dossiers } from "@/lib/data";
import { TuileCarte } from "@/components/Carte";
import { CarteDossier } from "@/components/Dossier";
import { Verificateur } from "@/components/Verificateur";

export default function Home() {
  return (
    <div>
      {/* Search first: one question, one field, like a chat assistant. */}
      <section className="flex min-h-[62vh] flex-col justify-center pb-6">
        <Verificateur />
      </section>

      <section id="verifications" className="mt-4 scroll-mt-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-bold">Déjà vérifié</h2>
          <Link href="/cartes" className="text-sm">Tout voir →</Link>
        </div>
        {/* Swipeable row of tiles (scroll snap, no script). */}
        <ul className="-mx-4 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 [scrollbar-width:none]">
          {cartes.map((c) => (
            <li key={c.id} className="w-[78%] max-w-[20rem] shrink-0 snap-start">
              <TuileCarte c={c} />
            </li>
          ))}
        </ul>
      </section>

      <section id="dossiers" className="mt-10 scroll-mt-4">
        <h2 className="text-xl font-bold">Pour aller plus loin : les dossiers</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {dossiers.map((d) => (
            <li key={d.id}>
              <CarteDossier d={d} />
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm">
          <Link href="/themes">Explorer par thème</Link> · <Link href="/partis">Les partis</Link> ·{" "}
          <Link href="/methode">La méthode</Link>
        </p>
      </section>
    </div>
  );
}
