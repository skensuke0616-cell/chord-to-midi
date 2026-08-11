"use client";

import { AlertCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface TextModeProps {
  textValue: string;
  setTextValue: (v: string) => void;
  textError: string | null;
  applyText: () => void;
}

export default function TextMode({ textValue, setTextValue, textError, applyText }: TextModeProps) {
  const { t } = useLanguage();
  return (
    <div className="c2m-panel">
      <p className="c2m-text-example">
        {t.textExample}<br />
        {t.textExample2}
      </p>
      <textarea
        className="c2m-textarea"
        value={textValue}
        onChange={(e) => setTextValue(e.target.value)}
        spellCheck={false}
      />
      {textError && (
        <div className="c2m-error">
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>{textError}</span>
        </div>
      )}
      <button className="c2m-btn c2m-btn-ghost" style={{ marginTop: 12 }} onClick={applyText}>
        {t.applyText}
      </button>
    </div>
  );
}
