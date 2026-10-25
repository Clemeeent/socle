// Vote categories and percentage formatting. No data import: safe in client components.
export type Repartition = { pour: number; contre: number; abstention: number; absent: number; membres: number };

export const CATEGORIES = [
  { key: "pour", label: "Pour" },
  { key: "contre", label: "Contre" },
  { key: "abstention", label: "Abstention" },
  { key: "absent", label: "Absent ou non-votant" },
] as const;

export const part = (n: number, total: number) => (total === 0 ? 0 : n / total);
export const pct = (x: number) => `${Math.round(x * 100)}\u00a0%`;
