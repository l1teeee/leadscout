import type { Metadata } from "next";
import { Inter, Press_Start_2P } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/language-context";
import { getLang } from "@/lib/get-lang";
import { translations } from "@/lib/i18n";

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

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const seo = translations[lang].seo;

  return {
    metadataBase: new URL("https://scoutia.dev"),
    title: seo.title,
    description: seo.description,
    icons: {
      icon: [
        {
          url: "/favicon.svg?v=2",
          type: "image/svg+xml",
        },
      ],
    },
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: "https://scoutia.dev",
      siteName: seo.title,
    },
  };
}

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
