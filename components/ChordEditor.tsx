"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { Download, Music2, Play, Square, Type } from "lucide-react";
import BeginnerMode from "./BeginnerMode";
import TextMode from "./TextMode";
import {
  DEFAULT_BPM, MAX_BPM, MIN_BPM,
  MIN_PITCH_SHIFT, MAX_PITCH_SHIFT, DEFAULT_PITCH_SHIFT,
} from "@/lib/chord/dictionary";
import { chordsToText, makeId, parseProgressionText } from "@/lib/chord/parser";
import { getChordMidiNotes, getChordHits, applyPitchShift, midiToNoteName } from "@/lib/midi/noteUtils";
import { downloadMidi } from "@/lib/midi/midiWriter";
import type { ChordEvent, InputMode, SelectMethod } from "@/lib/chord/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const defaultChords = (): ChordEvent[] => [
  { id: makeId(), root: "C", quality: "maj7", durationBeats: 2, subdivision: "none" },
  { id: makeId(), root: "A", quality: "m7", durationBeats: 2, subdivision: "none" },
  { id: makeId(), root: "F", quality: "maj7", durationBeats: 2, subdivision: "none" },
  { id: makeId(), root: "G", quality: "7", durationBeats: 2, subdivision: "none" },
];

export default function ChordEditor() {
  const { t } = useLanguage();

  // Key（調）はMVPのUIからは削除。「Keyから提案する」等の将来機能のために
  // 内部状態としてのみ残してある（現状は未使用・未表示）。
  const [, setProgressionKey] = useState("C");
  void setProgressionKey;

  const [bpm, setBpm] = useState(DEFAULT_BPM); // 確定値。試聴・MIDI出力はこちらを参照
  const [bpmInput, setBpmInput] = useState(String(DEFAULT_BPM));
  const [mode, setMode] = useState<InputMode>("beginner");
  const [chords, setChords] = useState<ChordEvent[]>(defaultChords);
  const [openAdvancedId, setOpenAdvancedId] = useState<string | null>(null);
  const [selectMethod, setSelectMethod] = useState<SelectMethod>("name");

  // ── Global Settings（全体設定。個々のコードではなく進行全体に効く） ──
  const [pitchShift, setPitchShift] = useState(DEFAULT_PITCH_SHIFT);
  const [rhythmGuideOn, setRhythmGuideOn] = useState(false); // デフォルトOFF

  const [textValue, setTextValue] = useState(() => chordsToText(defaultChords()));
  const [textError, setTextError] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [playingIndex, setPlayingIndex] = useState(-1);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toneRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const synthRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rhythmSynthRef = useRef<any>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    let disposed = false;
    import("tone").then((Tone) => {
      if (disposed) return;
      toneRef.current = Tone;

      synthRef.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle" },
        envelope: { attack: 0.015, decay: 0.25, sustain: 0.55, release: 0.9 },
      }).toDestination();
      synthRef.current.volume.value = -6;

      try {
        // Rhythm Guide用: 短いハイハット/パーカッション系の音（メトロノームの「カッ」ではなく）
        rhythmSynthRef.current = new Tone.NoiseSynth({
          noise: { type: "white" },
          envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.02 },
        }).toDestination();
        rhythmSynthRef.current.volume.value = -8;
      } catch (err) {
        console.error("Rhythm Guide synth failed to initialize:", err);
      }
    }).catch((err) => {
      console.error("Failed to load Tone.js:", err);
    });
    return () => {
      disposed = true;
      timeoutsRef.current.forEach(clearTimeout);
      synthRef.current?.dispose();
      rhythmSynthRef.current?.dispose();
    };
  }, []);

  const stopPlayback = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    synthRef.current?.releaseAll();
    setIsPlaying(false);
    setPlayingIndex(-1);
  }, []);

  /**
   * Rhythm Guideを、指定した開始時刻から totalBeats 拍分スケジュールする。
   * 1拍目（と、その後4拍ごと）だけアクセント（高め・強め）、それ以外は通常音。
   * Tone.js試聴専用。MIDI書き出しには含めない（既存のMIDI生成ロジックへの影響を避けるため）。
   */
  const scheduleRhythmGuide = useCallback((Tone: any, startTime: number, totalBeats: number) => {
    if (!rhythmGuideOn || !rhythmSynthRef.current) return;
    const secPerBeat = 60 / bpm;
    const beatCount = Math.max(1, Math.round(totalBeats));
    for (let beatIndex = 0; beatIndex < beatCount; beatIndex++) {
      const isAccent = beatIndex % 4 === 0;
      const time = startTime + beatIndex * secPerBeat;
      // NoiseSynth.triggerAttackRelease は (duration, time, velocity) の順で、
      // 通常のSynthと違い音程名は取らない。アクセント(1拍目)は長さ・velocityの両方を
      // 上げて、はっきり区別できるようにする。
      rhythmSynthRef.current.triggerAttackRelease(isAccent ? 0.08 : 0.035, time, isAccent ? 1 : 0.55);
    }
  }, [rhythmGuideOn, bpm]);

  /**
   * 1コード分の再生をスケジュールする共通ロジック。
   * Chord data → Pitch Shift → Note Subdivision → Rhythm/Timing の順に処理し、
   * MIDI生成（lib/midi/midiWriter.ts）と同じ getChordHits() / applyPitchShift() を使うことで、
   * 「ブラウザで聞いたもの」と「ダウンロードしたMIDI」を一致させる。
   * 戻り値はこのコードの合計再生時間（秒）。
   */
  const scheduleChordPlayback = useCallback((Tone: any, startTime: number, chord: ChordEvent): number => {
    const secPerBeat = 60 / bpm;
    const notes = applyPitchShift(getChordMidiNotes(chord), pitchShift).map(midiToNoteName);
    const hits = getChordHits(chord);

    // 分割再生（2回以上）の場合、既存の余韻(release: 0.9秒)のままだと前の発音の余韻が
    // 次の発音と重なり続け、タイミングが不揃い（シャッフルしているよう）に聞こえてしまう。
    // ヒットの長さに応じて余韻を短くすることで、意図した均等なリズムとして聞こえるようにする。
    // "none"（1回だけ鳴らす、既存MVPと同じ挙動）の場合は、元の余韻(0.9秒)をそのまま使う。
    if (hits.length > 1) {
      const hitDurSec = hits[0].lengthBeats * secPerBeat;
      const adaptiveRelease = Math.max(0.02, Math.min(0.9, hitDurSec * 0.5));
      synthRef.current.set({ envelope: { release: adaptiveRelease } });
    } else {
      synthRef.current.set({ envelope: { release: 0.9 } });
    }

    hits.forEach((hit) => {
      const hitStart = startTime + hit.offsetBeats * secPerBeat;
      const hitDur = hit.lengthBeats * secPerBeat;
      synthRef.current.triggerAttackRelease(notes, hitDur * 0.95, hitStart);
    });
    return chord.durationBeats * secPerBeat;
  }, [bpm, pitchShift]);

  const previewChord = useCallback(async (chord: ChordEvent) => {
    const Tone = toneRef.current;
    if (!Tone || !synthRef.current) return;
    await Tone.start();
    stopPlayback();
    const startTime = Tone.now();
    scheduleChordPlayback(Tone, startTime, chord);
    scheduleRhythmGuide(Tone, startTime, chord.durationBeats);
  }, [stopPlayback, scheduleChordPlayback, scheduleRhythmGuide]);

  const playAll = useCallback(async () => {
    const Tone = toneRef.current;
    if (!Tone || !synthRef.current || chords.length === 0) return;
    await Tone.start();
    stopPlayback();
    const startTime = Tone.now();
    let t = 0;
    const newTimeouts: ReturnType<typeof setTimeout>[] = [];
    chords.forEach((c, idx) => {
      const durSec = scheduleChordPlayback(Tone, startTime + t, c);
      newTimeouts.push(setTimeout(() => setPlayingIndex(idx), t * 1000));
      t += durSec;
    });
    const totalBeats = chords.reduce((s, c) => s + c.durationBeats, 0);
    scheduleRhythmGuide(Tone, startTime, totalBeats);
    newTimeouts.push(setTimeout(() => { setIsPlaying(false); setPlayingIndex(-1); }, t * 1000));
    timeoutsRef.current = newTimeouts;
    setIsPlaying(true);
  }, [chords, stopPlayback, scheduleChordPlayback, scheduleRhythmGuide]);

  // ── コード編集操作 ──
  const updateChord = (id: string, patch: Partial<ChordEvent>) =>
    setChords((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const addChord = () =>
    setChords((cs) => [...cs, { id: makeId(), root: "C", quality: "major", durationBeats: 2, subdivision: "none" }]);

  const removeChord = (id: string) => setChords((cs) => cs.filter((c) => c.id !== id));

  const moveChord = (id: string, dir: 1 | -1) =>
    setChords((cs) => {
      const i = cs.findIndex((c) => c.id === id);
      const j = i + dir;
      if (j < 0 || j >= cs.length) return cs;
      const next = [...cs];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  // ── モード切替（かんたん入力 ⇔ テキスト入力の相互変換） ──
  // 注意: テキスト形式は現行仕様（「コード名 拍数」）を維持しているため、
  // ノート分割（subdivision）はテキスト⇔かんたん入力の往復では保持されない
  // （テキスト側は常に quarter 相当として扱われる）。将来、テキスト文法を拡張する場合の
  // 検討事項として残している。
  const switchToText = () => {
    setTextValue(chordsToText(chords));
    setTextError(null);
    setMode("text");
  };
  const applyText = () => {
    const result = parseProgressionText(textValue);
    if (result.error) {
      setTextError(result.error);
      return;
    }
    setTextError(null);
    if (result.chords) setChords(result.chords);
  };
  const switchToBeginner = () => {
    const result = parseProgressionText(textValue);
    if (!result.error && result.chords) setChords(result.chords);
    setMode("beginner");
  };

  // ── BPM入力 ──
  const handleBpmChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "" || /^[0-9]{1,3}$/.test(raw)) {
      setBpmInput(raw);
    }
  };
  const commitBpm = () => {
    let n = parseInt(bpmInput, 10);
    if (isNaN(n)) n = bpm;
    n = Math.max(MIN_BPM, Math.min(MAX_BPM, n));
    setBpm(n);
    setBpmInput(String(n));
  };
  const handleBpmKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") e.currentTarget.blur();
  };

  // ── Pitch Shift入力（BPMと同様、範囲外にならないようclamp） ──
  const handlePitchShiftChange = (e: ChangeEvent<HTMLInputElement>) => {
    const n = Math.max(MIN_PITCH_SHIFT, Math.min(MAX_PITCH_SHIFT, Number(e.target.value) || 0));
    setPitchShift(n);
  };

  const totalBeats = chords.reduce((s, c) => s + c.durationBeats, 0);

  return (
    <div className="c2m-page-wrap">
      <header className="c2m-header">
        <p className="c2m-eyebrow">{t.tagline}</p>
        <h1 className="c2m-title">{t.appTitle} <span>{t.appTitleArrow}</span> {t.appTitleSuffix}</h1>
        <p className="c2m-sub">{t.subtitle}</p>
      </header>

      <section className="c2m-panel c2m-global-settings">
        <p className="c2m-global-settings-title">{t.globalSettings}</p>
        <div className="c2m-global-settings-row">
          <div className="c2m-field">
            <label>{t.bpm}</label>
            <input
              className="c2m-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={3}
              value={bpmInput}
              onChange={handleBpmChange}
              onBlur={commitBpm}
              onKeyDown={handleBpmKeyDown}
              aria-label={`BPM (${MIN_BPM}-${MAX_BPM})`}
            />
          </div>

          <div className="c2m-field">
            <label>{t.pitchShift}</label>
            <input
              className="c2m-input"
              type="number"
              min={MIN_PITCH_SHIFT}
              max={MAX_PITCH_SHIFT}
              step={1}
              value={pitchShift}
              onChange={handlePitchShiftChange}
              aria-label={`${t.pitchShift} (${MIN_PITCH_SHIFT}...${MAX_PITCH_SHIFT})`}
            />
          </div>

          <div className="c2m-field">
            <label>{t.rhythmGuide}</label>
            <button
              className={`c2m-toggle-btn ${rhythmGuideOn ? "on" : ""}`}
              onClick={() => setRhythmGuideOn((v) => !v)}
              aria-pressed={rhythmGuideOn}
            >
              {rhythmGuideOn ? t.rhythmGuideOn : t.rhythmGuideOff}
            </button>
          </div>
        </div>
        <p className="c2m-pitch-shift-hint">{t.pitchShiftHint(pitchShift)}</p>
      </section>

      <div className="c2m-tabs">
        <button className={`c2m-tab ${mode === "beginner" ? "active" : ""}`} onClick={switchToBeginner}>
          <Music2 size={15} /> {t.tabBeginner}
        </button>
        <button className={`c2m-tab ${mode === "text" ? "active" : ""}`} onClick={switchToText}>
          <Type size={15} /> {t.tabText}
        </button>
      </div>

      {mode === "beginner" ? (
        <BeginnerMode
          chords={chords}
          playingIndex={playingIndex}
          selectMethod={selectMethod}
          setSelectMethod={setSelectMethod}
          openAdvancedId={openAdvancedId}
          setOpenAdvancedId={setOpenAdvancedId}
          updateChord={updateChord}
          removeChord={removeChord}
          moveChord={moveChord}
          addChord={addChord}
          previewChord={previewChord}
        />
      ) : (
        <TextMode
          textValue={textValue}
          setTextValue={setTextValue}
          textError={textError}
          applyText={applyText}
        />
      )}

      <div className="c2m-transport">
        <button
          className="c2m-btn c2m-btn-primary"
          onClick={isPlaying ? stopPlayback : playAll}
          disabled={chords.length === 0}
        >
          {isPlaying ? <><Square size={16} /> {t.stop}</> : <><Play size={16} /> {t.playAll}</>}
        </button>
        <button
          className="c2m-btn c2m-btn-amber"
          onClick={() => downloadMidi(chords, bpm, { pitchShift })}
          disabled={chords.length === 0}
        >
          <Download size={16} /> {t.downloadMidi}
        </button>
      </div>
      {chords.length === 0 ? (
        <p className="c2m-meta c2m-meta-hint">{t.emptyHint}</p>
      ) : (
        <p className="c2m-meta">{t.metaLine(chords.length, totalBeats, bpm)}</p>
      )}
    </div>
  );
}
