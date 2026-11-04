// Landscape image of a card (1200×630), used for link previews (WhatsApp, réseaux sociaux).
import { cartes, getCarte } from "@/lib/data";
import { imageCarte } from "@/lib/image-carte";

export const dynamic = "force-static";
export const generateStaticParams = () => cartes.map((c) => ({ id: c.id }));

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return imageCarte(getCarte(id)!, { width: 1200, height: 630 });
}
