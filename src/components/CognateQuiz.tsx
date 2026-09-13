"use client";

import { useMemo, useState } from "react";
import { normalizeSpeech } from "@/lib/normalize";
import { speakSpanish } from "@/lib/speech";
import type { Pair } from "@/lib/cognates";

function shuffle<T>(items: T[]) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

type Question = {
  pair: Pair;
  options: string[];
};

function buildQuestions(pairs: Pair[], pool: Pair[], count: number): Question[] {
  const picked = shuffle(pairs).slice(0, Math.min(count, pairs.length));
  return picked.map((pair) => {
    const decoys = shuffle(pool.filter((item) => item.es !== pair.es))
      .slice(0, 3)
      .map((item) => item.es);
    return { pair, options: shuffle([pair.es, ...decoys]) };
  });
}

export function CognateQuiz({
  pairs,
  pool,
  onDone,
}: {
  pairs: Pair[];
  pool: Pair[];
  onDone?: (score: number, total: number) => void;
}) {
  const questions = useMemo(() => buildQuestions(pairs, pool, 8), [pairs, pool]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const question = questions[index];
  const finished = index >= questions.length;

  if (!question && !finished) {
    return <p className="text-muted">Pas assez de mots pour un test.</p>;
  }

  if (finished) {
    return (
      <section className="rounded-3xl bg-olive px-5 py-8 text-center text-foam">
        <p className="font-serif text-3xl">
          {score} / {questions.length}
        </p>
        <p className="mt-2 text-foam/80">
          {score >= questions.length - 1 ? "Amigo serait fier." : "Revois la liste, puis réessaie."}
        </p>
        <button
          type="button"
          className="mt-6 rounded-full bg-foam px-6 py-3 text-olive"
          onClick={() => {
            setIndex(0);
            setScore(0);
            setPicked(null);
            setTyped("");
          }}
        >
          Recommencer
        </button>
      </section>
    );
  }

  function grade(answer: string) {
    if (picked) return;
    const ok = normalizeSpeech(answer) === normalizeSpeech(question.pair.es);
    setPicked(answer);
    const nextScore = score + (ok ? 1 : 0);
    setScore(nextScore);
    void speakSpanish(question.pair.es);
    if (index + 1 >= questions.length) onDone?.(nextScore, questions.length);
  }

  function next() {
    setPicked(null);
    setTyped("");
    setIndex(index + 1);
  }

  const correct = picked !== null && normalizeSpeech(picked) === normalizeSpeech(question.pair.es);

  return (
    <section className="rounded-3xl bg-foam p-5 ring-1 ring-ink/5">
      <p className="text-sm text-muted">
        {index + 1} / {questions.length} · {score} bon{score > 1 ? "s" : ""}
      </p>
      <h2 className="mt-2 font-serif text-3xl">{question.pair.fr}</h2>
      <p className="mt-1 text-muted">C’est quoi en espagnol ?</p>
      <div className="mt-4 grid gap-2">
        {question.options.map((option) => {
          const isAnswer = picked && normalizeSpeech(option) === normalizeSpeech(question.pair.es);
          const isWrong = picked === option && !isAnswer;
          return (
            <button
              key={option}
              type="button"
              disabled={Boolean(picked)}
              onClick={() => grade(option)}
              className={`rounded-2xl px-4 py-3 text-left ring-1 ${
                isAnswer
                  ? "bg-olive text-foam ring-olive"
                  : isWrong
                    ? "bg-terracotta/15 ring-terracotta"
                    : "bg-paper ring-ink/10"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!typed.trim()) return;
          grade(typed.trim());
        }}
      >
        <input
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          disabled={Boolean(picked)}
          placeholder="Ou écris le mot"
          className="flex-1 rounded-full bg-paper px-4 py-2 text-sm outline-none ring-1 ring-ink/10"
        />
        <button type="submit" disabled={Boolean(picked)} className="rounded-full bg-ink px-4 py-2 text-sm text-foam">
          OK
        </button>
      </form>
      {picked ? (
        <div className="mt-4 space-y-3">
          <p className={correct ? "text-olive" : "text-terracotta"}>
            {correct ? "Exacto." : `C’était ${question.pair.es}.`}
          </p>
          <button type="button" onClick={next} className="rounded-full bg-terracotta px-5 py-2 text-foam">
            Suivant
          </button>
        </div>
      ) : null}
    </section>
  );
}
