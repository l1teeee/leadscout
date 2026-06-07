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

function isLang(value: string | null | undefined): value is Lang {
  return value === "en" || value === "es";
}

function getCookieLang(): Lang | null {
  if (typeof document === "undefined") return null;

  const value = document.cookie
    .split("; ")
    .find((row) => row.startsWith("ls_lang="))
    ?.split("=")[1];

  return isLang(value) ? value : null;
}

export function LanguageProvider({
  children,
  initialLang = "es",
}: {
  children: React.ReactNode;
  initialLang?: Lang;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  function setLang(l: Lang) {
    setLangState(l);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("ls_lang", l);
    }
    if (typeof document !== "undefined") {
      document.cookie = `ls_lang=${l}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (getCookieLang()) {
      localStorage.setItem("ls_lang", initialLang);
      return;
    }

    const stored = localStorage.getItem("ls_lang");
    if (isLang(stored) && stored !== initialLang) {
      window.setTimeout(() => setLang(stored), 0);
      return;
    }

    localStorage.setItem("ls_lang", initialLang);
  }, [initialLang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
