// Simple line icons for themes (24×24, stroke = currentColor). Decorative: aria-hidden.
const PATHS: Record<string, React.ReactNode> = {
  economie: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M15 9.2a3.5 3.5 0 1 0 0 5.6M7.5 11h6M7.5 13.2h6" />
    </>
  ),
  travail: (
    <>
      <rect x="3.5" y="7.5" width="17" height="11" rx="2" />
      <path d="M9 7.5V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v1.5M3.5 12.5h17" />
    </>
  ),
  sante: <path d="M9.5 4.5h5v5h5v5h-5v5h-5v-5h-5v-5h5z" />,
  education: (
    <>
      <path d="M12 6.5c-2.5-1.5-5.5-1.8-8-1v12c2.5-.8 5.5-.5 8 1 2.5-1.5 5.5-1.8 8-1v-12c-2.5-.8-5.5-.5-8 1z" />
      <path d="M12 6.5v12" />
    </>
  ),
  culture: (
    <>
      <path d="M12 4a8 8 0 1 0 0 16c1.2 0 1.6-.9 1.2-1.8-.5-1-.1-2.2 1.2-2.2H17a3 3 0 0 0 3-3c0-5-3.6-9-8-9z" />
      <circle cx="8" cy="11" r="1" />
      <circle cx="11" cy="7.8" r="1" />
      <circle cx="15" cy="8.5" r="1" />
    </>
  ),
  "securite-justice": (
    <>
      <path d="M12 4v16M7 20h10M5 7h14" />
      <path d="M5 7l-2.5 6a2.5 2 0 0 0 5 0zM19 7l-2.5 6a2.5 2 0 0 0 5 0z" />
    </>
  ),
  institutions: (
    <>
      <path d="M3.5 9 12 4.5 20.5 9M5 9.5v8M9.7 9.5v8M14.3 9.5v8M19 9.5v8M3.5 19.5h17" />
    </>
  ),
  environnement: (
    <>
      <path d="M5 19c0-8 5-13 14-14 0 9-5 14-12 14z" />
      <path d="M5 19c3-4 6-6.5 9.5-8.5" />
    </>
  ),
  immigration: (
    <>
      <rect x="5.5" y="3.5" width="13" height="17" rx="2" />
      <circle cx="12" cy="10.5" r="3" />
      <path d="M9 16.5h6" />
    </>
  ),
  international: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16M12 4c2.5 2.5 2.5 13.5 0 16M12 4c-2.5 2.5-2.5 13.5 0 16" />
    </>
  ),
  numerique: (
    <>
      <rect x="3.5" y="5" width="17" height="11" rx="1.5" />
      <path d="M9 19.5h6M12 16v3.5" />
    </>
  ),
};

export function IconeTheme({ id, className = "h-6 w-6" }: { id: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {PATHS[id] ?? <circle cx="12" cy="12" r="7" />}
    </svg>
  );
}
