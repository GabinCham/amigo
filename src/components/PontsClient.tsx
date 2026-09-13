"use client";

import Link from "next/link";
import { families, falseFriends } from "@/lib/cognates";

export function PontsClient() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-sm uppercase tracking-[0.2em] text-muted">Cousins FR → ES</p>
        <h1 className="font-serif text-4xl">Ponts</h1>
        <p className="mt-3 text-muted">
          Oui : beaucoup de mots français et espagnols viennent du latin. Une terminaison française a souvent une
          jumelle espagnole. Ce n’est pas une loi : ça marche pour les cousins, pas pour pain, maison ou aller.
        </p>
      </header>

      <Link href="/ponts/mix" className="rounded-3xl bg-pitch px-5 py-5 text-foam">
        <p className="text-xs uppercase tracking-[0.2em] text-gold">Test mixte</p>
        <p className="mt-1 font-serif text-2xl">Toutes les familles</p>
        <p className="mt-1 text-sm text-foam/75">8 mots au hasard. Français → espagnol.</p>
      </Link>

      <ol className="grid gap-2">
        {families.map((family) => (
          <li key={family.id}>
            <Link href={`/ponts/${family.id}`} className="block rounded-2xl bg-foam px-4 py-3 ring-1 ring-ink/5">
              <p className="text-xs text-muted">
                {family.frEnd} → {family.esEnd}
              </p>
              <p className="font-serif text-xl">{family.title}</p>
              <p className="text-sm text-muted">{family.pairs.length} mots</p>
            </Link>
          </li>
        ))}
      </ol>

      <section className="rounded-3xl bg-foam p-5 ring-1 ring-ink/5">
        <h2 className="font-serif text-2xl">Faux amis</h2>
        <p className="mt-1 text-sm text-muted">Même tête, autre sens. Ne les transforme pas.</p>
        <ul className="mt-3 space-y-3">
          {falseFriends.map((item) => (
            <li key={item.fr}>
              <p className="font-medium">
                {item.fr} ≠ {item.es}
              </p>
              {item.note ? <p className="text-sm text-muted">{item.note}</p> : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
