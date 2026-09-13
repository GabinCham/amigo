import { notFound } from "next/navigation";
import { Lesson } from "@/components/Lesson";
import { getLesson } from "@/lib/curriculum";

export function generateStaticParams() {
  return Array.from({ length: 30 }, (_, i) => ({ day: String(i + 1) }));
}

export default async function DayPage({ params }: { params: Promise<{ day: string }> }) {
  const { day } = await params;
  const n = Number(day);
  if (!Number.isInteger(n) || n < 1 || n > 30) notFound();
  return <Lesson lesson={getLesson(n)} />;
}
