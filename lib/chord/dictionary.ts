import type { RootNote, ChordQualityKey, ChordQualityDef, BeginnerLabel, NoteSubdivision } from "./types";

export const ROOTS: RootNote[] = [
  "C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B",
];

export const ROOT_SEMITONES: Record<RootNote, number> = {
  C: 0, "C#": 1, D: 2, Eb: 3, E: 4, F: 5,
  "F#": 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11,
};

// テキスト入力での表記ゆれ（D#, Db, Gb...）を正規のルート名12種類に正規化する
export const NOTE_ALIASES: Record<string, RootNote> = {
  "D#": "Eb", "G#": "Ab", "A#": "Bb",
  Db: "C#", Gb: "F#", Cb: "B", "E#": "F", "B#": "C", Fb: "E",
};

// コード辞書。UIから完全に独立した純粋なデータ構造。
// 将来 maj9 / m9 / 6 / m6 / 7sus4 / add11 / maj7#11 などを追加する場合は
// ここにエントリを1つ足すだけでよい。UI側は Object.entries(QUALITIES) を
// 参照しているため、選択肢へ自動的に反映される。
export const QUALITIES: Record<ChordQualityKey, ChordQualityDef> = {
  major: { symbol: "", label: "Major", intervals: [0, 4, 7] },
  minor: { symbol: "m", label: "Minor", intervals: [0, 3, 7] },
  "7": { symbol: "7", label: "7", intervals: [0, 4, 7, 10] },
  maj7: { symbol: "maj7", label: "Major 7", intervals: [0, 4, 7, 11] },
  m7: { symbol: "m7", label: "Minor 7", intervals: [0, 3, 7, 10] },
  sus2: { symbol: "sus2", label: "sus2", intervals: [0, 2, 7] },
  sus4: { symbol: "sus4", label: "sus4", intervals: [0, 5, 7] },
  add9: { symbol: "add9", label: "add9", intervals: [0, 4, 7, 14] },
  dim: { symbol: "dim", label: "dim", intervals: [0, 3, 6] },
  aug: { symbol: "aug", label: "aug", intervals: [0, 4, 8] },
};

// 初心者向け「雰囲気」ラベル ⇔ コードタイプの対応（1:1）
export const BEGINNER_LABELS: BeginnerLabel[] = [
  { key: "major", emoji: "☀️", label: "明るい", labelEn: "Bright" },
  { key: "minor", emoji: "🌙", label: "暗い", labelEn: "Dark" },
  { key: "maj7", emoji: "✨", label: "おしゃれ", labelEn: "Stylish" },
  { key: "m7", emoji: "🌆", label: "切ない", labelEn: "Bittersweet" },
  { key: "7", emoji: "⚡", label: "緊張感", labelEn: "Tense" },
  { key: "sus4", emoji: "☁️", label: "浮遊感", labelEn: "Floating" },
  { key: "sus2", emoji: "💧", label: "透明感", labelEn: "Clear" },
  { key: "add9", emoji: "🌿", label: "ふわっと", labelEn: "Soft" },
  { key: "dim", emoji: "🌀", label: "不安定", labelEn: "Unstable" },
  { key: "aug", emoji: "🔮", label: "不思議", labelEn: "Mysterious" },
];

export const DURATIONS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4];

export const MIN_BPM = 20;
export const MAX_BPM = 300;
export const DEFAULT_BPM = 96;

// ノート分割の選択肢。"none" が既存MVPと同じ挙動（デフォルト）。
// splitCount: 拍数に関わらず、鳴っているノートを何分割するか（nullは分割しない=常に1回）。
export const SUBDIVISIONS: { key: NoteSubdivision; splitCount: number | null }[] = [
  { key: "none", splitCount: null },
  { key: "half", splitCount: 2 },
  { key: "quarter", splitCount: 4 },
  { key: "eighth", splitCount: 8 },
  { key: "sixteenth", splitCount: 16 },
];

export const MIN_PITCH_SHIFT = -12;
export const MAX_PITCH_SHIFT = 12;
export const DEFAULT_PITCH_SHIFT = 0;

// テキスト入力のコード表記（maj7, m, 7, sus4...）⇔ 内部の ChordQualityKey
export const QUALITY_ALIASES: Record<string, ChordQualityKey> = {
  "": "major", maj: "major", M: "major",
  m: "minor", min: "minor",
  "7": "7",
  maj7: "maj7", M7: "maj7",
  m7: "m7", min7: "m7",
  sus2: "sus2", sus4: "sus4", add9: "add9",
  dim: "dim", aug: "aug", "+": "aug",
};
