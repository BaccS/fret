import { NOTES } from './notes';

export const OPEN_MIDI = [40, 45, 50, 55, 59, 64]; // E2 A2 D3 G3 B3 E4
export const NOTE_MIDI = { C:48,"C#":49,D:50,"D#":51,E:52,F:53,"F#":54,G:55,"G#":56,A:57,"A#":58,B:59 };
export const OPEN_STR = [4,9,2,7,11,4];
export const STR_NAMES = ["E","A","D","G","B","e"];
export const FRETS = 15;
export const FRET_MARKERS = [3,5,7,9,12,15];
export const DOUBLE_MARKERS = new Set([12]);

const buildFretboard = (frets) => {
  const n = frets || 15;
  return Array.from({length:6}, (_,s) =>
    Array.from({length:n+1}, (_,f) => ({ s, f, note: NOTES[(OPEN_STR[s]+f)%12] }))
  );
};

export const FRETBOARD_DATA = buildFretboard(FRETS);
