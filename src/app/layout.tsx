import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { Shell } from "@/components/Shell";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Amigo — 30 días para hablar",
  description: "Parler espagnol avec Amigo : quotidien, voyage, foot.",
  appleWebApp: { capable: true, title: "Amigo" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#c45c26",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${outfit.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
