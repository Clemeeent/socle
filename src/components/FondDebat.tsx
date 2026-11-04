// Discreet generative background for the top of the home page: scattered clusters of dots, each one
// a "discussion" — two colours like two voices answering each other — that fills up dot by dot,
// then fades out. Nothing is drawn while a dot is off.
// Pure SVG + CSS animation (seeded, no script); nothing shows with reduced motion. Decorative: aria-hidden.
import { aleatoire } from "./Motif";

const VOIX = [
  ["#9b85ff", "#ffb45e"],
  ["#8098ff", "#ff8d80"],
  ["#6cc58a", "#9b85ff"],
  ["#ffb45e", "#8098ff"],
  ["#ff8d80", "#6cc58a"],
];

type Point = { x: number; y: number; r: number; couleur: string; delai: number; duree: number };

// One canvas per screen shape, so a phone shows as many discussions as a desktop.
const FORMATS = {
  large: { largeur: 960, hauteur: 300, nombre: 18, ecart: 90 },
  etroit: { largeur: 390, hauteur: 520, nombre: 9, ecart: 80 },
};

function discussions(format: keyof typeof FORMATS): Point[] {
  const { largeur, hauteur, nombre, ecart } = FORMATS[format];
  const r = aleatoire(`socle-debat-${format}`);
  const centres: { x: number; y: number }[] = [];
  // Scattered cluster centres, kept apart from each other.
  for (let essai = 0; centres.length < nombre && essai < 500; essai++) {
    const c = { x: 20 + r() * (largeur - 40), y: 20 + r() * (hauteur - 40) };
    if (centres.every((d) => Math.hypot(d.x - c.x, d.y - c.y) > ecart)) centres.push(c);
  }
  return centres.flatMap((c) => {
    const voix = VOIX[Math.floor(r() * VOIX.length)];
    const n = 3 + Math.floor(r() * 4); // 3 to 6 contributions
    const debut = r() * 12;
    const duree = 10 + r() * 6; // whole cycle of this discussion, in seconds
    const pas = 0.5 + r() * 0.5; // time between two replies
    let angle = r() * Math.PI * 2;
    return Array.from({ length: n }, (_, k) => {
      // Each reply lands near the previous ones, turning around the centre.
      angle += 1.2 + r() * 1.6;
      const distance = k === 0 ? 0 : 8 + r() * 16;
      return {
        x: c.x + Math.cos(angle) * distance,
        y: c.y + Math.sin(angle) * distance,
        r: 2.2 + r() * 2.2,
        couleur: voix[k % 2],
        delai: debut + k * pas,
        duree,
      };
    });
  });
}

function Toile({ format, className }: { format: keyof typeof FORMATS; className: string }) {
  const { largeur, hauteur } = FORMATS[format];
  return (
    <svg viewBox={`0 0 ${largeur} ${hauteur}`} preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      {discussions(format).map((p, i) => (
        <circle
          key={i}
          cx={p.x.toFixed(1)}
          cy={p.y.toFixed(1)}
          r={p.r.toFixed(1)}
          fill={p.couleur}
          className="point-debat"
          style={{ animationDelay: `${p.delai.toFixed(2)}s`, animationDuration: `${p.duree.toFixed(2)}s` }}
        />
      ))}
    </svg>
  );
}

export function FondDebat({ className = "" }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <Toile format="etroit" className="h-full w-full sm:hidden" />
      <Toile format="large" className="hidden h-full w-full sm:block" />
    </div>
  );
}
