// Renders a fact-check card as a PNG (link previews and the image people share).
// Runs at build time only (static export), so it may read local font files.
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { VERDICTS, type Carte } from "./data";

// Same values as the --verdict-* tokens in globals.css (ImageResponse cannot read CSS variables).
const COULEURS: Record<string, { bg: string; ink: string }> = {
  jugement: { bg: "#efeaff", ink: "#4b2fb0" },
  depend: { bg: "#fff1d6", ink: "#7a4d00" },
  nuance: { bg: "#fff1d6", ink: "#7a4d00" },
  dementi: { bg: "#fde8e7", ink: "#a3221a" },
  vrai: { bg: "#e3f4e8", ink: "#1d5a2c" },
  faux: { bg: "#fde8e7", ink: "#a3221a" },
};

const police = (poids: number) =>
  readFile(join(process.cwd(), `node_modules/@fontsource/figtree/files/figtree-latin-${poids}-normal.woff`));

export const SITE = (process.env.SITE_URL ?? "http://localhost:3000").replace(/^https?:\/\//, "");

export async function imageCarte(c: Carte, size: { width: number; height: number }) {
  const portrait = size.height > size.width;
  const v = COULEURS[c.verdict];
  const nFaits = c.faits.length || 1;
  // First sentence of the first facts, for the portrait image only.
  const court = (t: string) => {
    const phrase = t.split(/(?<=\.)\s/)[0];
    return phrase.length > 150 ? phrase.slice(0, 147).trimEnd() + "…" : phrase;
  };
  const apercuFaits = portrait ? c.faits.slice(0, 2).map((f) => court(f.texte)) : [];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#ffffff",
          padding: portrait ? 80 : 64,
          fontFamily: "Figtree",
          color: "#14161f",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: portrait ? 40 : 34, fontWeight: 800 }}>
            Socle<span style={{ color: "#2a3eb1" }}>.</span>
          </div>
          <div
            style={{
              display: "flex",
              background: v.bg,
              color: v.ink,
              fontSize: portrait ? 30 : 26,
              fontWeight: 800,
              padding: "10px 22px",
              borderRadius: 999,
            }}
          >
            {VERDICTS[c.verdict].court}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: portrait ? 70 : 36,
            fontSize: portrait ? 64 : 50,
            fontWeight: 800,
            lineHeight: 1.12,
            letterSpacing: -1,
          }}
        >
          « {c.affirmation} »
        </div>
        <div
          style={{
            display: "flex",
            marginTop: portrait ? 56 : 28,
            padding: portrait ? "36px 40px" : "24px 30px",
            background: "#f5f4f0",
            borderRadius: 28,
            fontSize: portrait ? 36 : 28,
            lineHeight: 1.35,
            fontWeight: 600,
            color: "#3d4150",
          }}
        >
          {c.enBref}
        </div>
        {apercuFaits.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", marginTop: 48 }}>
            <div style={{ display: "flex", fontSize: 26, fontWeight: 800, color: "#6b6f7b", letterSpacing: 2 }}>
              CE QUE DISENT LES DONNÉES
            </div>
            {apercuFaits.map((f) => (
              <div key={f} style={{ display: "flex", marginTop: 18, fontSize: 30, lineHeight: 1.35 }}>
                <span style={{ color: "#2a3eb1", marginRight: 14 }}>→</span>
                <span style={{ flex: 1 }}>{f}</span>
              </div>
            ))}
          </div>
        )}
        <div
          style={{
            display: "flex",
            marginTop: "auto",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: portrait ? 28 : 22,
            color: "#6b6f7b",
          }}
        >
          <span>
            {nFaits} fait{nFaits > 1 ? "s" : ""} sourcé{nFaits > 1 ? "s" : ""} · ce qui dépend de la définition · ce qu&apos;on ne sait pas
          </span>
        </div>
        <div style={{ display: "flex", marginTop: 10, fontSize: portrait ? 30 : 24, fontWeight: 600, color: "#2a3eb1" }}>
          {SITE}/carte/{c.id}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Figtree", data: await police(400), weight: 400, style: "normal" },
        { name: "Figtree", data: await police(600), weight: 600, style: "normal" },
        { name: "Figtree", data: await police(800), weight: 800, style: "normal" },
      ],
    },
  );
}
