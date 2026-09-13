"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MicButton } from "@/components/MicButton";
import { askAmigoAi } from "@/lib/amigoAi";
import { localAmigoReply } from "@/lib/localAmigo";
import { speakSpanish } from "@/lib/speech";
import { getSettings } from "@/lib/storage";
import type { ChatTurn } from "@/lib/types";

const opening: ChatTurn = {
  role: "amigo",
  es: "¡Hola! Soy Amigo. ¿Qué tal el día?",
  fr: "Salut ! C’est Amigo. Ça va aujourd’hui ?",
};

export function TalkClient() {
  const [turns, setTurns] = useState<ChatTurn[]>([opening]);
  const [pending, setPending] = useState(false);
  const [showFr, setShowFr] = useState(true);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void speakSpanish(opening.es);
  }, []);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, pending]);

  async function onHeard(text: string) {
    const you: ChatTurn = { role: "you", es: text };
    const history = [...turns, you];
    setTurns(history);
    setPending(true);

    const settings = getSettings();
    if (settings.apiKey) {
      try {
        const data = await askAmigoAi({
          apiKey: settings.apiKey,
          userName: settings.name,
          history: history.map((turn) => ({ role: turn.role, es: turn.es })),
          lastUser: text,
        });
        const amigo: ChatTurn = {
          role: "amigo",
          es: data.es,
          fr: data.fr,
          correction: data.correction,
        };
        setTurns([...history, amigo]);
        await speakSpanish(amigo.es);
        setPending(false);
        return;
      } catch {
        /* fallback local */
      }
    }

    const local = localAmigoReply(text);
    const amigo: ChatTurn = { role: "amigo", es: local.es, fr: local.fr };
    setTurns([...history, amigo]);
    await speakSpanish(amigo.es);
    setPending(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted">Llamada</p>
          <h1 className="font-serif text-4xl">Amigo</h1>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={showFr} onChange={(e) => setShowFr(e.target.checked)} />
          Filet FR
        </label>
      </header>

      <div className="flex min-h-[42vh] flex-col gap-3 rounded-[2rem] bg-foam/80 p-4 ring-1 ring-ink/5">
        {turns.map((turn, i) => (
          <article
            key={`${turn.role}-${i}`}
            className={`max-w-[90%] rounded-3xl px-4 py-3 ${
              turn.role === "amigo" ? "self-start bg-pitch text-foam" : "self-end bg-terracotta text-foam"
            }`}
          >
            <p className="text-xs uppercase tracking-widest opacity-70">
              {turn.role === "amigo" ? "Amigo" : "Toi"}
            </p>
            <p className="font-serif text-xl">{turn.es}</p>
            {showFr && turn.fr ? <p className="mt-1 text-sm opacity-75">{turn.fr}</p> : null}
            {turn.correction ? (
              <p className="mt-2 text-sm text-gold">
                Plutôt : {turn.correction.better} — {turn.correction.noteFr}
              </p>
            ) : null}
          </article>
        ))}
        {pending ? <p className="text-sm text-muted">Amigo escucha…</p> : null}
        <div ref={bottom} />
      </div>

      <MicButton onHeard={onHeard} disabled={pending} />
      <Link href="/mensaje" className="text-center text-sm text-terracotta">
        Envoyer un vrai message à Amigo →
      </Link>
      <p className="text-center text-sm text-muted">
        Chrome ou Safari, micro autorisé. Pour une vraie conversation libre, ajoute une clé OpenAI dans Toi.
      </p>
    </div>
  );
}
