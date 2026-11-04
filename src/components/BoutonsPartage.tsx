"use client";

// Share a card: native share sheet (link or image), copy the link, download the image.
import { useState } from "react";

export function BoutonsPartage({ titre, texte, chemin }: { titre: string; texte: string; chemin: string }) {
  const [message, setMessage] = useState("");
  const image = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/carte/${chemin}/partage.png`;
  const url = () => window.location.href.split("#")[0];

  async function partagerLien() {
    if (navigator.share) {
      try {
        await navigator.share({ title: titre, text: texte, url: url() });
      } catch {
        // Closing the share sheet is not an error.
      }
    } else {
      await copier();
    }
  }

  async function partagerImage() {
    try {
      const blob = await (await fetch(image)).blob();
      const fichier = new File([blob], `socle-${chemin}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [fichier] })) {
        await navigator.share({ files: [fichier], title: titre, text: `${texte}\n${url()}` });
        return;
      }
      telecharger(blob);
    } catch {
      // Cancelled share sheet, or no network: nothing to do.
    }
  }

  function telecharger(blob: Blob) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `socle-${chemin}.png`;
    a.click();
    URL.revokeObjectURL(a.href);
    setMessage("Image téléchargée");
  }

  async function copier() {
    await navigator.clipboard.writeText(url());
    setMessage("Lien copié");
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={partagerLien} className="rounded-xl bg-accent px-4 py-3 font-semibold text-white">
          Partager
        </button>
        <button onClick={partagerImage} className="rounded-xl border-2 border-ink px-4 py-3 font-semibold">
          Partager l&apos;image
        </button>
      </div>
      <div className="mt-2 flex justify-center gap-4 text-sm">
        <button onClick={copier} className="text-accent underline underline-offset-4">
          Copier le lien
        </button>
        <a href={image} download={`socle-${chemin}.png`} className="text-accent underline underline-offset-4">
          Télécharger l&apos;image
        </a>
      </div>
      <p role="status" className="mt-1 h-5 text-center text-sm text-ok-ink">
        {message}
      </p>
    </div>
  );
}
