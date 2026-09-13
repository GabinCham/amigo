import type { ChatTurn } from "./types";

type Reply = {
  es: string;
  fr: string;
  correction: ChatTurn["correction"];
};

export async function askAmigoAi(input: {
  apiKey: string;
  userName: string;
  history: { role: "amigo" | "you"; es: string }[];
  lastUser: string;
}): Promise<Reply> {
  const messages = [
    {
      role: "system",
      content: `Tu es Amigo, l'ami espagnol de ${input.userName}, français débutant (quelques mots).
Vous parlez de quotidien, de souvenirs de voyage (souvent van / route) et de foot.
Règles:
- Réponds en espagnol simple, phrases courtes, A1-A2, tutoiement.
- Un ami, pas un prof. Chaleureux, un peu taquin.
- Pose UNE question à la fin.
- Corrige au plus UNE erreur, seulement si elle casse le sens.
- Si ${input.userName} parle français, réponds quand même en espagnol très simple.
Réponds UNIQUEMENT en JSON:
{"es":"...","fr":"traduction courte","correction":null}
ou correction: {"heard":"...","better":"...","noteFr":"..."}`,
    },
    ...input.history.slice(-12).map((turn) => ({
      role: turn.role === "amigo" ? "assistant" : "user",
      content: turn.es,
    })),
    { role: "user", content: input.lastUser },
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages,
    }),
  });

  if (!response.ok) throw new Error("openai");
  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as Reply;
  return {
    es: parsed.es,
    fr: parsed.fr ?? "",
    correction: parsed.correction ?? null,
  };
}
