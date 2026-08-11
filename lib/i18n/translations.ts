export type Lang = "ja" | "en";

// UI文字列の辞書の型。すべてのフィールドを string / 関数として明示することで、
// ja / en の両方が同じ型に収まるようにする（リテラル型のまま推論させると、
// 日本語の文字列型と英語の文字列型が別物として扱われ、代入できずビルドエラーになるため）。
export interface TranslationStrings {
  appTitle: string;
  appTitleArrow: string;
  appTitleSuffix: string;
  tagline: string;
  subtitle: string;

  navGuide: string;

  globalSettings: string;
  bpm: string;
  pitchShift: string;
  pitchShiftHint: (n: number) => string;
  rhythmGuide: string;
  rhythmGuideOn: string;
  rhythmGuideOff: string;

  tabBeginner: string;
  tabText: string;

  methodName: string;
  methodMood: string;

  root: string;
  chordType: string;
  beats: string;
  beatsUnit: (n: number) => string;
  subdivision: string;
  subdivisionNone: string;
  subdivisionHalf: string;
  subdivisionQuarter: string;
  subdivisionEighth: string;
  subdivisionSixteenth: string;

  advancedSettings: string;
  bassNote: string;
  bassNoteDefault: (root: string) => string;
  onChordHint: string;
  onChordHintCurrent: (token: string) => string;
  onChordHintExample: (root: string, symbol: string) => string;

  preview: string;
  playAll: string;
  stop: string;
  downloadMidi: string;

  addChord: string;
  empty: string;
  emptyHint: string;

  metaLine: (chords: number, beats: number, bpm: number) => string;

  textExample: string;
  textExample2: string;
  applyText: string;

  languageLabel: string;
}

// UI文字列の辞書。コンポーネント側に直接文字列を書かず、ここに集約する。
// 新しい言語を追加する場合は、TranslationStrings型に合わせたオブジェクトを1つ追加するだけでよい。
export const translations: Record<Lang, TranslationStrings> = {
  ja: {
    appTitle: "CHORD",
    appTitleArrow: "→",
    appTitleSuffix: "MIDI",
    tagline: "Chord Progression → MIDI",
    subtitle:
      "コードを知らなくてもコード進行が作れる。作った進行はそのままMIDIに書き出せる。すべてブラウザ内で処理され、サーバーには何も送信されません。",

    navGuide: "使い方 / How to use",

    globalSettings: "全体設定",
    bpm: "BPM",
    pitchShift: "Pitch Shift",
    pitchShiftHint: (n: number) =>
      n === 0
        ? "移調なし（元のコードのまま再生されます）"
        : `全体を${n > 0 ? "+" : ""}${n}半音移調して再生・書き出します（コード表示は元のまま）`,
    rhythmGuide: "Rhythm Guide",
    rhythmGuideOn: "ON",
    rhythmGuideOff: "OFF",

    tabBeginner: "かんたん入力",
    tabText: "コード名で入力",

    methodName: "コード名から選ぶ",
    methodMood: "雰囲気から選ぶ",

    root: "ルート音",
    chordType: "コードタイプ",
    beats: "拍数",
    beatsUnit: (n: number) => `${n}拍`,
    subdivision: "ノート分割",
    subdivisionNone: "なし（分割しない）",
    subdivisionHalf: "2分割",
    subdivisionQuarter: "4分割",
    subdivisionEighth: "8分割",
    subdivisionSixteenth: "16分割",

    advancedSettings: "詳細設定",
    bassNote: "ベース音",
    bassNoteDefault: (root: string) => `ルート音（${root}）`,
    onChordHint: "💡 ベース音を変えると、コードの一番下の音を変えられます。",
    onChordHintCurrent: (token: string) => `今は ${token} になっています。`,
    onChordHintExample: (root: string, symbol: string) =>
      `例：${root}${symbol} のベース音をEにすると ${root}${symbol}/E になります。`,

    preview: "試聴",
    playAll: "全体を試聴",
    stop: "停止",
    downloadMidi: "MIDIをダウンロード",

    addChord: "コードを追加",
    empty: "まだコードがありません。「＋ コードを追加」から始めましょう。",
    emptyHint: "コードを追加すると、試聴とMIDIダウンロードができるようになります。「＋ コードを追加」から始めましょう。",

    metaLine: (chords: number, beats: number, bpm: number) =>
      `${chords} chords · ${beats} beats total · ${bpm} BPM`,

    textExample: "1行に「コード名 拍数」を半角スペースで区切って入力してください。",
    textExample2: "例：Cmaj7 2 ／ Am7 2 ／ Dsus4 1.5 ／ G/B 2",
    applyText: "反映する",

    languageLabel: "Language",
  },
  en: {
    appTitle: "CHORD",
    appTitleArrow: "→",
    appTitleSuffix: "MIDI",
    tagline: "Chord Progression → MIDI",
    subtitle:
      "Build a chord progression without knowing any music theory, then export it straight to MIDI. Everything runs in your browser — nothing is sent to a server.",

    navGuide: "Guide",

    globalSettings: "Global Settings",
    bpm: "BPM",
    pitchShift: "Pitch Shift",
    pitchShiftHint: (n: number) =>
      n === 0
        ? "No transposition (plays back as written)"
        : `Playback and export are transposed ${n > 0 ? "+" : ""}${n} semitones (chord names shown stay unchanged)`,
    rhythmGuide: "Rhythm Guide",
    rhythmGuideOn: "ON",
    rhythmGuideOff: "OFF",

    tabBeginner: "Easy Input",
    tabText: "Text Input",

    methodName: "Choose by Chord Name",
    methodMood: "Choose by Mood",

    root: "Root",
    chordType: "Chord Type",
    beats: "Beats",
    beatsUnit: (n: number) => `${n} beat${n === 1 ? "" : "s"}`,
    subdivision: "Note Subdivision",
    subdivisionNone: "None (no split)",
    subdivisionHalf: "Split ×2",
    subdivisionQuarter: "Split ×4",
    subdivisionEighth: "Split ×8",
    subdivisionSixteenth: "Split ×16",

    advancedSettings: "Advanced Settings",
    bassNote: "Bass Note",
    bassNoteDefault: (root: string) => `Root (${root})`,
    onChordHint: "💡 Changing the bass note changes the lowest note of the chord.",
    onChordHintCurrent: (token: string) => `Currently: ${token}.`,
    onChordHintExample: (root: string, symbol: string) =>
      `Example: setting the bass of ${root}${symbol} to E gives ${root}${symbol}/E.`,

    preview: "Preview",
    playAll: "Play All",
    stop: "Stop",
    downloadMidi: "Download MIDI",

    addChord: "Add Chord",
    empty: 'No chords yet. Start with "+ Add Chord" below.',
    emptyHint: 'Add a chord to enable preview and MIDI download. Start with "+ Add Chord" below.',

    metaLine: (chords: number, beats: number, bpm: number) =>
      `${chords} chords · ${beats} beats total · ${bpm} BPM`,

    textExample: 'Enter one "ChordName Beats" pair per line, separated by a space.',
    textExample2: "Example: Cmaj7 2 / Am7 2 / Dsus4 1.5 / G/B 2",
    applyText: "Apply",

    languageLabel: "Language",
  },
};

export type TranslationKey = keyof TranslationStrings;
