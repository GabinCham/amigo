"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { curriculum, THEME_LABEL } from "@/lib/curriculum";
import { getProgress } from "@/lib/storage";

export function PlanClient() {
  const [done, setDone] = useState<number[]>([]);

  useEffect(() => {
    setDone(getProgress().completedDays);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-sm uppercase tracking-[0.2em] text-muted">Plan</p>
        <h1 className="font-serif text-4xl">30 días</h1>
        <p className="mt-2 text-muted">Semaine 1 quotidien · 2 foot · 3 voyage · 4 on mélange.</p>
      </header>
      <ol className="grid gap-2 sm:grid-cols-2">
        {curriculum.map((lesson) => {
          const complete = done.includes(lesson.day);
          return (
            <li key={lesson.day}>
              <Link
                href={`/dia/${lesson.day}`}
                className={`block rounded-2xl px-4 py-3 ring-1 ${
                  complete ? "bg-olive/10 ring-olive/20" : "bg-foam ring-ink/5"
                }`}
              >
                <p className="text-xs text-muted">
                  Jour {lesson.day} · {THEME_LABEL[lesson.theme]}
                  {complete ? " · hecho" : ""}
                </p>
                <p className="font-serif text-xl">{lesson.title}</p>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
