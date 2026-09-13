"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MicButton } from "@/components/MicButton";
import { isGoodEnough, scoreUtterance } from "@/lib/normalize";
import { speakSpanish } from "@/lib/speech";
import { dueCards, markSpoken, type Card } from "@/lib/srs";

export function ReviewClient() {
  const [queue, setQueue] = useState<Card[]>([]);
  const [heard, setHeard] = useState("");
  const [verdict, setVerdict] = useState<"ok" | "retry" | "">("");
  const [done, setDone] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setQueue(dueCards());
    setReady(true);
  }, []);

  const card = queue[0];
  const score = useMemo(() => {
    if (!heard || !card) return 0;
    return scoreUtterance(heard, card.es, card.es.split(" ").slice(0, 3));
  }, [heard, card]);

  function onHeard(text: string) {
    if (!card) return;
    setHeard(text);
    setVerdict(isGoodEnough(scoreUtterance(text, card.es, card.es.split(" ").slice(0, 3))) ? "ok" : "retry");
  }

  function pass() {
    if (!card) return;
    markSpoken(card.es, card.fr, true);
    setHeard("");
    setVerdict("");
    setDone((n) => n + 1);
    setQueue(queue.slice(1));
  }

  function fail() {
    if (!card) return;
    markSpoken(card.es, card.fr, false);
    setHeard("");
    setVerdict("");
    setQueue(queue.slice(1));
  }

  if (!ready) return <p className="text-muted">Cargando…</p>;

  if (!card) {
    return (
      <section className="rounded-3xl bg-olive px-5 py-8 text-center text-foam">
        <p className="font-serif text-3xl">{done ? `${done} revue${done > 1 ? "s" : ""}.` : "Rien à revoir."}</p>
        <p className="mt-2 text-foam/80">Passe au jour, ou envoie un message à Amigo.</p>
        <div className="mt-6 flex flex-col gap-3">
          <Link href="/" className="rounded-full bg-foam px-6 py-3 text-olive">
            Jour
          </Link>
          <Link href="/mensaje" className="text-foam/80">
            Message pour Amigo
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-sm uppercase tracking-[0.2em] text-muted">
          Révision · {queue.length} restante{queue.length > 1 ? "s" : ""}
        </p>
        <h1 className="font-serif text-4xl">Dis-le encore.</h1>
        <p className="mt-2 text-muted">Les phrases oubliées, avant le nouveau jour.</p>
      </header>

      <section className="rounded-3xl bg-foam p-5 ring-1 ring-ink/5">
        <p className="text-muted">{card.fr}</p>
        <button type="button" className="mt-2 text-sm text-terracotta" onClick={() => void speakSpanish(card.es)}>
          Indice sonore
        </button>
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
            <p className="text-olive">OK ({Math.round(score * 100)}%).</p>
            <button type="button" onClick={pass} className="rounded-full bg-olive px-6 py-3 text-foam">
              Suivant
            </button>
          </div>
        ) : null}
        {verdict === "retry" ? (
          <div className="mt-4 space-y-3 text-center">
            <p className="text-terracotta">Cible : {card.es}</p>
            <button type="button" onClick={() => void speakSpanish(card.es)} className="text-sm underline">
              Écouter
            </button>
            <div className="flex justify-center gap-4">
              <button type="button" onClick={fail} className="text-sm text-muted">
                Encore demain
              </button>
              <button type="button" onClick={pass} className="text-sm text-olive">
                Je savais
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
