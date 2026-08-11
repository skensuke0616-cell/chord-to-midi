// コード進行の内部データ構造。
// 初心者UI（コード名／雰囲気）・テキスト入力UIは、最終的にすべてこの
// ChordEvent[] に変換される。MIDI生成・試聴（Tone.js）はこの構造だけを見る。

export type RootNote =
  | "C" | "C#" | "D" | "Eb" | "E" | "F"
  | "F#" | "G" | "Ab" | "A" | "Bb" | "B";

export type ChordQualityKey =
  | "major" | "minor" | "7" | "maj7" | "m7"
  | "sus2" | "sus4" | "add9" | "dim" | "aug";

/**
 * ノート分割。拍数（durationBeats）が何であっても、鳴っているノートを指定した回数で
 * 均等分割する（拍数に依存しない固定の分割数）。
 * "none"（未指定時のデフォルト）は既存MVPの挙動と完全に同じ（分割しない。拍数いっぱい1回だけ鳴らす）。
 * "half"=2分割 / "quarter"=4分割 / "eighth"=8分割 / "sixteenth"=16分割。
 */
export type NoteSubdivision = "none" | "half" | "quarter" | "eighth" | "sixteenth";

export interface ChordEvent {
  id: string;
  root: RootNote;
  quality: ChordQualityKey;
  /**
   * ベース音（オンコード用）。
   * undefined、または root と同じ値の場合は「オンコードではない通常のコード」として扱う。
   */
  bass?: RootNote;
  durationBeats: number;
  /**
   * 未指定の場合は "none"（＝既存MVPと同じ、拍数いっぱい1回だけ鳴らす）として扱う。
   */
  subdivision?: NoteSubdivision;
}

export interface ChordQualityDef {
  symbol: string;
  label: string;
  intervals: number[];
}

export interface BeginnerLabel {
  key: ChordQualityKey;
  emoji: string;
  label: string;
  labelEn: string;
}

export type SelectMethod = "name" | "mood";
export type InputMode = "beginner" | "text";

export interface ParsedChordOk {
  ok: true;
  root: RootNote;
  quality: ChordQualityKey;
  bass?: RootNote;
}

export interface ParsedChordError {
  ok: false;
  kind: "chord" | "bass";
  bassToken?: string;
}

export type ParsedChord = ParsedChordOk | ParsedChordError;
