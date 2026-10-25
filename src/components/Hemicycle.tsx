// Hemicycle: one dot per seat, group colour, fill by vote.
// Groups go left to right in the order of data/groupes.json (derived from official seat numbers).
import { deputes, getGroupe, type Scrutin } from "@/lib/data";
import { repartition } from "@/lib/stats";

type Vote = "pour" | "contre" | "abstention" | "absent";
const LABEL: Record<Vote, string> = {
  pour: "Pour",
  contre: "Contre",
  abstention: "Abstention",
  absent: "Absent ou non-votant",
};

const W = 600;
const R_OUT = 290;
const R_IN = 110;

function places(n: number) {
  // Fewest rows such that seats spaced like the row gap fit; seats per row ∝ radius.
  let rows = 4;
  for (; rows < 30; rows++) {
    const gap = (R_OUT - R_IN) / (rows - 1);
    let cap = 0;
    for (let i = 0; i < rows; i++) cap += Math.floor((Math.PI * (R_IN + i * gap)) / gap) + 1;
    if (cap >= n) break;
  }
  const gap = (R_OUT - R_IN) / (rows - 1);
  const radii = Array.from({ length: rows }, (_, i) => R_IN + i * gap);
  const sum = radii.reduce((a, b) => a + b, 0);
  const counts = radii.map((r) => Math.floor((n * r) / sum));
  for (let i = rows - 1; counts.reduce((a, b) => a + b, 0) < n; i = (i - 1 + rows) % rows) counts[i]++;
  const pts: { x: number; y: number; a: number }[] = [];
  radii.forEach((r, i) => {
    const k = counts[i];
    for (let j = 0; j < k; j++) {
      const a = k === 1 ? Math.PI / 2 : Math.PI - (Math.PI * j) / (k - 1);
      pts.push({ x: W / 2 + r * Math.cos(a), y: R_OUT + 10 - r * Math.sin(a), a });
    }
  });
  // Left to right, then inner to outer: each group gets a wedge.
  pts.sort((p, q) => q.a - p.a);
  return { pts, dot: gap * 0.38 };
}

export function Hemicycle({ scrutin }: { scrutin: Scrutin }) {
  const sieges = scrutin.groupes
    .map((v) => ({ v, g: getGroupe(v.organeRef)! }))
    .toSorted((a, b) => a.g.ordre - b.g.ordre)
    .flatMap(({ v, g }) => {
      const r = repartition(v);
      const nommes = (vote: Vote, ids: string[]) => ids.map((id) => ({ g, vote, nom: deputes[id] }));
      return [
        ...nommes("pour", v.pour),
        ...nommes("abstention", v.abstention),
        ...nommes("contre", v.contre),
        // Absent deputies are not listed by name in the open data.
        ...Array.from({ length: r.absent }, () => ({ g, vote: "absent" as Vote, nom: undefined as string | undefined })),
      ];
    });
  const { pts, dot } = places(sieges.length);
  return (
    <figure>
      <svg
        viewBox={`0 0 ${W} ${R_OUT + 20}`}
        className="w-full h-auto"
        role="img"
        aria-label={`Hémicycle du scrutin n° ${scrutin.numero} : ${scrutin.decompte.pour} pour, ${scrutin.decompte.contre} contre, ${scrutin.decompte.abstention} abstentions.`}
      >
        {sieges.map((s, i) => {
          const p = pts[i];
          const titre = `${s.nom ?? "Député"} — ${s.g.sigle} — ${LABEL[s.vote]}`;
          if (s.vote === "absent")
            return (
              <circle key={i} cx={p.x} cy={p.y} r={dot * 0.55} fill="var(--vote-absent)">
                <title>{titre}</title>
              </circle>
            );
          return (
            <g key={i}>
              <title>{titre}</title>
              {s.vote === "pour" && <circle cx={p.x} cy={p.y} r={dot} fill={s.g.couleur} />}
              {s.vote === "contre" && (
                <circle cx={p.x} cy={p.y} r={dot - 1} fill="#fff" stroke={s.g.couleur} strokeWidth={2} />
              )}
              {s.vote === "abstention" && (
                <>
                  <circle cx={p.x} cy={p.y} r={dot - 1} fill="#fff" stroke={s.g.couleur} strokeWidth={2} />
                  <path d={`M ${p.x - dot + 1} ${p.y} A ${dot - 1} ${dot - 1} 0 0 0 ${p.x + dot - 1} ${p.y} Z`} fill={s.g.couleur} />
                </>
              )}
            </g>
          );
        })}
        <text x={W / 2} y={R_OUT - 20} textAnchor="middle" className="fill-ink" fontSize="34" fontWeight="700">
          {scrutin.decompte.pour} – {scrutin.decompte.contre}
        </text>
        <text x={W / 2} y={R_OUT + 4} textAnchor="middle" className="fill-ink-3" fontSize="15">
          pour – contre · {scrutin.decompte.abstention} abst.
        </text>
      </svg>
      <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-ink-2">
        {(["pour", "contre", "abstention", "absent"] as Vote[]).map((v) => (
          <li key={v} className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
              {v === "pour" && <circle cx="6" cy="6" r="5" fill="var(--ink-2)" />}
              {v === "contre" && <circle cx="6" cy="6" r="4.5" fill="#fff" stroke="var(--ink-2)" strokeWidth="1.5" />}
              {v === "abstention" && (
                <>
                  <circle cx="6" cy="6" r="4.5" fill="#fff" stroke="var(--ink-2)" strokeWidth="1.5" />
                  <path d="M 1.5 6 A 4.5 4.5 0 0 0 10.5 6 Z" fill="var(--ink-2)" />
                </>
              )}
              {v === "absent" && <circle cx="6" cy="6" r="3" fill="#c5c7cc" />}
            </svg>
            {LABEL[v]}
          </li>
        ))}
      </ul>
    </figure>
  );
}
