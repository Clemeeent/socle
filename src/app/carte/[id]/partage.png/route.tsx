// Portrait image of a card (1080×1350), for messaging apps and stories. Built once, served as a file.
import { cartes, getCarte } from "@/lib/data";
import { imageCarte } from "@/lib/image-carte";

export const dynamic = "force-static";
export const generateStaticParams = () => cartes.map((c) => ({ id: c.id }));

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return imageCarte(getCarte(id)!, { width: 1080, height: 1350 });
}
