import { normalizeSpeech } from "./normalize";

type LocalReply = {
  es: string;
  fr: string;
};

const replies: { keys: string[]; reply: LocalReply }[] = [
  { keys: ["hola", "hey", "buenas"], reply: { es: "¡Hola! Qué alegría. ¿Qué tal?", fr: "Salut ! Content. Ça va ?" } },
  { keys: ["bien", "guay", "fenomenal"], reply: { es: "Me alegro. ¿Qué haces hoy?", fr: "Content. Tu fais quoi aujourd’hui ?" } },
  { keys: ["cansado", "cansada", "fatiga"], reply: { es: "Normal. Un café y listo. ¿Quieres hablar un poco?", fr: "Normal. Un café et ça va. Tu veux parler un peu ?" } },
  { keys: ["cafe", "café"], reply: { es: "Yo también quiero café. ¿Con leche o solo?", fr: "Moi aussi je veux un café. Avec du lait ou serré ?" } },
  { keys: ["trabajo", "currar", "oficina"], reply: { es: "El trabajo es así. Luego descansas. ¿Hay partido hoy?", fr: "Le taff c’est comme ça. Après tu te poses. Il y a match aujourd’hui ?" } },
  { keys: ["futbol", "fútbol", "partido", "gol", "barca", "madrid"], reply: { es: "El fútbol es vida. ¿Viste el último partido?", fr: "Le foot c’est la vie. Tu as vu le dernier match ?" } },
  { keys: ["gane", "ganamos", "ganar"], reply: { es: "¡Bien! Eso pide otra historia. ¿Celebramos?", fr: "Bien ! Ça mérite une autre histoire. On fête ?" } },
  { keys: ["perdi", "perdimos", "perder"], reply: { es: "Uf. Pasa. La próxima vez. ¿Quieres contar un viaje para olvidar?", fr: "Ouf. Ça arrive. La prochaine fois. Tu racontes un voyage pour oublier ?" } },
  { keys: ["viaje", "van", "carretera", "playa", "montana", "montaña"], reply: { es: "Qué recuerdos. ¿Cuál es tu mejor día de viaje?", fr: "Quels souvenirs. C’est quoi ton meilleur jour de voyage ?" } },
  { keys: ["espana", "españa", "madrid", "barcelona"], reply: { es: "España te espera. Un día vamos. ¿Playa o montaña?", fr: "L’Espagne t’attend. Un jour on y va. Plage ou montagne ?" } },
  { keys: ["playa"], reply: { es: "La playa, sí. El mar, el van, nada de prisa. ¿Fuiste hace mucho?", fr: "La plage, oui. La mer, le van, aucune urgence. C’était il y a longtemps ?" } },
  { keys: ["si", "claro", "vale", "ok"], reply: { es: "Genial. Cuéntame más. Un poco despacio.", fr: "Génial. Raconte-moi plus. Un peu lentement." } },
  { keys: ["no", "nada"], reply: { es: "No pasa nada. Hablamos de otra cosa. ¿Fútbol o un viaje?", fr: "C’est pas grave. On parle d’autre chose. Foot ou un voyage ?" } },
  { keys: ["gracias"], reply: { es: "Hombre, para eso estamos. ¿Seguimos un minuto más?", fr: "Ben, c’est pour ça qu’on est là. On continue une minute ?" } },
  { keys: ["adios", "luego", "pronto"], reply: { es: "Hasta luego. Hablamos pronto, de verdad.", fr: "À plus. On se parle bientôt, pour de vrai." } },
];

const fallback: LocalReply = {
  es: "Te escucho. Dime algo de tu día, de un viaje o del fútbol.",
  fr: "Je t’écoute. Parle-moi de ta journée, d’un voyage ou du foot.",
};

export function localAmigoReply(heard: string): LocalReply {
  const text = normalizeSpeech(heard);
  if (!text) return fallback;
  for (const item of replies) {
    if (item.keys.some((key) => text.includes(normalizeSpeech(key)))) {
      return item.reply;
    }
  }
  return fallback;
}
