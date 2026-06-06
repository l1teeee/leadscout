import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/contexts/language-context";

export const metadata: Metadata = {
  title: "LeadScout AI",
  description: "Inteligencia comercial para detectar negocios con brechas digitales",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full overflow-x-hidden">
      <body className="h-full flex">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
