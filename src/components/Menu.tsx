"use client";

// Site menu behind a single button (disclosure pattern): aria-expanded/aria-controls on the button,
// Escape or a click outside closes it and gives focus back to the button, links close it too.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const LIENS = [
  { href: "/", label: "Vérifier une phrase" },
  { href: "/cartes", label: "Ce qu'on a vérifié" },
  { href: "/#dossiers", label: "Dossiers" },
  { href: "/themes", label: "Thèmes" },
  { href: "/partis", label: "Partis" },
  { href: "/methode", label: "Méthode" },
];

export function Menu() {
  const [ouvert, setOuvert] = useState(false);
  const bouton = useRef<HTMLButtonElement>(null);
  const panneau = useRef<HTMLDivElement>(null);
  const chemin = usePathname();

  useEffect(() => {
    if (!ouvert) return;
    // Move focus into the menu so keyboard and screen-reader users land on the links.
    panneau.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const fermer = (rendreFocus: boolean) => {
      setOuvert(false);
      if (rendreFocus) bouton.current?.focus();
    };
    const touche = (e: KeyboardEvent) => e.key === "Escape" && fermer(true);
    const clic = (e: MouseEvent) => {
      const cible = e.target as Node;
      if (!panneau.current?.contains(cible) && !bouton.current?.contains(cible)) fermer(false);
    };
    document.addEventListener("keydown", touche);
    document.addEventListener("mousedown", clic);
    return () => {
      document.removeEventListener("keydown", touche);
      document.removeEventListener("mousedown", clic);
    };
  }, [ouvert]);

  return (
    <div className="relative">
      <button
        ref={bouton}
        type="button"
        aria-expanded={ouvert}
        aria-controls="menu-principal"
        onClick={() => setOuvert((o) => !o)}
        className="flex h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-ink hover:bg-bg-alt"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          {ouvert ? <path d="M5 5l10 10M15 5L5 15" /> : <path d="M3 6h14M3 10h14M3 14h14" />}
        </svg>
        Menu
      </button>
      <nav
        id="menu-principal"
        ref={panneau}
        aria-label="Menu principal"
        hidden={!ouvert}
        className="absolute right-0 top-12 z-20 w-64 rounded-2xl border border-line bg-white p-2 shadow-[0_16px_40px_-12px_rgba(20,22,31,0.25)]"
      >
        <ul>
          {LIENS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={() => setOuvert(false)}
                aria-current={chemin === l.href ? "page" : undefined}
                className="block rounded-xl px-3 py-2.5 text-ink no-underline hover:bg-bg-alt aria-[current=page]:font-semibold aria-[current=page]:text-accent"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
