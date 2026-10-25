// Progressive disclosure: a closed section that opens on tap.
export function Deplier({
  titre,
  children,
  ouvert = false,
}: {
  titre: React.ReactNode;
  children: React.ReactNode;
  ouvert?: boolean;
}) {
  return (
    <details open={ouvert} className="group border-b border-line">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3.5 font-medium [&::-webkit-details-marker]:hidden">
        <span>{titre}</span>
        <span aria-hidden className="text-ink-3 transition-transform group-open:rotate-90 motion-reduce:transition-none">
          ›
        </span>
      </summary>
      <div className="pb-4">{children}</div>
    </details>
  );
}
