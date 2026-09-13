"use client";

import { useEffect, useRef, useState } from "react";
import { dailyPrompt, SURVIVAL } from "@/lib/mensaje";
import { getSettings } from "@/lib/storage";

const MAX_MS = 30_000;

export function MensajeClient() {
  const [text, setText] = useState("");
  const [prompt, setPrompt] = useState({ fr: "", seed: "" });
  const [copied, setCopied] = useState("");
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState("");
  const [error, setError] = useState("");
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<number | null>(null);
  const started = useRef(0);

  useEffect(() => {
    const settings = getSettings();
    const next = dailyPrompt(settings);
    setPrompt(next);
    setText(next.seed);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, []);

  async function copy(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1600);
  }

  function stopRec() {
    recorder.current?.stop();
    recorder.current?.stream.getTracks().forEach((track) => track.stop());
    recorder.current = null;
    setRecording(false);
    if (timer.current) window.clearInterval(timer.current);
  }

  async function startRec() {
    setError("");
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : undefined;
      const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      chunks.current = [];
      rec.ondataavailable = (event) => {
        if (event.data.size) chunks.current.push(event.data);
      };
      rec.onstop = () => {
        const blob = new Blob(chunks.current, { type: rec.mimeType || "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
      };
      recorder.current = rec;
      started.current = Date.now();
      setSeconds(0);
      rec.start();
      setRecording(true);
      timer.current = window.setInterval(() => {
        const elapsed = Date.now() - started.current;
        setSeconds(Math.floor(elapsed / 1000));
        if (elapsed >= MAX_MS) stopRec();
      }, 200);
    } catch {
      setError("Micro bloqué. Autorise-le, ou colle juste le texte dans WhatsApp.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-sm uppercase tracking-[0.2em] text-muted">WhatsApp</p>
        <h1 className="font-serif text-4xl">Message pour Amigo</h1>
        <p className="mt-2 text-muted">{prompt.fr} 30 secondes max, même bancal.</p>
      </header>

      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={5}
        className="w-full rounded-3xl bg-foam px-4 py-3 font-serif text-xl outline-none ring-1 ring-ink/10"
      />

      <div className="flex flex-wrap gap-2">
        {SURVIVAL.map((item) => (
          <button
            key={item.es}
            type="button"
            title={item.fr}
            onClick={() => setText((current) => `${current.trim()} ${item.es}`.trim())}
            className="rounded-full bg-foam px-3 py-1 text-sm ring-1 ring-ink/10"
          >
            {item.es}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => void copy(text, "Texte copié")}
          className="rounded-full bg-terracotta py-3 text-foam sm:flex-1"
        >
          Copier le texte
        </button>
        <button
          type="button"
          onClick={() => (recording ? stopRec() : void startRec())}
          className={`rounded-full py-3 text-foam sm:flex-1 ${recording ? "bg-olive" : "bg-pitch"}`}
        >
          {recording ? `Stop · ${seconds}s` : "Enregistrer 30s"}
        </button>
      </div>
      {copied ? <p className="text-center text-olive">{copied}</p> : null}
      {error ? <p className="text-terracotta">{error}</p> : null}

      {audioUrl ? (
        <div className="space-y-3 rounded-3xl bg-foam p-4 ring-1 ring-ink/5">
          <audio controls src={audioUrl} className="w-full" />
          <a href={audioUrl} download="amigo-nota.webm" className="block text-center text-sm text-terracotta">
            Télécharger l’audio
          </a>
          <p className="text-sm text-muted">Envoie le vocal sur WhatsApp, ou colle le texte si c’est plus simple.</p>
        </div>
      ) : (
        <p className="text-sm text-muted">Dans Toi, ajoute son équipe et un lieu de voyage : le prompt s’adapte.</p>
      )}
    </div>
  );
}
