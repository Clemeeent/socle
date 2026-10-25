// Status badge: automatic sourcing vs checked by a lawyer.

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
