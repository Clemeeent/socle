// Discreet generative background for the top of the home page: a grid of faint dots where small
// groups of neighbours light up one after another, like an exchange, then fade out.
// Pure SVG + CSS animation (no script); still with reduced motion. Decorative: aria-hidden.
import { aleatoire } from "./Motif";

const COLONNES = 40;
const LIGNES = 12;
const PAS = 24;
const COULEURS = ["#9b85ff", "#ffb45e", "#ff8d80", "#8098ff", "#6cc58a"];
const VOISINS = [
  [1, 0],
  [0, 1],
  [1, 1],
  [-1, 1],
];

export function FondDebat({ className = "" }: { className?: string }) {
  const r = aleatoire("socle-debat");
  // Groups of 2-3 neighbouring dots; each group answers in turn, with its own rhythm.
  const allumes = new Map<string, { couleur: string; delai: number; duree: number }>();
  for (let g = 0; g < 48; g++) {
    let x = Math.floor(r() * COLONNES);
    let y = Math.floor(r() * LIGNES);
    const couleur = COULEURS[Math.floor(r() * COULEURS.length)];
    const debut = r() * 9;
    const duree = 7 + r() * 5;
    const taille = 2 + Math.floor(r() * 2);
    for (let k = 0; k < taille; k++) {
      const cle = `${x}-${y}`;
      if (!allumes.has(cle)) allumes.set(cle, { couleur, delai: debut + k * 0.9, duree });
      const [dx, dy] = VOISINS[Math.floor(r() * VOISINS.length)];
      x = Math.min(COLONNES - 1, Math.max(0, x + dx));
      y = Math.min(LIGNES - 1, Math.max(0, y + dy));
    }
  }
  const points: React.ReactNode[] = [];
  for (let y = 0; y < LIGNES; y++) {
    for (let x = 0; x < COLONNES; x++) {
      const cx = x * PAS + PAS / 2;
      const cy = y * PAS + PAS / 2;
      const a = allumes.get(`${x}-${y}`);
      points.push(<circle key={`b${x}-${y}`} cx={cx} cy={cy} r={2} fill="#e4e2dc" />);
      if (a)
        points.push(
          <circle
            key={`a${x}-${y}`}
            cx={cx}
            cy={cy}
            r={3.4}
            fill={a.couleur}
            className="point-debat"
            style={{ animationDelay: `${a.delai.toFixed(2)}s`, animationDuration: `${a.duree.toFixed(2)}s` }}
          />,
        );
    }
  }
  return (
    <svg
      viewBox={`0 0 ${COLONNES * PAS} ${LIGNES * PAS}`}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden
    >
      {points}
    </svg>
  );
}
