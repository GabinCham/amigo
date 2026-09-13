"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { normalizeSpeech } from "@/lib/normalize";
import { getSettings } from "@/lib/storage";
import { WORDS_500, WORD_COUNT, type Word500 } from "@/lib/words500";
import {
  getWordsDay,
  markWordValid,
  msUntilMidnight,
  remainingWords,
  type WordsDay,
} from "@/lib/wordsProgress";

function shuffle<T>(items: T[]) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function matches(word: Word500, typed: string) {
  const n = normalizeSpeech(typed);
  if (!n) return false;
  if (n === normalizeSpeech(word.es)) return true;
  return (word.alt ?? []).some((item) => n === normalizeSpeech(item));
}

const MISSED_KEY = "amigo-words-missed";

function readMissedIds(date: string) {
  if (typeof window === "undefined") return [] as string[];
  try {
    const parsed = JSON.parse(sessionStorage.getItem(MISSED_KEY) ?? "null") as { date: string; ids: string[] } | null;
    if (!parsed || parsed.date !== date) return [];
    return parsed.ids;
  } catch {
    return [];
  }
}

function writeMissedIds(date: string, ids: string[]) {
  sessionStorage.setItem(MISSED_KEY, JSON.stringify({ date, ids }));
}

export function WordsClient() {
  const [tab, setTab] = useState<"liste" | "test">("test");
  const [day, setDay] = useState<WordsDay>({ date: "", validated: [], diploma: false });
  const [queue, setQueue] = useState<Word500[]>([]);
  const [missed, setMissed] = useState<Word500[]>([]);
  const [typed, setTyped] = useState("");
  const [feedback, setFeedback] = useState<"ok" | "ko" | "">("");
  const [round, setRound] = useState<"pass" | "retry">("pass");
  const [showDiploma, setShowDiploma] = useState(false);
  const [name, setName] = useState("Gabin");
  const input = useRef<HTMLInputElement>(null);
  const busy = useRef(false);
  const dateRef = useRef("");

  function hydrate(next: WordsDay) {
    const leftover = remainingWords(next);
    const missedIds = new Set(readMissedIds(next.date).filter((id) => leftover.some((word) => word.id === id)));
    const first = leftover.filter((word) => !missedIds.has(word.id));
    const later = leftover.filter((word) => missedIds.has(word.id));
    setDay(next);
    dateRef.current = next.date;
    if (first.length) {
      setQueue(shuffle(first));
      setMissed(later);
      setRound("pass");
    } else {
      setQueue(shuffle(later));
      setMissed([]);
      setRound(later.length ? "retry" : "pass");
    }
  }

  function loadFromStorage() {
    hydrate(getWordsDay());
  }

  useEffect(() => {
    setName(getSettings().name);
    loadFromStorage();
    const timer = window.setTimeout(() => loadFromStorage(), msUntilMidnight());
    const onVis = () => {
      if (getWordsDay().date !== dateRef.current) loadFromStorage();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  useEffect(() => {
    if (!day.date) return;
    writeMissedIds(day.date, missed.map((word) => word.id));
  }, [missed, day.date]);

  const done = new Set(day.validated);
  const current = queue[0];
  const score = day.validated.length;
  const dateLabel = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const list = useMemo(() => WORDS_500, []);

  function goNext(rest: Word500[], pile: Word500[], diploma: boolean) {
    setTyped("");
    setFeedback("");
    busy.current = false;
    if (rest.length) {
      setQueue(rest);
      setMissed(pile);
    } else if (pile.length) {
      setQueue(shuffle(pile));
      setMissed([]);
      setRound("retry");
    } else {
      setQueue([]);
      setMissed([]);
      if (diploma) setShowDiploma(true);
    }
    window.setTimeout(() => input.current?.focus(), 50);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!current || feedback || busy.current) return;
    const ok = matches(current, typed);
    busy.current = true;
    if (ok) {
      const next = markWordValid(current.id);
      setDay(next);
      setFeedback("ok");
      window.setTimeout(() => goNext(queue.slice(1), missed, next.diploma), 450);
    } else {
      setFeedback("ko");
      window.setTimeout(() => goNext(queue.slice(1), [...missed, current], false), 1600);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-sm uppercase tracking-[0.2em] text-muted">Conversar</p>
        <h1 className="font-serif text-4xl">500 mots</h1>
        <p className="mt-2 text-muted">
          Tu écris l’espagnol. Si tu te trompes, tu vois la réponse, on passe au suivant, et les faux reviennent à la
          fin. Vert = bon aujourd’hui. Minuit = reset.
        </p>
      </header>

      <div className="rounded-3xl bg-foam p-4 ring-1 ring-ink/5">
        <div className="flex items-end justify-between">
          <p className="font-serif text-3xl">
            {score} / {WORD_COUNT}
          </p>
          {day.diploma ? (
            <button type="button" className="text-sm text-terracotta" onClick={() => setShowDiploma(true)}>
              Voir le diplôme
            </button>
          ) : null}
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-paper">
          <div className="h-full bg-olive transition-all" style={{ width: `${(score / WORD_COUNT) * 100}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setTab("test")}
          className={`rounded-full py-2 ${tab === "test" ? "bg-terracotta text-foam" : "bg-foam text-muted"}`}
        >
          Test du jour
        </button>
        <button
          type="button"
          onClick={() => setTab("liste")}
          className={`rounded-full py-2 ${tab === "liste" ? "bg-terracotta text-foam" : "bg-foam text-muted"}`}
        >
          Liste
        </button>
      </div>

      {tab === "test" ? (
        current ? (
          <section className="rounded-3xl bg-foam p-5 ring-1 ring-ink/5">
            <p className="text-sm text-muted">
              {round === "retry" ? "Les faux, encore une fois" : "Première passe"}
              {" · "}
              {queue.length} devant
              {missed.length ? ` · ${missed.length} à revoir à la fin` : ""}
            </p>
            <h2 className="mt-2 font-serif text-4xl">{current.fr}</h2>
            <form onSubmit={submit} className="mt-6 space-y-3">
              <input
                ref={input}
                value={typed}
                onChange={(event) => setTyped(event.target.value)}
                disabled={Boolean(feedback)}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                placeholder="en español"
                className="w-full rounded-2xl bg-paper px-4 py-3 font-serif text-2xl outline-none ring-1 ring-ink/10 disabled:opacity-60"
              />
              <button type="submit" disabled={Boolean(feedback)} className="w-full rounded-full bg-olive py-3 text-foam disabled:opacity-60">
                Valider
              </button>
            </form>
            {feedback === "ok" ? <p className="mt-3 text-center text-olive">¡Eso es!</p> : null}
            {feedback === "ko" ? (
              <p className="mt-3 text-center text-terracotta">
                C’était : <span className="font-serif text-xl text-ink">{current.es}</span>
                <span className="mt-1 block text-sm text-muted">
                  {queue.length > 1 || missed.length ? "On y revient à la fin." : "On le reprend tout de suite."}
                </span>
              </p>
            ) : null}
            <p className="mt-4 text-center text-xs text-muted">Les accents ne sont pas obligatoires.</p>
          </section>
        ) : (
          <section className="rounded-3xl bg-olive px-5 py-8 text-center text-foam">
            <p className="font-serif text-3xl">Lista completa.</p>
            <p className="mt-2 text-foam/80">Les 500 mots du jour sont verts. Screen le diplôme.</p>
            <button type="button" onClick={() => setShowDiploma(true)} className="mt-6 rounded-full bg-foam px-6 py-3 text-olive">
              Diplôme
            </button>
          </section>
        )
      ) : (
        <ul className="grid gap-1 sm:grid-cols-2">
          {list.map((word) => {
            const ok = done.has(word.id);
            return (
              <li
                key={word.id}
                className={`rounded-2xl px-3 py-2 text-sm ring-1 ${
                  ok ? "bg-olive text-foam ring-olive" : "bg-foam text-ink ring-ink/5"
                }`}
              >
                <span className="block text-xs opacity-70">{word.fr}</span>
                <span className="font-serif text-base">{word.es}</span>
              </li>
            );
          })}
        </ul>
      )}

      {showDiploma ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4">
          <div className="confetti" aria-hidden>
            {Array.from({ length: 48 }, (_, i) => (
              <span key={i} className="confetti-piece" style={{ left: `${(i * 7) % 100}%`, animationDelay: `${(i % 12) * 0.08}s` }} />
            ))}
          </div>
          <div className="relative max-h-[90vh] w-full max-w-md overflow-auto rounded-[2rem] border-[10px] border-double border-gold bg-foam px-6 py-8 text-center shadow-2xl">
            <p className="text-xs uppercase tracking-[0.35em] text-gold">Diploma</p>
            <h2 className="mt-3 font-serif text-4xl leading-tight">500 palabras</h2>
            <p className="mt-2 text-muted">para hablar con Amigo</p>
            <p className="mt-6 font-serif text-3xl">{name}</p>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              A validé aujourd’hui les 500 mots les plus utiles pour tenir une conversation : quotidien, voyage et
              fútbol.
            </p>
            <p className="mt-6 text-sm uppercase tracking-[0.2em] text-olive">{dateLabel}</p>
            <p className="mt-8 font-serif text-xl text-terracotta">Amigo · Vanlife</p>
            <button
              type="button"
              onClick={() => setShowDiploma(false)}
              className="mt-8 rounded-full bg-ink px-6 py-3 text-foam"
            >
              Fermer (après le screen)
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
