import { ROOT_SEMITONES } from "../chord/dictionary";
import { QUALITIES } from "../chord/dictionary";
import type { ChordEvent } from "../chord/types";

/**
 * ChordEvent → 実際に鳴らすMIDIノート番号の配列。
 * 試聴（Tone.js）とMIDI生成（buildMidiFile）の両方がこの関数だけを参照する。
 * ここを変更すれば両方に一貫して反映される。
 */
export function getChordMidiNotes(chord: ChordEvent): number[] {
  const baseMidi = 60 + ROOT_SEMITONES[chord.root]; // オクターブ4を基準
  const chordTones = QUALITIES[chord.quality].intervals.map((iv) => baseMidi + iv);
  const bassRoot = chord.bass || chord.root;
  const bassMidi = 48 + ROOT_SEMITONES[bassRoot]; // 1オクターブ下 = 最低音として配置
  const all = [bassMidi, ...chordTones];
  return [...new Set(all)].sort((a, b) => a - b);
}

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export function midiToNoteName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  return `${NOTE_NAMES[midi % 12]}${octave}`;
}

/**
 * 全体Pitch Shiftの適用。元の ChordEvent は一切書き換えず、
 * 「発音する直前」の音の配列に対してだけ半音単位でオフセットする。
 * MIDIの有効範囲(0-127)を超えないようクランプする。
 */
export function applyPitchShift(notes: number[], semitones: number): number[] {
  if (!semitones) return notes;
  return notes.map((n) => Math.max(0, Math.min(127, n + semitones)));
}

export interface ChordHit {
  /** コードの開始位置からのオフセット（拍単位） */
  offsetBeats: number;
  /** この1回の発音の長さ（拍単位） */
  lengthBeats: number;
}

// 分割数。拍数に関わらず、鳴っているノートを常にこの数で均等分割する。
const SPLIT_COUNTS: Record<"half" | "quarter" | "eighth" | "sixteenth", number> = {
  half: 2,
  quarter: 4,
  eighth: 8,
  sixteenth: 16,
};

/**
 * ノート分割（Note Subdivision）に応じて、1つのコードを「何回・いつ」発音するかを計算する。
 * Tone.js試聴とMIDI生成の両方がこの関数を共有するため、挙動が食い違うことはない。
 *
 * 拍数（durationBeats）が何であっても、そのノートを指定した回数で均等分割する。
 * - "none"（またはsubdivision未指定）: 分割しない。1回だけ、拍数いっぱい鳴らす（既存MVPと同じ挙動）。
 * - "half": 2分割。
 * - "quarter": 4分割。
 * - "eighth": 8分割。
 * - "sixteenth": 16分割。
 *
 * lengthBeats = durationBeats / hitCount で厳密に一定の長さになるため、
 * 発音間隔が不揃いになることはない。
 */
export function getChordHits(chord: { durationBeats: number; subdivision?: "none" | "half" | "quarter" | "eighth" | "sixteenth" }): ChordHit[] {
  const subdivision = chord.subdivision ?? "none";
  if (subdivision === "none") {
    return [{ offsetBeats: 0, lengthBeats: chord.durationBeats }];
  }
  const hitCount = SPLIT_COUNTS[subdivision];
  const lengthBeats = chord.durationBeats / hitCount;
  return Array.from({ length: hitCount }, (_, i) => ({
    offsetBeats: i * lengthBeats,
    lengthBeats,
  }));
}
