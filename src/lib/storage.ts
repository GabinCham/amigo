"use client";

export type Settings = {
  name: string;
  apiKey: string;
  team: string;
  place: string;
};

export type Progress = {
  completedDays: number[];
  lastDay: number | null;
  lastDate: string | null;
  streak: number;
};

const SETTINGS_KEY = "amigo-settings";
const PROGRESS_KEY = "amigo-progress";

const defaultSettings: Settings = { name: "Gabin", apiKey: "", team: "", place: "" };
const defaultProgress: Progress = {
  completedDays: [],
  lastDay: null,
  lastDate: null,
  streak: 0,
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? ({ ...fallback, ...JSON.parse(raw) } as T) : fallback;
  } catch {
    return fallback;
  }
}

export function getSettings() {
  return readJson(SETTINGS_KEY, defaultSettings);
}

export function saveSettings(settings: Settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getProgress() {
  return readJson(PROGRESS_KEY, defaultProgress);
}

export function markDayComplete(day: number) {
  const progress = getProgress();
  const today = new Date().toISOString().slice(0, 10);
  const completedDays = progress.completedDays.includes(day)
    ? progress.completedDays
    : [...progress.completedDays, day].sort((a, b) => a - b);

  let streak = progress.streak;
  if (progress.lastDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const y = yesterday.toISOString().slice(0, 10);
    streak = progress.lastDate === y ? progress.streak + 1 : 1;
  }

  const next: Progress = {
    completedDays,
    lastDay: day,
    lastDate: today,
    streak,
  };
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
  return next;
}
