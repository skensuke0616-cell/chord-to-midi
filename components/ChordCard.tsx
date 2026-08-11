"use client";

import { ChevronDown, ChevronUp, Settings2, Trash2, Volume2 } from "lucide-react";
import { ROOTS, DURATIONS, QUALITIES, BEGINNER_LABELS, SUBDIVISIONS } from "@/lib/chord/dictionary";
import { chordToToken } from "@/lib/chord/parser";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { ChordEvent, SelectMethod, NoteSubdivision } from "@/lib/chord/types";

interface ChordCardProps {
  chord: ChordEvent;
  index: number;
  total: number;
  isPlaying: boolean;
  selectMethod: SelectMethod;
  isAdvancedOpen: boolean;
  onToggleAdvanced: () => void;
  onUpdate: (patch: Partial<ChordEvent>) => void;
  onRemove: () => void;
  onMove: (dir: 1 | -1) => void;
  onPreview: () => void;
}

export default function ChordCard({
  chord, index, total, isPlaying, selectMethod,
  isAdvancedOpen, onToggleAdvanced, onUpdate, onRemove, onMove, onPreview,
}: ChordCardProps) {
  const { lang, t } = useLanguage();
  const isOnChord = !!chord.bass && chord.bass !== chord.root;
  const subdivisionLabel = (key: NoteSubdivision) => {
    switch (key) {
      case "none": return t.subdivisionNone;
      case "half": return t.subdivisionHalf;
      case "quarter": return t.subdivisionQuarter;
      case "eighth": return t.subdivisionEighth;
      case "sixteenth": return t.subdivisionSixteenth;
    }
  };

  return (
    <div className={`c2m-card ${isPlaying ? "playing" : ""}`}>
      <div className="c2m-card-top">
        <span className="c2m-step-num">{index + 1}</span>

        <div className="c2m-card-controls">
          <select
            className="c2m-select"
            value={chord.root}
            onChange={(e) => onUpdate({ root: e.target.value as ChordEvent["root"] })}
            aria-label={t.root}
          >
            {ROOTS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>

          {selectMethod === "mood" ? (
            <select
              className="c2m-select"
              value={chord.quality}
              onChange={(e) => onUpdate({ quality: e.target.value as ChordEvent["quality"] })}
              aria-label={t.chordType}
              style={{ minWidth: 118 }}
            >
              {BEGINNER_LABELS.map((b) => (
                <option key={b.key} value={b.key}>{b.emoji} {lang === "en" ? b.labelEn : b.label}</option>
              ))}
            </select>
          ) : (
            <select
              className="c2m-select"
              value={chord.quality}
              onChange={(e) => onUpdate({ quality: e.target.value as ChordEvent["quality"] })}
              aria-label={t.chordType}
              style={{ minWidth: 118 }}
            >
              {Object.entries(QUALITIES).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          )}

          <select
            className="c2m-select"
            value={chord.durationBeats}
            onChange={(e) => onUpdate({ durationBeats: Number(e.target.value) })}
            aria-label={t.beats}
          >
            {DURATIONS.map((d) => <option key={d} value={d}>{t.beatsUnit(d)}</option>)}
          </select>
        </div>

        <div className="c2m-card-actions">
          <button className="c2m-icon-btn accent" onClick={onPreview} title={t.preview} aria-label={t.preview}>
            <Volume2 size={15} />
          </button>
          <button className="c2m-icon-btn" onClick={onToggleAdvanced} title={t.advancedSettings} aria-label={t.advancedSettings}>
            <Settings2 size={15} />
          </button>
          <button className="c2m-icon-btn" onClick={() => onMove(-1)} disabled={index === 0} title="Move up" aria-label="Move up">
            <ChevronUp size={15} />
          </button>
          <button className="c2m-icon-btn" onClick={() => onMove(1)} disabled={index === total - 1} title="Move down" aria-label="Move down">
            <ChevronDown size={15} />
          </button>
          <button className="c2m-icon-btn danger" onClick={onRemove} title="Delete" aria-label="Delete">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className={`c2m-chord-display ${isOnChord ? "on-chord" : ""}`}>
        {chordToToken(chord)}
      </div>

      {isAdvancedOpen && (
        <div className="c2m-advanced">
          <div className="c2m-advanced-row">
            <div className="c2m-field">
              <label>{t.chordType}</label>
              <select
                className="c2m-select"
                value={chord.quality}
                onChange={(e) => onUpdate({ quality: e.target.value as ChordEvent["quality"] })}
              >
                {Object.entries(QUALITIES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div className="c2m-field">
              <label>{t.bassNote}</label>
              <select
                className="c2m-select"
                value={chord.bass || ""}
                onChange={(e) => onUpdate({ bass: (e.target.value || undefined) as ChordEvent["bass"] })}
              >
                <option value="">{t.bassNoteDefault(chord.root)}</option>
                {ROOTS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="c2m-field">
              <label>{t.subdivision}</label>
              <select
                className="c2m-select"
                value={chord.subdivision ?? "none"}
                onChange={(e) => onUpdate({ subdivision: e.target.value as NoteSubdivision })}
              >
                {SUBDIVISIONS.map((s) => (
                  <option key={s.key} value={s.key}>{subdivisionLabel(s.key)}</option>
                ))}
              </select>
            </div>
          </div>
          <p className="c2m-oncho-hint">
            {t.onChordHint}
            {isOnChord ? (
              <>
                <br />
                {t.onChordHintCurrent(chordToToken(chord))}
              </>
            ) : (
              <>
                <br />
                {t.onChordHintExample(chord.root, QUALITIES[chord.quality].symbol || "")}
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
