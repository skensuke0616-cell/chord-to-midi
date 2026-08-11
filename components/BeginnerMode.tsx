"use client";

import { Plus } from "lucide-react";
import ChordCard from "./ChordCard";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { ChordEvent, SelectMethod } from "@/lib/chord/types";

interface BeginnerModeProps {
  chords: ChordEvent[];
  playingIndex: number;
  selectMethod: SelectMethod;
  setSelectMethod: (m: SelectMethod) => void;
  openAdvancedId: string | null;
  setOpenAdvancedId: (id: string | null) => void;
  updateChord: (id: string, patch: Partial<ChordEvent>) => void;
  removeChord: (id: string) => void;
  moveChord: (id: string, dir: 1 | -1) => void;
  addChord: () => void;
  previewChord: (chord: ChordEvent) => void;
}

export default function BeginnerMode({
  chords, playingIndex, selectMethod, setSelectMethod,
  openAdvancedId, setOpenAdvancedId, updateChord, removeChord, moveChord, addChord, previewChord,
}: BeginnerModeProps) {
  const { t } = useLanguage();

  return (
    <>
      <div className="c2m-method-toggle" role="tablist" aria-label="Choose method">
        <button
          className={selectMethod === "name" ? "active" : ""}
          onClick={() => setSelectMethod("name")}
          role="tab"
          aria-selected={selectMethod === "name"}
        >
          {t.methodName}
        </button>
        <button
          className={selectMethod === "mood" ? "active" : ""}
          onClick={() => setSelectMethod("mood")}
          role="tab"
          aria-selected={selectMethod === "mood"}
        >
          {t.methodMood}
        </button>
      </div>

      <div className="c2m-steps">
        {chords.length === 0 && (
          <div className="c2m-empty">{t.empty}</div>
        )}
        {chords.map((chord, i) => (
          <ChordCard
            key={chord.id}
            chord={chord}
            index={i}
            total={chords.length}
            isPlaying={playingIndex === i}
            selectMethod={selectMethod}
            isAdvancedOpen={openAdvancedId === chord.id}
            onToggleAdvanced={() => setOpenAdvancedId(openAdvancedId === chord.id ? null : chord.id)}
            onUpdate={(patch) => updateChord(chord.id, patch)}
            onRemove={() => removeChord(chord.id)}
            onMove={(dir) => moveChord(chord.id, dir)}
            onPreview={() => previewChord(chord)}
          />
        ))}
      </div>

      <button className="c2m-add-btn" onClick={addChord} style={{ marginTop: 10 }}>
        <Plus size={16} /> {t.addChord}
      </button>
    </>
  );
}
