// Generative background: a small grid of geometric shapes, always the same for a given seed.
// Decorative only (aria-hidden); meaning is carried by the text on top.

export type Palette = { fond: string; formes: [string, string, string] };

// Pastel families, deliberately away from party colours.
export const PALETTES: Record<string, Palette> = {
  lavande: { fond: "#efeaff", formes: ["#d6cbff", "#9b85ff", "#4b2fb0"] },
  beurre: { fond: "#fff1d6", formes: ["#ffdf9e", "#ffb45e", "#d9692e"] },
  rose: { fond: "#fde8e7", formes: ["#ffc4bd", "#ff8d80", "#c43d32"] },
  menthe: { fond: "#e3f4e8", formes: ["#b9e6c6", "#6cc58a", "#1d7a3e"] },
  ciel: { fond: "#e6ebff", formes: ["#c3cfff", "#8098ff", "#2a3eb1"] },
};

// Small deterministic PRNG (mulberry32) seeded by a string hash.
function aleatoire(graine: string) {
  let h = 1779033703;
  for (let i = 0; i < graine.length; i++) h = Math.imul(h ^ graine.charCodeAt(i), 3432918353);
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function Motif({ graine, palette, colonnes = 6, lignes = 3, className = "" }: {
  graine: string;
  palette: Palette;
  colonnes?: number;
  lignes?: number;
  className?: string;
}) {
  const r = aleatoire(graine);
  const c = 40; // cell size in SVG units
  const formes: React.ReactNode[] = [];
  for (let y = 0; y < lignes; y++) {
    for (let x = 0; x < colonnes; x++) {
      const couleur = palette.formes[Math.floor(r() * 3)];
      const rot = Math.floor(r() * 4) * 90;
      const cx = x * c + c / 2;
      const cy = y * c + c / 2;
      const t = `rotate(${rot} ${cx} ${cy})`;
      const k = `${x}-${y}`;
      switch (Math.floor(r() * 6)) {
        case 0:
          formes.push(<circle key={k} cx={cx} cy={cy} r={c / 2 - 3} fill={couleur} />);
          break;
        case 1: // half circle
          formes.push(<path key={k} transform={t} d={`M${x * c + 3} ${cy} a${c / 2 - 3} ${c / 2 - 3} 0 0 1 ${c - 6} 0z`} fill={couleur} />);
          break;
        case 2: // quarter circle
          formes.push(<path key={k} transform={t} d={`M${x * c + 3} ${y * c + 3} h${c - 6} a${c - 6} ${c - 6} 0 0 1 -${c - 6} ${c - 6}z`} fill={couleur} />);
          break;
        case 3: // triangle
          formes.push(<path key={k} transform={t} d={`M${x * c + 3} ${y * c + 3} h${c - 6} L${x * c + 3} ${y * c + c - 3}z`} fill={couleur} />);
          break;
        case 4: // small dot
          formes.push(<circle key={k} cx={cx} cy={cy} r={c / 6} fill={couleur} />);
          break;
        default: // empty cell, gives air
          break;
      }
    }
  }
  return (
    <svg
      viewBox={`0 0 ${colonnes * c} ${lignes * c}`}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      style={{ background: palette.fond }}
      aria-hidden
    >
      {formes}
    </svg>
  );
}
