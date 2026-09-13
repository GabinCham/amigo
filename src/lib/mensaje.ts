import type { Settings } from "./storage";

const SURVIVAL = [
  { es: "¿Puedes repetir?", fr: "Tu peux répéter ?" },
  { es: "Más despacio, por favor", fr: "Plus lentement, s’il te plaît" },
  { es: "No entiendo", fr: "Je ne comprends pas" },
  { es: "¿Cómo se dice…?", fr: "Comment on dit… ?" },
  { es: "Estoy aprendiendo español", fr: "J’apprends l’espagnol" },
];

export { SURVIVAL };

export function dailyPrompt(settings: Settings) {
  const team = settings.team.trim() || "el partido";
  const place = settings.place.trim() || "un viaje";
  const prompts = [
    {
      fr: "Dis à Amigo comment tu vas vraiment, puis pose-lui une question.",
      seed: "Hola Amigo, estoy bien. Un poco cansado. ¿Qué tal tú?",
    },
    {
      fr: `Parle du foot (${team}) en deux phrases.`,
      seed: `Ayer vi ${team}. Fue un buen partido. ¿Lo viste?`,
    },
    {
      fr: `Un souvenir à ${place}, tout simple.`,
      seed: `Me acuerdo de ${place}. Fue increíble. Quiero volver.`,
    },
  ];
  return prompts[new Date().getDate() % prompts.length];
}
