"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function LanguageToggle() {
  const { lang, setLang, t } = useLanguage();

  return (
    <div className="c2m-lang-toggle" role="group" aria-label={t.languageLabel}>
      <button
        className={lang === "ja" ? "active" : ""}
        onClick={() => setLang("ja")}
        aria-pressed={lang === "ja"}
      >
        日本語
      </button>
      <span className="c2m-lang-sep">|</span>
      <button
        className={lang === "en" ? "active" : ""}
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
      >
        English
      </button>
    </div>
  );
}
