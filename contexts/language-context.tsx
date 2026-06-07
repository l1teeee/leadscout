"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/i18n-types";

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

const FADE_MS = 220;

export function LanguageProvider({
  children,
  initialLang = "es",
}: {
  children: React.ReactNode;
  initialLang?: Lang;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function setLang(l: Lang) {
    if (l === lang) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    // Fade out
    document.body.style.opacity = "0";
    document.body.style.transition = `opacity ${FADE_MS}ms ease`;

    timerRef.current = setTimeout(() => {
      setLangState(l);
      if (typeof localStorage !== "undefined") localStorage.setItem("ls_lang", l);
      document.cookie = `ls_lang=${l}; path=/; max-age=31536000; SameSite=Lax`;

      // Fade back in
      requestAnimationFrame(() => {
        document.body.style.opacity = "1";
      });
    }, FADE_MS);
  }

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    // Ensure body transition is set on mount (remove it after first use)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
