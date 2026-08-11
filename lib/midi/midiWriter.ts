import { getChordMidiNotes, getChordHits, applyPitchShift } from "./noteUtils";
import type { ChordEvent } from "../chord/types";

function encodeVLQ(value: number): number[] {
  let bytes = [value & 0x7f];
  value >>= 7;
  while (value > 0) {
    bytes.unshift((value & 0x7f) | 0x80);
    value >>= 7;
  }
  return bytes;
}

export interface MidiExportOptions {
  velocity?: number;
  /** 全体Pitch Shift（-12〜+12 semitones）。元の ChordEvent は書き換えない。 */
  pitchShift?: number;
}

/**
 * ChordEvent[] → Standard MIDI File (Format 0) のバイト列。
 * 外部ライブラリに依存しない自前実装。
 *
 * 処理の流れ: Chord data → Pitch Shift → Note Subdivision → Rhythm/Timing → MIDI
 * （Tone.js試聴側 = ChordEditor.tsx の scheduleChordPlayback() と同じ考え方を共有する）
 *
 * 重要: note-off は note-on より前に並べる（同時刻イベントの order で保証）。
 * 隣り合う発音（別コード、または同一コードのノート分割による連続再発音）に同じ音高が
 * 含まれる場合、逆順だと新しいnote-onの直後に前の発音のnote-offが来てしまい、
 * 鳴ったばかりの音が消えてしまうバグがあった。ノート分割の連続再発音（レトリガー）は
 * この順序があって初めて正しく1音ずつ聞こえる。
 */
export function buildMidiFile(chords: ChordEvent[], bpm: number, options: MidiExportOptions = {}): Uint8Array {
  const { velocity = 92, pitchShift = 0 } = options;
  const ticksPerBeat = 480;
  const events: { tick: number; order: number; bytes: number[] }[] = [];
  let tick = 0;

  chords.forEach((chord) => {
    const notes = applyPitchShift(getChordMidiNotes(chord), pitchShift);
    const hits = getChordHits(chord);
    hits.forEach((hit) => {
      const hitStartTick = tick + Math.round(hit.offsetBeats * ticksPerBeat);
      const hitEndTick = tick + Math.round((hit.offsetBeats + hit.lengthBeats) * ticksPerBeat);
      notes.forEach((n) => events.push({ tick: hitEndTick, order: 0, bytes: [0x80, n, 0] })); // note-off
      notes.forEach((n) => events.push({ tick: hitStartTick, order: 1, bytes: [0x90, n, velocity] })); // note-on
    });
    tick += Math.round(chord.durationBeats * ticksPerBeat);
  });

  events.sort((a, b) => a.tick - b.tick || a.order - b.order);

  const trackBytes: number[] = [];
  const microsPerBeat = Math.round(60000000 / bpm);
  trackBytes.push(
    ...encodeVLQ(0), 0xff, 0x51, 0x03,
    (microsPerBeat >> 16) & 0xff, (microsPerBeat >> 8) & 0xff, microsPerBeat & 0xff
  );
  trackBytes.push(...encodeVLQ(0), 0xff, 0x58, 0x04, 4, 2, 24, 8); // 4/4 time signature

  let lastTick = 0;
  events.forEach((ev) => {
    const delta = ev.tick - lastTick;
    trackBytes.push(...encodeVLQ(delta), ...ev.bytes);
    lastTick = ev.tick;
  });
  trackBytes.push(...encodeVLQ(0), 0xff, 0x2f, 0x00); // end of track

  const headerBytes = [
    0x4d, 0x54, 0x68, 0x64, // "MThd"
    0, 0, 0, 6,
    0, 0, // format 0
    0, 1, // ntrks
    (ticksPerBeat >> 8) & 0xff, ticksPerBeat & 0xff,
  ];
  const trackHeader = [
    0x4d, 0x54, 0x72, 0x6b, // "MTrk"
    (trackBytes.length >>> 24) & 0xff,
    (trackBytes.length >>> 16) & 0xff,
    (trackBytes.length >>> 8) & 0xff,
    trackBytes.length & 0xff,
  ];

  return new Uint8Array([...headerBytes, ...trackHeader, ...trackBytes]);
}

export function downloadMidi(chords: ChordEvent[], bpm: number, options: MidiExportOptions = {}): void {
  const bytes = buildMidiFile(chords, bpm, options);
  const blob = new Blob([bytes as BlobPart], { type: "audio/midi" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "chord-progression.mid";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
