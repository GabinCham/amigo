import { notFound } from "next/navigation";
import { FamilyClient } from "@/components/FamilyClient";
import { families, getFamily } from "@/lib/cognates";

export function generateStaticParams() {
  return families.map((family) => ({ id: family.id }));
}

export default async function FamilyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === "mix") notFound();
  const family = getFamily(id);
  if (!family) notFound();
  return <FamilyClient family={family} />;
}
