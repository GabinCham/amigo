"use client";

import Link from "next/link";
import { useState } from "react";
import { CognateQuiz } from "@/components/CognateQuiz";
import { allPairs, type Family } from "@/lib/cognates";
import { speakSpanish } from "@/lib/speech";

export function FamilyClient({ family }: { family: Family }) {
  const [tab, setTab] = useState<"liste" | "test">("liste");
  const pool = allPairs();

  return (
    <div className="flex flex-col gap-6">
      <Link href="/ponts" className="text-sm text-muted">
        ← Ponts
      </Link>
      <header>
        <p className="text-sm uppercase tracking-[0.2em] text-muted">
          {family.frEnd} → {family.esEnd}
        </p>
        <h1 className="font-serif text-4xl">{family.title}</h1>
        <p className="mt-3 text-muted">{family.rule}</p>
        <p className="mt-2 text-sm text-terracotta">{family.caveat}</p>
      </header>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setTab("liste")}
          className={`rounded-full py-2 ${tab === "liste" ? "bg-terracotta text-foam" : "bg-foam text-muted"}`}
        >
          Liste
        </button>
        <button
          type="button"
          onClick={() => setTab("test")}
          className={`rounded-full py-2 ${tab === "test" ? "bg-terracotta text-foam" : "bg-foam text-muted"}`}
        >
          Test
        </button>
      </div>

      {tab === "liste" ? (
        <ul className="space-y-2">
          {family.pairs.map((pair) => (
            <li key={`${pair.fr}-${pair.es}`}>
              <button
                type="button"
                onClick={() => void speakSpanish(pair.es)}
                className="flex w-full items-baseline justify-between gap-3 rounded-2xl bg-foam px-4 py-3 text-left ring-1 ring-ink/5"
              >
                <span>
                  <span className="block text-muted">{pair.fr}</span>
                  <span className="font-serif text-xl">{pair.es}</span>
                  {pair.note ? <span className="mt-1 block text-sm text-terracotta">{pair.note}</span> : null}
                </span>
                <span className="text-sm text-terracotta">écouter</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <CognateQuiz pairs={family.pairs} pool={pool.length > 8 ? pool : family.pairs} />
      )}
    </div>
  );
}
