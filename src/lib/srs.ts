"use client";

export type Card = {
  id: string;
  es: string;
  fr: string;
  interval: number;
  due: string;
  reps: number;
  lapses: number;
};

const DECK_KEY = "amigo-deck";

export function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(stamp: string, days: number) {
  const date = new Date(`${stamp}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function getDeck(): Card[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DECK_KEY);
    return raw ? (JSON.parse(raw) as Card[]) : [];
  } catch {
    return [];
  }
}

function saveDeck(deck: Card[]) {
  localStorage.setItem(DECK_KEY, JSON.stringify(deck));
}

export function dueCards() {
  const today = todayStamp();
  return getDeck().filter((card) => card.due <= today);
}

export function dueCount() {
  return dueCards().length;
}

function upsert(deck: Card[], es: string, fr: string): Card[] {
  const existing = deck.find((card) => card.id === es);
  if (existing) {
    return deck.map((card) => (card.id === es ? { ...card, fr } : card));
  }
  return [
    ...deck,
    {
      id: es,
      es,
      fr,
      interval: 0,
      due: addDays(todayStamp(), 1),
      reps: 0,
      lapses: 0,
    },
  ];
}

export function rememberPhrases(phrases: { es: string; fr: string }[]) {
  let deck = getDeck();
  for (const phrase of phrases) {
    deck = upsert(deck, phrase.es, phrase.fr);
  }
  saveDeck(deck);
}

export function markSpoken(es: string, fr: string, passed: boolean) {
  let deck = upsert(getDeck(), es, fr);
  const today = todayStamp();
  deck = deck.map((card) => {
    if (card.id !== es) return card;
    if (passed) {
      const interval = card.interval <= 0 ? 1 : card.interval === 1 ? 3 : Math.min(21, card.interval * 2);
      return {
        ...card,
        interval,
        due: addDays(today, interval),
        reps: card.reps + 1,
      };
    }
    return {
      ...card,
      interval: 1,
      due: today,
      lapses: card.lapses + 1,
    };
  });
  saveDeck(deck);
}
