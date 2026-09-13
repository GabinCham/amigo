"use client";

import { useEffect, useState } from "react";
import { speakSpanish } from "@/lib/speech";
import type { Phrase } from "@/lib/types";

export function PhraseList({ phrases }: { phrases: Phrase[] }) {
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const load = () => window.speechSynthesis.getVoices();
    load();
    window.speechSynthesis.onvoiceschanged = load;
  }, []);

  return (
    <ul className="space-y-2">
      {phrases.map((phrase) => (
        <li key={phrase.es}>
          <button
            type="button"
            onClick={() => {
              setOpen(phrase.es);
              void speakSpanish(phrase.es);
            }}
            className="flex w-full items-center justify-between rounded-2xl bg-foam px-4 py-3 text-left shadow-sm ring-1 ring-ink/5"
          >
            <span>
              <span className="block font-serif text-lg">{phrase.es}</span>
              <span className="block text-sm text-muted">{phrase.fr}</span>
            </span>
            <span className="text-terracotta">{open === phrase.es ? "▶" : "écouter"}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
