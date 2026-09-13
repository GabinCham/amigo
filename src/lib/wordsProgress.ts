"use client";

import { WORDS_500 } from "./words500";

export type WordsDay = {
  date: string;
  validated: string[];
  diploma: boolean;
};

const KEY = "amigo-words-500";

export function localDateStamp() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function emptyDay(): WordsDay {
  return { date: localDateStamp(), validated: [], diploma: false };
}

export function getWordsDay(): WordsDay {
  if (typeof window === "undefined") return emptyDay();
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as WordsDay) : emptyDay();
    if (parsed.date !== localDateStamp()) return emptyDay();
    return {
      date: parsed.date,
      validated: Array.isArray(parsed.validated) ? parsed.validated : [],
      diploma: Boolean(parsed.diploma),
    };
  } catch {
    return emptyDay();
  }
}

function save(day: WordsDay) {
  localStorage.setItem(KEY, JSON.stringify(day));
}

export function markWordValid(id: string) {
  const day = getWordsDay();
  if (!day.validated.includes(id)) day.validated.push(id);
  if (day.validated.length >= WORDS_500.length) day.diploma = true;
  save(day);
  return day;
}

export function remainingWords(day: WordsDay) {
  const done = new Set(day.validated);
  return WORDS_500.filter((word) => !done.has(word.id));
}

export function msUntilMidnight() {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 50);
  return next.getTime() - now.getTime();
}
