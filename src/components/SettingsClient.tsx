"use client";

import { useEffect, useState } from "react";
import { canListen, canSpeak } from "@/lib/speech";
import { getSettings, saveSettings } from "@/lib/storage";

export function SettingsClient() {
  const [name, setName] = useState("Gabin");
  const [apiKey, setApiKey] = useState("");
  const [team, setTeam] = useState("");
  const [place, setPlace] = useState("");
  const [saved, setSaved] = useState(false);
  const [speech, setSpeech] = useState({ listen: false, speak: false });

  useEffect(() => {
    const settings = getSettings();
    setName(settings.name);
    setApiKey(settings.apiKey);
    setTeam(settings.team ?? "");
    setPlace(settings.place ?? "");
    setSpeech({ listen: canListen(), speak: canSpeak() });
  }, []);

  function onSave(event: React.FormEvent) {
    event.preventDefault();
    saveSettings({ name, apiKey, team, place });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-sm uppercase tracking-[0.2em] text-muted">Réglages</p>
        <h1 className="font-serif text-4xl">Toi et Amigo</h1>
      </header>

      <form onSubmit={onSave} className="space-y-4 rounded-3xl bg-foam p-5 ring-1 ring-ink/5">
        <label className="block">
          <span className="text-sm text-muted">Ton prénom</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-2xl border-0 bg-paper px-4 py-3 outline-none ring-1 ring-ink/10"
          />
        </label>
        <label className="block">
          <span className="text-sm text-muted">Son équipe / un club dont vous parlez</span>
          <input
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            placeholder="el Barça, Francia…"
            className="mt-1 w-full rounded-2xl border-0 bg-paper px-4 py-3 outline-none ring-1 ring-ink/10"
          />
        </label>
        <label className="block">
          <span className="text-sm text-muted">Un lieu de voyage</span>
          <input
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            placeholder="Portugal, la carretera…"
            className="mt-1 w-full rounded-2xl border-0 bg-paper px-4 py-3 outline-none ring-1 ring-ink/10"
          />
        </label>
        <label className="block">
          <span className="text-sm text-muted">Clé OpenAI (optionnelle)</span>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="mt-1 w-full rounded-2xl border-0 bg-paper px-4 py-3 outline-none ring-1 ring-ink/10"
          />
        </label>
        <p className="text-sm text-muted">
          Sans clé, Amigo répond avec des phrases préparées. Avec une clé, il improvise sur le quotidien, le foot et
          les voyages. La clé reste dans ce navigateur.
        </p>
        <button type="submit" className="rounded-full bg-terracotta px-5 py-3 text-foam">
          {saved ? "Guardado" : "Enregistrer"}
        </button>
      </form>

      <section className="text-sm text-muted">
        <p>Micro : {speech.listen ? "OK" : "non détecté (Chrome / Safari)"}</p>
        <p>Voix : {speech.speak ? "OK" : "non détectée"}</p>
      </section>
    </div>
  );
}
