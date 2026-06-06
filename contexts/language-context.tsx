"use client";
import { createContext, useContext, useEffect, useState } from "react";
import type { Lang } from "@/lib/i18n";

type LanguageContextValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
};

const LanguageContext = createContext<LanguageContextValue>({
  lang: "es",
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof localStorage === "undefined") return "es";

    const stored = localStorage.getItem("ls_lang") as Lang | null;
    if (stored === "en" || stored === "es") return stored;

    const cookieLang = document.cookie
      .split("; ")
      .find((row) => row.startsWith("ls_lang="))
      ?.split("=")[1] as Lang | undefined;

    return cookieLang === "en" || cookieLang === "es" ? cookieLang : "es";
  });

  function setLang(l: Lang) {
    setLangState(l);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("ls_lang", l);
    }
    document.cookie = `ls_lang=${l}; path=/; max-age=31536000; SameSite=Lax`;
  }

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
