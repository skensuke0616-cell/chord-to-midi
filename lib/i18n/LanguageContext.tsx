"use client";

import { createContext, useContext, useMemo, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { translations, type Lang, type TranslationStrings } from "./translations";

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: TranslationStrings;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // 既存サイトの体験を変えないため、デフォルトは日本語のまま。
  const [lang, setLang] = useState<Lang>("ja");

  // <html lang="..."> をトグルに合わせて更新（レイアウト自体はサーバーレンダリングのため
  // 静的に "ja" を指定しており、ここではクライアント側で上書きする）。
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, setLang, t: translations[lang] }),
    [lang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
