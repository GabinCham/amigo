"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { MicButton } from "@/components/MicButton";
import { PhraseList } from "@/components/PhraseList";
import { isGoodEnough, scoreUtterance } from "@/lib/normalize";
import { speakSpanish } from "@/lib/speech";
import { markDayComplete } from "@/lib/storage";
import { dueCount, markSpoken, rememberPhrases } from "@/lib/srs";
import type { DayLesson } from "@/lib/types";

type Step = "phrases" | "drills" | "done";

export function Lesson({ lesson }: { lesson: DayLesson }) {
  const [step, setStep] = useState<Step>("phrases");
  const [index, setIndex] = useState(0);
  const [heard, setHeard] = useState("");
  const [verdict, setVerdict] = useState<"ok" | "retry" | "">("");
  const [due, setDue] = useState(0);
  const drill = lesson.drills[index];

  useEffect(() => {
    setDue(dueCount());
  }, [step, index]);

  const score = useMemo(() => {
    if (!heard || !drill) return 0;
    return scoreUtterance(heard, drill.sample, drill.expect);
  }, [heard, drill]);

  function onHeard(text: string) {
    setHeard(text);
    const next = scoreUtterance(text, drill.sample, drill.expect);
    const ok = isGoodEnough(next);
    setVerdict(ok ? "ok" : "retry");
    markSpoken(drill.sample, drill.promptFr, ok);
  }

  function nextDrill() {
    setHeard("");
    setVerdict("");
    if (index + 1 >= lesson.drills.length) {
      rememberPhrases(lesson.phrases);
      markDayComplete(lesson.day);
      setStep("done");
      return;
    }
    setIndex(index + 1);
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-sm uppercase tracking-[0.2em] text-muted">Jour {lesson.day}</p>
        <h1 className="font-serif text-4xl leading-tight">{lesson.title}</h1>
        <p className="mt-2 text-muted">{lesson.goal}</p>
      </header>

      {due > 0 && step === "phrases" ? (
        <Link href="/revisar" className="rounded-2xl bg-olive px-4 py-3 text-foam">
          {due} phrase{due > 1 ? "s" : ""} à revoir avant d’avancer →
        </Link>
      ) : null}
      <button
        type="button"
        onClick={() => void speakSpanish(lesson.amigoOpens)}
        className="rounded-3xl bg-pitch px-5 py-4 text-left text-foam"
      >
        <p className="text-xs uppercase tracking-widest text-gold">Amigo dit</p>
        <p className="mt-1 font-serif text-2xl">{lesson.amigoOpens}</p>
        <p className="mt-1 text-sm text-foam/70">{lesson.amigoOpensFr}</p>
      </button>

      {step === "phrases" ? (
        <>
          <PhraseList phrases={lesson.phrases} />
          <button
            type="button"
            onClick={() => setStep("drills")}
            className="rounded-full bg-terracotta py-3 text-foam"
          >
            Je parle
          </button>
        </>
      ) : null}

      {step === "drills" && drill ? (
        <section className="rounded-3xl bg-foam p-5 shadow-sm ring-1 ring-ink/5">
          <p className="text-sm text-muted">
            Phrase {index + 1} / {lesson.drills.length}
          </p>
          <h2 className="mt-1 font-serif text-2xl">{drill.promptFr}</h2>
          <p className="mt-2 text-muted">
            Vise : <span className="text-ink">{drill.sample}</span>
          </p>
          <div className="mt-6">
            <MicButton onHeard={onHeard} />
          </div>
          {heard ? (
            <p className="mt-4 text-center">
              Tu as dit : <strong>{heard}</strong>
            </p>
          ) : null}
          {verdict === "ok" ? (
            <div className="mt-4 space-y-3 text-center">
              <p className="text-olive">Amigo a compris ({Math.round(score * 100)}%).</p>
              <button type="button" onClick={nextDrill} className="rounded-full bg-olive px-6 py-3 text-foam">
                Continuer
              </button>
            </div>
          ) : null}
          {verdict === "retry" ? (
            <div className="mt-4 space-y-3 text-center">
              <p className="text-terracotta">Presque. Écoute encore, puis réessaie.</p>
              <button type="button" onClick={() => void speakSpanish(drill.sample)} className="text-sm underline">
                Entendre le modèle
              </button>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    markSpoken(drill.sample, drill.promptFr, false);
                    nextDrill();
                  }}
                  className="text-sm text-muted"
                >
                  Passer
                </button>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {step === "done" ? (
        <section className="rounded-3xl bg-olive px-5 py-8 text-center text-foam">
          <p className="font-serif text-3xl">Jour {lesson.day} fait.</p>
          <p className="mt-2 text-foam/80">Revois ce qui a coincé, puis envoie 30 secondes à Amigo.</p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <Link href="/revisar" className="inline-block rounded-full bg-foam px-6 py-3 text-olive">
              Révision
            </Link>
            <Link href="/mensaje" className="inline-block rounded-full border border-foam/40 px-6 py-3 text-foam">
              Message pour Amigo
            </Link>
            <Link href="/hablar" className="text-sm text-foam/80">
              Ou parler ici
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}
