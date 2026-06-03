import type { Metadata } from "next";
import "./globals.css";
import { Inter, Press_Start_2P } from "next/font/google";

const pixel = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pixel",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "LeadScout AI",
  description: "Inteligencia comercial para detectar negocios con brechas digitales",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`h-full ${inter.variable} ${pixel.variable}`}>
      <body className="h-full flex">{children}</body>
    </html>
  );
}
