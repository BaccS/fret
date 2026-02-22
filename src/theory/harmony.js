import { NOTES, SCALES, CHORD_DEGREES, CHORD_INT, ROMAN, SCALE_FAMILIES } from '../constants/notes';

export const ni = (n) => NOTES.indexOf(n);

export const getScaleNotes = (root, key) => {
  const r = ni(root);
  return (SCALES[key]?.intervals || SCALES.major.intervals).map(i => NOTES[(r+i)%12]);
};

const sfxMap = {
  maj: { 3:"", 7:"maj7", 9:"maj9", 11:"maj11" },
  min: { 3:"m", 7:"m7", 9:"m9", 11:"m11" },
  dim: { 3:"°", 7:"°7", 9:"°9", 11:"°11" },
  aug: { 3:"+", 7:"+7", 9:"+9", 11:"+11" },
};

export const buildChord = (chordRoot, type, ext, degree, idx) => {
  const e = ext || 3;
  const cInt = (CHORD_INT[type] && CHORD_INT[type][e]) || (CHORD_INT[type] && CHORD_INT[type][3]) || [0,4,7];
  const notes = cInt.map(ci => NOTES[(ni(chordRoot)+ci)%12]);
  const sfx = (sfxMap[type] && sfxMap[type][e]) || "";
  return { degree, root: chordRoot, type, name: chordRoot + sfx, notes, idx, ext: e };
};

export const getHarmony = (root, key, ext) => {
  const r = ni(root);
  const ints = SCALES[key]?.intervals || SCALES.major.intervals;
  const degs = CHORD_DEGREES[key] || CHORD_DEGREES.major;
  return ints.map((interval, i) => {
    const cr   = NOTES[(r+interval)%12];
    const type = degs[i] || "maj";
    return buildChord(cr, type, ext, ROMAN[i] || "?", i);
  });
};

export const resolveAdaptiveSoloScale = (soloFamily, chordType) => {
  const family = SCALE_FAMILIES[soloFamily];
  if (!family) return soloFamily;
  return family[chordType] || family.maj;
};
