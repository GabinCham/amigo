"use client";

import Link from "next/link";
import { CognateQuiz } from "@/components/CognateQuiz";
import { allPairs } from "@/lib/cognates";

export default function MixPage() {
  const pool = allPairs();
  return (
    <div className="flex flex-col gap-6">
      <Link href="/ponts" className="text-sm text-muted">
        ← Ponts
      </Link>
      <header>
        <p className="text-sm uppercase tracking-[0.2em] text-muted">Mix</p>
        <h1 className="font-serif text-4xl">Toutes les familles</h1>
        <p className="mt-2 text-muted">On te donne le français, tu retrouves l’espagnol.</p>
      </header>
      <CognateQuiz pairs={pool} pool={pool} />
    </div>
  );
}
