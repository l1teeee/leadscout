"use client";
import { createContext, useContext, useState } from "react";
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
    return stored === "en" || stored === "es" ? stored : "es";
  });

  function setLang(l: Lang) {
    setLangState(l);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("ls_lang", l);
    }
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
