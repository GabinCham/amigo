"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { curriculum, todaySuggestedDay, THEME_LABEL } from "@/lib/curriculum";
import { getProgress } from "@/lib/storage";
import { dueCount } from "@/lib/srs";

export function HomeClient() {
  const [ready, setReady] = useState(false);
  const [completed, setCompleted] = useState<number[]>([]);
  const [streak, setStreak] = useState(0);

  const [due, setDue] = useState(0);

  useEffect(() => {
    const progress = getProgress();
    setCompleted(progress.completedDays);
    setStreak(progress.streak);
    setDue(dueCount());
    setReady(true);
  }, []);

  const day = todaySuggestedDay(completed);
  const lesson = curriculum[day - 1];
  const count = completed.length;

  if (!ready) {
    return <p className="text-muted">Cargando…</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="text-sm uppercase tracking-[0.25em] text-muted">30 días con Amigo</p>
        <h1 className="mt-2 font-serif text-5xl leading-[1.05]">Parler assez pour appeler Amigo.</h1>
        <p className="mt-3 max-w-md text-muted">
          Quotidien, souvenirs de voyage, foot. Tu as déjà quelques mots. Ici tu les sors à voix haute.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-foam p-4 ring-1 ring-ink/5">
          <p className="text-sm text-muted">Série</p>
          <p className="font-serif text-3xl">{streak} j</p>
        </div>
        <div className="rounded-3xl bg-foam p-4 ring-1 ring-ink/5">
          <p className="text-sm text-muted">Jours faits</p>
          <p className="font-serif text-3xl">{count} / 30</p>
        </div>
      </div>

      {due > 0 ? (
        <Link href="/revisar" className="rounded-[2rem] bg-olive px-6 py-6 text-foam">
          <p className="text-xs uppercase tracking-[0.2em] text-foam/70">D’abord</p>
          <p className="mt-2 font-serif text-3xl">
            {due} phrase{due > 1 ? "s" : ""} à revoir
          </p>
          <p className="mt-2 text-foam/85">Les mots d’hier, avant le nouveau jour.</p>
        </Link>
      ) : null}

      <Link
        href={`/dia/${day}`}
        className="rounded-[2rem] bg-terracotta px-6 py-6 text-foam shadow-md"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-foam/70">
          Jour {day} · {THEME_LABEL[lesson.theme]}
        </p>
        <p className="mt-2 font-serif text-3xl">{lesson.title}</p>
        <p className="mt-2 text-foam/85">{lesson.goal}</p>
        <p className="mt-4 text-sm">Ouvrir la leçon →</p>
      </Link>

      <Link href="/mots" className="rounded-[2rem] bg-olive/90 px-6 py-6 text-foam">
        <p className="text-xs uppercase tracking-[0.2em] text-foam/70">Chaque jour</p>
        <p className="mt-2 font-serif text-3xl">500 mots</p>
        <p className="mt-2 text-foam/85">Français → tu écris l’espagnol. Vert jusqu’à minuit.</p>
      </Link>

      <Link href="/mensaje" className="rounded-[2rem] bg-gold/25 px-6 py-6 ring-1 ring-gold/50">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Vrai Amigo</p>
        <p className="mt-2 font-serif text-3xl">Message 30s</p>
        <p className="mt-2 text-muted">Copie le texte ou envoie un vocal. Même bancal.</p>
      </Link>

      <Link
        href="/hablar"
        className="rounded-[2rem] bg-pitch px-6 py-6 text-foam"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-gold">Libre</p>
        <p className="mt-2 font-serif text-3xl">Hablar con Amigo</p>
        <p className="mt-2 text-foam/75">
          Conversation ouverte. Sans clé API, Amigo reste simple. Avec une clé OpenAI, il suit vraiment.
        </p>
      </Link>
    </div>
  );
}
