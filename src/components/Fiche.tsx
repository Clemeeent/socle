// Small building blocks shared by every page: status badge, update date, sources, empty state.
import { formatDate } from "@/lib/data";

export function StatutBadge({ verifie = false }: { verifie?: boolean }) {
  return verifie ? (
    <span className="inline-flex items-center gap-1 rounded bg-ok-bg px-2 py-0.5 text-xs font-medium text-ok-ink">
      ✓ Vérifié par un juriste
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
      Sourcé automatiquement
    </span>
  );
}

export function FicheMeta({ miseAJour, verifie }: { miseAJour: string; verifie?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-3">
      <StatutBadge verifie={verifie} />
      <span>Mis à jour le {formatDate(miseAJour)}</span>
    </div>
  );
}

export function Sources({ items }: { items: { label: string; href: string }[] }) {
  return (
    <section id="sources" className="mt-8 scroll-mt-4 border-t border-line pt-4">
      <h2 className="text-sm font-semibold text-ink-2">Sources</h2>
      <ul className="mt-2 space-y-1 text-sm">
        {items.map((s) => (
          <li key={s.href}>
            <a href={s.href} target="_blank" rel="noreferrer">
              {s.label} ↗
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function EtatVide({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded border border-dashed border-line px-3 py-2 text-sm italic text-ink-3">
      {children}
    </p>
  );
}

// Compact citation after a sentence: a single scrutin is linked directly, several point to the list.
export function SourceInline({ items }: { items: { label: string; href: string }[] }) {
  const lien =
    items.length === 1 ? (
      <a href={items[0].href} target="_blank" rel="noreferrer">{items[0].label}</a>
    ) : (
      <a href="#sources">{items.length} scrutins</a>
    );
  return <span className="whitespace-nowrap text-xs text-ink-3"> [source : {lien}]</span>;
}
