import type { Metadata } from "next";
import { Inter, Press_Start_2P } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/language-context";
import { getLang } from "@/lib/get-lang";

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const pixelFont = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pixel",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LeadScout AI",
  description: "Inteligencia comercial para detectar negocios con brechas digitales",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const initialLang = await getLang();

  return (
    <html
      lang={initialLang}
      className={`${bodyFont.variable} ${pixelFont.variable} h-full overflow-x-hidden`}
    >
      <body className="h-full flex">
        <LanguageProvider initialLang={initialLang}>{children}</LanguageProvider>
      </body>
    </html>
  );
}
