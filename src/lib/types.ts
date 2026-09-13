export type Theme = "quotidien" | "foot" | "voyage";

export type Phrase = {
  es: string;
  fr: string;
};

export type Drill = {
  promptFr: string;
  sample: string;
  expect: string[];
};

export type DayLesson = {
  day: number;
  theme: Theme;
  title: string;
  goal: string;
  amigoOpens: string;
  amigoOpensFr: string;
  phrases: Phrase[];
  drills: Drill[];
};

export type ChatTurn = {
  role: "amigo" | "you";
  es: string;
  fr?: string;
  correction?: {
    heard: string;
    better: string;
    noteFr: string;
  } | null;
};
