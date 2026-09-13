"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Jour" },
  { href: "/plan", label: "Plan" },
  { href: "/mots", label: "500" },
  { href: "/ponts", label: "Ponts" },
  { href: "/hablar", label: "Parler" },
  { href: "/ajustes", label: "Toi" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();

  return (
    <div className="grain flex min-h-full flex-col">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pb-24 pt-6 sm:max-w-2xl sm:px-6">
        {children}
      </div>
      <nav className="safe-bottom fixed bottom-0 left-0 right-0 border-t border-ink/10 bg-foam/95 backdrop-blur">
        <div className="mx-auto grid max-w-lg grid-cols-6 sm:max-w-2xl">
          {items.map((item) => {
            const active = item.href === "/" ? path === "/" : path === item.href || path.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`py-3 text-center text-xs sm:text-sm ${active ? "font-semibold text-terracotta" : "text-muted"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
