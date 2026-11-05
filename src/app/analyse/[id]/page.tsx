import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { analyses, getAnalyse } from "@/lib/data";
import { AnalyseTexte } from "@/components/AnalyseTexte";

export const dynamicParams = false;
export const generateStaticParams = () => analyses.map((a) => ({ id: a.id }));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const a = getAnalyse(id);
  return a ? { title: a.titre, description: a.enBref } : {};
}

export default async function AnalysePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a = getAnalyse(id);
  if (!a) notFound();
  return (
    <article>
      <Link href="/" className="text-sm">← Vérifier autre chose</Link>
      <div className="mt-5">
        <AnalyseTexte a={a} />
      </div>
    </article>
  );
}
