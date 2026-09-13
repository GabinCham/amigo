"use client";

import { useRef, useState } from "react";
import { listenOnce } from "@/lib/speech";

type Props = {
  onHeard: (text: string) => void;
  disabled?: boolean;
};

export function MicButton({ onHeard, disabled }: Props) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const busy = useRef(false);

  async function start() {
    if (disabled || busy.current) return;
    busy.current = true;
    setError("");
    setListening(true);
    try {
      const text = await listenOnce();
      onHeard(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Micro indisponible.");
    } finally {
      setListening(false);
      busy.current = false;
    }
  }

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <button
        type="button"
        onClick={start}
        disabled={disabled || listening}
        className={`flex h-20 w-20 items-center justify-center rounded-full text-foam shadow-lg transition active:scale-95 disabled:opacity-60 ${
          listening ? "bg-olive animate-pulse" : "bg-terracotta"
        }`}
        aria-label="Parler"
      >
        <span className="text-3xl">{listening ? "●" : "🎙️"}</span>
      </button>
      <p className="text-sm text-muted">
        {listening ? "Habla…" : "Appuie et parle en espagnol"}
      </p>
      {error ? <p className="text-sm text-terracotta">{error}</p> : null}
      <form
        className="mt-2 flex w-full gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const input = form.elements.namedItem("typed") as HTMLInputElement;
          const value = input.value.trim();
          if (!value || disabled) return;
          input.value = "";
          onHeard(value);
        }}
      >
        <input
          name="typed"
          disabled={disabled}
          placeholder="Ou écris ici : Hola, Amigo"
          className="flex-1 rounded-full bg-paper px-4 py-2 text-sm outline-none ring-1 ring-ink/10"
        />
        <button type="submit" className="rounded-full bg-ink px-4 py-2 text-sm text-foam" disabled={disabled}>
          Envoyer
        </button>
      </form>
    </div>
  );
}
