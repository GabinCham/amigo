"use client";

type Reco = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  onresult: ((event: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type RecognitionCtor = new () => Reco;

function getRecognition(): Reco | null {
  if (typeof window === "undefined") return null;
  const Ctor = (window as Window & { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor })
    .SpeechRecognition ||
    (window as Window & { webkitSpeechRecognition?: RecognitionCtor }).webkitSpeechRecognition;
  if (!Ctor) return null;
  const recognition = new Ctor();
  recognition.lang = "es-ES";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  return recognition;
}

export function canSpeak() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function canListen() {
  if (typeof window === "undefined") return false;
  const w = window as Window & { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export function speakSpanish(text: string) {
  return new Promise<void>((resolve) => {
    if (!canSpeak()) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    utterance.rate = 0.88;
    const voices = window.speechSynthesis.getVoices();
    const spanish =
      voices.find((voice) => voice.lang.startsWith("es") && /google|microsoft|juan|monica|jorge|paulina/i.test(voice.name)) ||
      voices.find((voice) => voice.lang.startsWith("es"));
    if (spanish) utterance.voice = spanish;
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    utterance.onend = finish;
    utterance.onerror = finish;
    window.setTimeout(finish, Math.min(12000, 800 + text.length * 80));
    window.speechSynthesis.speak(utterance);
  });
}

export function listenOnce(): Promise<string> {
  return new Promise((resolve, reject) => {
    const recognition = getRecognition();
    if (!recognition) {
      reject(new Error("Le micro n’est pas dispo. Ouvre Chrome ou Safari."));
      return;
    }
    let done = false;
    recognition.onresult = (event) => {
      done = true;
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      resolve(transcript);
    };
    recognition.onerror = (event) => {
      if (done) return;
      done = true;
      reject(new Error(event.error === "not-allowed" ? "Micro bloqué." : "Je n’ai pas entendu."));
    };
    recognition.onend = () => {
      if (done) return;
      done = true;
      reject(new Error("Je n’ai pas entendu."));
    };
    recognition.start();
  });
}
