import { ROOTS, NOTE_ALIASES, QUALITIES, QUALITY_ALIASES } from "./dictionary";
import type { ChordEvent, RootNote, ParsedChord } from "./types";

let idCounter = 0;
export const makeId = () => `chord-${Date.now()}-${idCounter++}`;

export function normalizeRoot(raw: string): RootNote | null {
  if (!raw) return null;
  const fixed = (raw[0].toUpperCase() + raw.slice(1)) as string;
  if ((ROOTS as string[]).includes(fixed)) return fixed as RootNote;
  if (NOTE_ALIASES[fixed]) return NOTE_ALIASES[fixed];
  return null;
}

/**
 * 「Cmaj7/E」のようなコードトークンを root / quality / bass に分解する。
 * ベース音だけが不正な場合（例: Cmaj7/XYZ）は、コード本体とは別に
 * kind: "bass" のエラーを返す。これにより呼び出し側で
 * 「ベース音 XYZ を認識できません」という専用メッセージを出せる。
 */
export function parseChordToken(token: string): ParsedChord {
  const slashIdx = token.indexOf("/");
  const mainToken = slashIdx === -1 ? token : token.slice(0, slashIdx);
  const bassToken = slashIdx === -1 ? null : token.slice(slashIdx + 1);

  const mainMatch = mainToken.match(
    /^([A-Ga-g](?:#|b)?)(maj7|add9|sus2|sus4|min7|dim|aug|maj|min|m7|m|M|7)?$/
  );
  if (!mainMatch) return { ok: false, kind: "chord" };

  const root = normalizeRoot(mainMatch[1]);
  const qualityKey = QUALITY_ALIASES[mainMatch[2] || ""];
  if (!root || !qualityKey) return { ok: false, kind: "chord" };

  let bass: RootNote | undefined;
  if (bassToken !== null) {
    if (bassToken === "" || !/^[A-Ga-g](?:#|b)?$/.test(bassToken)) {
      return { ok: false, kind: "bass", bassToken };
    }
    const normalized = normalizeRoot(bassToken);
    if (!normalized) return { ok: false, kind: "bass", bassToken };
    bass = normalized;
  }

  return { ok: true, root, quality: qualityKey, bass };
}

export interface ParseProgressionResult {
  chords?: ChordEvent[];
  error?: string;
}

export function parseProgressionText(text: string): ParseProgressionResult {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) {
    return {
      error: "コードが入力されていません。\n\n例えば、\nCmaj7 2\nAm7 2\nFmaj7 2\nG7 2\nのように入力してください。",
    };
  }
  const chords: ChordEvent[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(/\s+/);
    if (parts.length !== 2) {
      return {
        error: `${i + 1}行目「${line}」の形式が正しくありません。\n\n「コード名 拍数」の形式で、半角スペース区切りで入力してください。\n例：\nCmaj7 2\nAm7 2\nFmaj7 2\nG7 2`,
      };
    }
    const [chordToken, beatToken] = parts;
    const beats = parseFloat(beatToken);
    if (isNaN(beats) || beats <= 0 || beats > 8) {
      return { error: `${i + 1}行目の拍数「${beatToken}」が正しくありません。\n\n0.5〜8の範囲の数字で指定してください（例：2 や 1.5）。` };
    }
    const parsed = parseChordToken(chordToken);
    if (!parsed.ok) {
      if (parsed.kind === "bass") {
        return {
          error: `「${parsed.bassToken}」というベース音は認識できません。\n\nベース音には\nC, C#, D, Eb, E, F, F#, G, Ab, A, Bb, B\nのいずれかを指定してください。\n例：Cmaj7/E　G/B　Am7/G`,
        };
      }
      return {
        error: `「${chordToken}」というコードは認識できません。\n\n例えば、\nCmaj7\nAm7\nG7\nDsus4\nG/B\nのようなコードを入力してください。`,
      };
    }
    chords.push({
      id: makeId(),
      root: parsed.root,
      quality: parsed.quality,
      bass: parsed.bass,
      durationBeats: beats,
    });
  }
  return { chords };
}

export function chordToToken(chord: ChordEvent): string {
  const symbol = QUALITIES[chord.quality].symbol;
  const bass = chord.bass && chord.bass !== chord.root ? `/${chord.bass}` : "";
  return `${chord.root}${symbol}${bass}`;
}

export function chordsToText(chords: ChordEvent[]): string {
  return chords.map((c) => `${chordToToken(c)} ${c.durationBeats}`).join("\n");
}
